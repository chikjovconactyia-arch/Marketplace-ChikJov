"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface VoucherDetails {
  id: string;
  code: string;
  status: string;
  economy_value: number | null;
  generated_at: string | null;
  validated_at: string | null;
  expires_at: string | null;
  cliente_nome: string | null;
  empresa_nome: string;
  empresa_id: string;
  oferta_titulo: string | null;
  oferta_preco: number | null;
  oferta_desconto: number | null;
}

export interface ValidationResult {
  ok: boolean;
  message: string;
  voucher?: VoucherDetails;
  canValidate?: boolean; // se a empresa logada pode validar este voucher
}

// Localiza empresa do usuário logado
async function getEmpresaIdForUser(userEmail: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: empresario } = await admin
    .from("empresarios")
    .select("id")
    .eq("email", userEmail)
    .maybeSingle();
  if (!empresario) return null;

  const { data: empresa } = await admin
    .from("empresas")
    .select("id")
    .eq("empresario_id", empresario.id)
    .maybeSingle();
  return empresa?.id ?? null;
}

// Busca detalhes do voucher (não valida ainda — apenas exibe)
export async function lookupVoucherAction(code: string): Promise<ValidationResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return { ok: false, message: "Informe o código do voucher." };

  const admin = createAdminClient();
  const { data: voucher, error } = await admin
    .from("vouchers")
    .select(`
      id, code, status, economy_value, generated_at, validated_at, expires_at,
      user_id, company_id, offer_id
    `)
    .eq("code", cleanCode)
    .maybeSingle();

  if (error || !voucher) return { ok: false, message: "Voucher não encontrado." };

  // Busca relações em paralelo
  const [{ data: cliente }, { data: empresa }, { data: oferta }] = await Promise.all([
    voucher.user_id
      ? admin.from("profiles").select("full_name").eq("id", voucher.user_id).maybeSingle()
      : { data: null },
    voucher.company_id
      ? admin.from("empresas").select("id, name").eq("id", voucher.company_id).maybeSingle()
      : { data: null },
    voucher.offer_id
      ? admin.from("ofertas").select("title, price, discount_percent").eq("id", voucher.offer_id).maybeSingle()
      : { data: null },
  ]);

  // Verifica se voucher expirou
  let status = voucher.status;
  if (status === "active" && voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    status = "expired";
  }

  // Verifica se a empresa logada pode validar este voucher
  let canValidate = false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const userEmpresaId = await getEmpresaIdForUser(user.email ?? "");
    canValidate = userEmpresaId === voucher.company_id;
  }

  return {
    ok: true,
    message: "Voucher encontrado.",
    canValidate,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      status: status ?? "unknown",
      economy_value: voucher.economy_value,
      generated_at: voucher.generated_at ?? voucher.expires_at,
      validated_at: voucher.validated_at,
      expires_at: voucher.expires_at,
      cliente_nome: cliente?.full_name ?? null,
      empresa_nome: empresa?.name ?? "Empresa desconhecida",
      empresa_id: empresa?.id ?? "",
      oferta_titulo: oferta?.title ?? null,
      oferta_preco: oferta?.price ?? null,
      oferta_desconto: oferta?.discount_percent ?? null,
    },
  };
}

// Confirma uso do voucher
export async function confirmVoucherAction(code: string): Promise<ValidationResult> {
  const cleanCode = code.trim().toUpperCase();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Faça login para validar." };

  const userEmpresaId = await getEmpresaIdForUser(user.email ?? "");
  if (!userEmpresaId) return { ok: false, message: "Apenas empresas podem validar vouchers." };

  const admin = createAdminClient();

  // Busca voucher
  const { data: voucher } = await admin
    .from("vouchers")
    .select("id, status, company_id, expires_at")
    .eq("code", cleanCode)
    .maybeSingle();

  if (!voucher) return { ok: false, message: "Voucher não encontrado." };

  // Validações
  if (voucher.company_id !== userEmpresaId)
    return { ok: false, message: "Este voucher não pertence à sua empresa." };
  if (voucher.status === "used")
    return { ok: false, message: "Voucher já foi utilizado." };
  if (voucher.status === "cancelled")
    return { ok: false, message: "Voucher cancelado." };
  if (voucher.expires_at && new Date(voucher.expires_at) < new Date())
    return { ok: false, message: "Voucher expirado." };

  // Marca como usado
  const now = new Date().toISOString();
  const { error } = await admin
    .from("vouchers")
    .update({
      status: "used",
      validated_at: now,
      validated_by: user.id,
    })
    .eq("id", voucher.id);

  if (error) {
    console.error("[confirmVoucher]", error);
    return { ok: false, message: "Erro ao confirmar uso." };
  }

  revalidatePath("/dashboard/empresa/validar-voucher");
  revalidatePath("/dashboard/cliente/meus-vouchers");

  return { ok: true, message: "Voucher validado com sucesso! 🎉" };
}
