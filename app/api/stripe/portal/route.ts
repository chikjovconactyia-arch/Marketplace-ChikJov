import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: assinatura } = await admin
      .from("assinaturas")
      .select("stripe_customer_id")
      .eq("cliente_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!assinatura?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada." },
        { status: 404 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      `${req.nextUrl.protocol}//${req.headers.get("host")}`;

    const session = await stripe.billingPortal.sessions.create({
      customer: assinatura.stripe_customer_id,
      return_url: `${siteUrl}/dashboard/cliente`,
      locale: "pt-BR",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[/api/stripe/portal] erro:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro ao abrir portal." },
      { status: 500 }
    );
  }
}
