"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SlugResult {
  ok: boolean;
  message?: string;
  slug?: string;
}

// Garante que o usuário tem um referral_slug; gera se necessário (via RPC)
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

  // Gera slug via RPC
  const baseName = profile?.full_name ?? user.email?.split("@")[0] ?? "user";
  const { data: newSlug, error } = await admin.rpc("generate_referral_slug", {
    p_user_id: user.id,
    p_name: baseName,
  });

  if (error) {
    console.error("[getOrGenerateSlug] RPC error:", error);
    // Fallback: gera slug manualmente
    const fallback = baseName.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30) + "-" + user.id.slice(0, 6);

    await admin.from("profiles").update({ referral_slug: fallback }).eq("id", user.id);
    return { ok: true, slug: fallback };
  }

  return { ok: true, slug: typeof newSlug === "string" ? newSlug : "" };
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
