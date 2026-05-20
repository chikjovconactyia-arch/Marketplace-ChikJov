import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppBaseUrl } from "@/lib/url";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não está definido no .env");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
  appInfo: { name: "ChikJov", version: "1.0.0" },
});

export const STRIPE_PRODUCT_CLIENTE = process.env.STRIPE_PRODUCT_ID_CLIENTE ?? "";
export const STRIPE_PRICE_CLIENTE = process.env.STRIPE_PRICE_ID_CLIENTE ?? "";
export const STRIPE_TRIAL_DAYS = Number(process.env.STRIPE_TRIAL_DAYS_CLIENTE ?? 30);
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/**
 * Resolve o Price ID do plano cliente.
 *
 * Ordem de prioridade:
 * 1. STRIPE_PRICE_ID_CLIENTE (env var explícita)
 * 2. product.default_price (Stripe Dashboard → produto → "Default price")
 * 3. Primeiro preço ATIVO RECORRENTE do produto (busca via API)
 */
export async function resolveClientePriceId(): Promise<string> {
  if (STRIPE_PRICE_CLIENTE) return STRIPE_PRICE_CLIENTE;

  if (!STRIPE_PRODUCT_CLIENTE) {
    throw new Error("Configure STRIPE_PRODUCT_ID_CLIENTE ou STRIPE_PRICE_ID_CLIENTE.");
  }

  // Tenta default_price primeiro
  const product = await stripe.products.retrieve(STRIPE_PRODUCT_CLIENTE);
  if (product.default_price) {
    return typeof product.default_price === "string"
      ? product.default_price
      : product.default_price.id;
  }

  // Fallback: lista preços ativos do produto e pega o primeiro recorrente
  const prices = await stripe.prices.list({
    product: STRIPE_PRODUCT_CLIENTE,
    active: true,
    type: "recurring",
    limit: 10,
  });

  if (prices.data.length === 0) {
    throw new Error(
      `Produto ${STRIPE_PRODUCT_CLIENTE} não possui preços recorrentes ativos. ` +
      `Crie um preço no Stripe Dashboard ou defina STRIPE_PRICE_ID_CLIENTE no .env.`
    );
  }

  // Prefere o preço com intervalo mensal
  const monthly = prices.data.find((p) => p.recurring?.interval === "month");
  return (monthly ?? prices.data[0]).id;
}

/**
 * Mapeia status do Stripe para o enum subscription_status do banco.
 */
export function mapStripeStatusToDb(
  status: Stripe.Subscription.Status
): "ativo" | "inativo" | "pendente" | "cancelado" {
  switch (status) {
    case "trialing":
    case "active":
      return "ativo";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "pendente";
    case "canceled":
      return "cancelado";
    case "incomplete_expired":
    case "paused":
    default:
      return "inativo";
  }
}

/**
 * Atualiza profiles + assinaturas com o estado atual da Stripe Subscription.
 * Compartilhado entre o webhook do Stripe e o fallback síncrono da tela de sucesso.
 */
export async function syncSubscription(
  subscription: Stripe.Subscription,
  sessionMetadata: Stripe.Metadata | null,
  password?: string | null
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

  // Fallback 1: busca o ID do usuário no Supabase Auth por e-mail direto no banco (schema auth)
  if (!userId && customerEmail) {
    try {
      const authAdmin = createAdminClient("auth");
      const { data, error: getError } = await authAdmin
        .from("users")
        .select("id")
        .eq("email", customerEmail.toLowerCase())
        .maybeSingle();

      if (!getError && data) {
        userId = (data as { id: string }).id;
      }
    } catch (authErr) {
      console.error("[stripe/sync] erro ao buscar usuário por email:", authErr);
    }
  }

  // Fallback 2: usuário ainda não existe no Supabase — cria automaticamente
  // (necessário quando o pagamento veio via Payment Link, sem cadastro prévio no site)
  if (!userId && customerEmail) {
    const siteUrl = getAppBaseUrl();
    try {
      if (password) {
        // Se a senha foi informada no Stripe Checkout, cria a conta com a senha fornecida
        const { data: userCreated, error: userError } = await admin.auth.admin.createUser({
          email: customerEmail,
          password: password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            full_name: customerName ?? "",
            role: "cliente",
            stripe_customer_id: customerId,
          }
        });

        if (userError) throw userError;

        if (userCreated.user) {
          userId = userCreated.user.id;
          console.log(
            "[stripe/sync] usuário criado com senha fornecida do Stripe:",
            userId,
            customerEmail
          );

          // Garante que existe profile com role=cliente
          await admin.from("profiles").upsert(
            {
              id: userId,
              role: "cliente",
              full_name: customerName ?? null,
              subscription_status: "ativo",
            },
            { onConflict: "id" }
          );
        }
      } else {
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
            "[stripe/sync] usuário criado e convite enviado:",
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
      }
    } catch (createErr) {
      console.error("[stripe/sync] erro ao criar ou convidar usuário automaticamente:", createErr);
    }
  }

  // Sincroniza metadata do customer Stripe com o supabase_user_id (para próximos webhooks)
  if (userId) {
    try {
      await stripe.customers.update(customerId, {
        metadata: { supabase_user_id: userId },
      });
    } catch (stripeErr) {
      console.error("[stripe/sync] erro ao atualizar metadata do customer:", stripeErr);
    }
  }

  if (!userId) {
    console.warn(
      "[stripe/sync] subscription sem supabase_user_id e sem email no customer:",
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
