"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface GenerateVoucherInput {
  empresaId: string;
  ofertaId: string;
}

export interface GenerateVoucherResult {
  ok: boolean;
  message: string;
  redirectTo?: string;
  voucher?: {
    id: string;
    code: string;
    qr_code_url: string;
    expires_at: string | null;
  };
}

// Caracteres sem ambiguidade (sem 0/O, 1/I/L)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomGroup(len = 4): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return s;
}

function generateVoucherCode(): string {
  return `CHIK-${randomGroup()}-${randomGroup()}`;
}

function getValidationUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}/voucher/validar/${code}`;
}

export async function generateVoucherAction(
  data: GenerateVoucherInput
): Promise<GenerateVoucherResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Faça login ou crie sua conta para gerar vouchers.",
      redirectTo: "/auth/login?redirect=" + encodeURIComponent(`/empresa/${data.empresaId}`),
    };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { ok: false, message: "Perfil não encontrado." };

  if (profile.role === "empresa") {
    return { ok: false, message: "Empresas não geram vouchers — apenas clientes." };
  }

  // Admin gera sempre. Cliente precisa de plano ativo/trial.
  if (profile.role !== "admin") {
    const sub = profile.subscription_status;
    if (sub !== "active" && sub !== "trial") {
      return {
        ok: false,
        message: "Você precisa de um plano ativo para gerar vouchers.",
        redirectTo: "/checkout",
      };
    }
  }

  // Valida oferta
  const { data: oferta, error: errOferta } = await admin
    .from("ofertas")
    .select("id, title, active, price, discount_percent, empresa_id")
    .eq("id", data.ofertaId)
    .eq("empresa_id", data.empresaId)
    .maybeSingle();

  if (errOferta) {
    console.error("[generateVoucher] oferta lookup:", errOferta);
    return { ok: false, message: "Erro ao localizar oferta." };
  }
  if (!oferta) return { ok: false, message: "Oferta não encontrada." };
  if (!oferta.active) return { ok: false, message: "Esta oferta está pausada." };

  const economia = oferta.price && oferta.discount_percent
    ? Number(((oferta.price * oferta.discount_percent) / 100).toFixed(2))
    : null;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Gera código único (até 5 tentativas)
  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateVoucherCode();
    const { data: existing } = await admin
      .from("vouchers")
      .select("id")
      .eq("code", candidate)
      .maybeSingle();
    if (!existing) {
      code = candidate;
      break;
    }
  }
  if (!code) return { ok: false, message: "Erro ao gerar código único." };

  const qrCodeUrl = getValidationUrl(code);

  // Status válidos no banco: active | used | expired | cancelled
  const { data: voucher, error } = await admin
    .from("vouchers")
    .insert({
      code,
      qr_code_url: qrCodeUrl,
      user_id: user.id,
      company_id: data.empresaId,
      offer_id: data.ofertaId,
      status: "active",
      economy_value: economia,
      generated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select("id, code, qr_code_url, expires_at")
    .single();

  if (error) {
    console.error("[generateVoucher] insert:", error);
    return { ok: false, message: `Erro ao gerar voucher: ${error.message}` };
  }

  revalidatePath(`/empresa/${data.empresaId}`);
  return {
    ok: true,
    message: "Voucher gerado com sucesso!",
    voucher: {
      id: voucher.id,
      code: voucher.code,
      qr_code_url: voucher.qr_code_url ?? qrCodeUrl,
      expires_at: voucher.expires_at,
    },
  };
}
