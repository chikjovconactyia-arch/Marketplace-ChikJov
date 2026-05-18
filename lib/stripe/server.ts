import Stripe from "stripe";

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
