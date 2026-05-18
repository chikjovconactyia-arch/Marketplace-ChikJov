"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SlugResult {
  ok: boolean;
  message?: string;
  slug?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

// Garante que o usuário tem um referral_slug; gera se necessário.
// Não depende de RPC — usa query direta com colisão tratada por sufixo do user_id.
export async function getOrGenerateSlugAction(): Promise<SlugResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("referral_slug, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.referral_slug) return { ok: true, slug: profile.referral_slug };

  const baseName = profile?.full_name ?? user.email?.split("@")[0] ?? "user";
  const baseSlug = slugify(baseName) || "user";

  // Tenta usar o slug base; se já existir outro perfil com o mesmo, adiciona sufixo
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("referral_slug", baseSlug)
    .maybeSingle();

  const finalSlug = existing
    ? `${baseSlug}-${user.id.slice(0, 6)}`
    : baseSlug;

  const { error: updateError } = await admin
    .from("profiles")
    .update({ referral_slug: finalSlug })
    .eq("id", user.id);

  if (updateError) {
    console.error("[getOrGenerateSlug] Erro ao salvar slug:", updateError);
    return { ok: false, message: "Erro ao gerar link de indicação." };
  }

  console.log("[getOrGenerateSlug] Slug gerado para", user.id, ":", finalSlug);
  return { ok: true, slug: finalSlug };
}

export interface PayoutResult {
  ok: boolean;
  message: string;
}

// Solicitação de saque — STUB. Stripe Connect ainda não está integrado.
export async function requestPayoutAction(): Promise<PayoutResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  // TODO Fase B (Stripe Connect):
  // 1. Verificar se user tem stripe_account_id + payouts_enabled
  // 2. Calcular saldo disponível (sum dos referrals com status="available")
  // 3. Criar transferência via stripe.transfers.create()
  // 4. Salvar em affiliate_payouts
  // 5. Marcar referrals como "paid"

  return {
    ok: false,
    message: "Saques estarão disponíveis assim que a integração com Stripe Connect for ativada.",
  };
}

// Stub — Stripe Connect ainda não está integrado
export async function connectStripeAction(): Promise<PayoutResult> {
  return {
    ok: false,
    message: "Integração com Stripe Connect em desenvolvimento. Em breve!",
  };
}
