import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  stripe,
  STRIPE_WEBHOOK_SECRET,
  syncSubscription,
} from "@/lib/stripe/server";


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

        // Extrai a senha dos campos personalizados do Stripe Checkout
        const senhaField = session.custom_fields?.find((f) => f.key === "senha");
        const password = senhaField?.text?.value ?? null;

        await syncSubscription(subscription, session.metadata ?? null, password);
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


