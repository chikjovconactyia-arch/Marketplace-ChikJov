import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  stripe,
  STRIPE_WEBHOOK_SECRET,
  mapStripeStatusToDb,
} from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET não configurado");
    return NextResponse.json(
      { error: "Webhook não configurado." },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("[stripe/webhook] assinatura inválida:", err.message);
    return NextResponse.json({ error: `Webhook erro: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await syncSubscription(subscription, session.metadata ?? null);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription, null);
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as { subscription?: string | Stripe.Subscription })
          .subscription;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(
            typeof subId === "string" ? subId : subId.id
          );
          await syncSubscription(sub, null);
        }
        break;
      }

      default:
        // outros eventos ignorados
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[stripe/webhook] erro ao processar evento:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro interno." },
      { status: 500 }
    );
  }
}

/**
 * Atualiza profiles + assinaturas com o estado atual da Stripe Subscription.
 */
async function syncSubscription(
  subscription: Stripe.Subscription,
  sessionMetadata: Stripe.Metadata | null
) {
  const admin = createAdminClient();

  // Descobre o supabase_user_id via metadata da subscription, da session, ou do customer
  let userId =
    subscription.metadata?.supabase_user_id ||
    sessionMetadata?.supabase_user_id ||
    null;

  let customerEmail: string | null = null;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const customer = await stripe.customers.retrieve(customerId);

  if (!("deleted" in customer) || customer.deleted !== true) {
    customerEmail = (customer as Stripe.Customer).email ?? null;
    if (!userId) {
      userId = (customer as Stripe.Customer).metadata?.supabase_user_id ?? null;
    }
  }

  // Nome do customer (se disponível) — usado para popular o profile quando criamos a conta
  let customerName: string | null = null;
  if (!("deleted" in customer) || customer.deleted !== true) {
    customerName = (customer as Stripe.Customer).name ?? null;
  }

  // Fallback 1: busca o ID do usuário no Supabase Auth por e-mail
  if (!userId && customerEmail) {
    try {
      const { data: { users: authUsers }, error: listError } = await admin.auth.admin.listUsers();
      if (listError) throw listError;
      const user = authUsers.find(
        (u) => u.email?.toLowerCase() === customerEmail?.toLowerCase()
      );
      if (user) {
        userId = user.id;
      }
    } catch (authErr) {
      console.error("[stripe/webhook] erro ao buscar usuário por email:", authErr);
    }
  }

  // Fallback 2: usuário ainda não existe no Supabase — cria automaticamente
  // (necessário quando o pagamento veio via Payment Link, sem cadastro prévio no site)
  if (!userId && customerEmail) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    try {
      // inviteUserByEmail cria o usuário E envia email de convite
      // (com link mágico que redireciona pra /auth/reset-password)
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        customerEmail,
        {
          data: {
            full_name: customerName ?? "",
            role: "cliente",
            stripe_customer_id: customerId,
          },
          redirectTo: `${siteUrl}/auth/reset-password`,
        }
      );
      if (inviteErr) throw inviteErr;
      if (invited.user) {
        userId = invited.user.id;
        console.log(
          "[stripe/webhook] usuário criado e convite enviado:",
          userId,
          customerEmail
        );

        // Garante que existe profile com role=cliente
        await admin.from("profiles").upsert(
          {
            id: userId,
            role: "cliente",
            full_name: customerName ?? null,
            subscription_status: "inativo",
          },
          { onConflict: "id" }
        );
      }
    } catch (inviteErr) {
      console.error("[stripe/webhook] erro ao convidar usuário automaticamente:", inviteErr);
    }
  }

  // Sincroniza metadata do customer Stripe com o supabase_user_id (para próximos webhooks)
  if (userId) {
    try {
      await stripe.customers.update(customerId, {
        metadata: { supabase_user_id: userId },
      });
    } catch (stripeErr) {
      console.error("[stripe/webhook] erro ao atualizar metadata do customer:", stripeErr);
    }
  }

  if (!userId) {
    console.warn(
      "[stripe/webhook] subscription sem supabase_user_id e sem email no customer:",
      subscription.id
    );
    return;
  }

  const status = mapStripeStatusToDb(subscription.status);

  // Datas de início/fim do período atual (raw → ISO)
  const item = subscription.items.data[0];
  const currentPeriodStart =
    (item as unknown as { current_period_start?: number })?.current_period_start ??
    (subscription as unknown as { current_period_start?: number }).current_period_start;
  const currentPeriodEnd =
    (item as unknown as { current_period_end?: number })?.current_period_end ??
    (subscription as unknown as { current_period_end?: number }).current_period_end;

  const dataInicio = currentPeriodStart
    ? new Date(currentPeriodStart * 1000).toISOString()
    : null;
  const dataFim = currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000).toISOString()
    : null;

  // Upsert da assinatura local — chave única: cliente_id + stripe_subscription_id
  const { data: existente } = await admin
    .from("assinaturas")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (existente) {
    await admin
      .from("assinaturas")
      .update({
        status,
        plano: "cliente",
        stripe_customer_id: customerId,
        data_inicio: dataInicio,
        data_fim: dataFim,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existente.id);
  } else {
    await admin.from("assinaturas").insert({
      cliente_id: userId,
      plano: "cliente",
      status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      data_inicio: dataInicio,
      data_fim: dataFim,
    });
  }

  // Reflete no profile
  const trialEndsAt = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  await admin
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_plan: "cliente",
      trial_ends_at: trialEndsAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}
