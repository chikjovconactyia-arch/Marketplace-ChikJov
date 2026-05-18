import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  stripe,
  resolveClientePriceId,
  STRIPE_TRIAL_DAYS,
} from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Você precisa estar logado para assinar." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // Bloqueia novas assinaturas se já houver uma ativa
    const { data: profile } = await admin
      .from("profiles")
      .select("subscription_status, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.subscription_status === "ativo") {
      return NextResponse.json(
        { error: "Você já possui uma assinatura ativa." },
        { status: 400 }
      );
    }

    // Reutiliza customer Stripe se já existir uma assinatura prévia
    const { data: assinaturaExistente } = await admin
      .from("assinaturas")
      .select("stripe_customer_id")
      .eq("cliente_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId = assinaturaExistente?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const priceId = await resolveClientePriceId();
    // Usa o origin REAL da requisição — domínio do usuário, não env var
    const siteUrl = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: STRIPE_TRIAL_DAYS,
        metadata: {
          supabase_user_id: user.id,
          plano: "cliente",
        },
      },
      payment_method_collection: "always",
      allow_promotion_codes: true,
      locale: "pt-BR",
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/canceled`,
      metadata: {
        supabase_user_id: user.id,
        plano: "cliente",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[/api/stripe/checkout] erro:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro ao iniciar checkout." },
      { status: 500 }
    );
  }
}
