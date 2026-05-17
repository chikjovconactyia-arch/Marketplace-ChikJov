# Stripe — Plano Cliente (R$ 39,90/mês com 30 dias grátis)

## Configuração

As variáveis abaixo já estão no `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRODUCT_ID_CLIENTE=prod_URrA0CRLuQNMvm
STRIPE_PRICE_ID_CLIENTE=          # opcional — usa default_price do produto se vazio
STRIPE_TRIAL_DAYS_CLIENTE=30
STRIPE_WEBHOOK_SECRET=            # preencher após rodar o Stripe CLI (ver abaixo)
```

> O produto `prod_URrA0CRLuQNMvm` precisa ter um **price recorrente mensal em BRL** definido como _default_, ou então defina `STRIPE_PRICE_ID_CLIENTE` explicitamente.

## Webhook em desenvolvimento

1. Instale o [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Rode:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Copie o `whsec_...` que o CLI imprime e cole em `STRIPE_WEBHOOK_SECRET` no `.env`.
4. Reinicie o `npm run dev`.

## Webhook em produção

No dashboard Stripe → Developers → Webhooks → Add endpoint:

- URL: `https://SEU_DOMINIO/api/stripe/webhook`
- Eventos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Copie o `Signing secret` para `STRIPE_WEBHOOK_SECRET` no ambiente de produção.

## Fluxo do usuário

1. Usuário se cadastra em `/auth/register` (ou já está logado).
2. Clica em **"Iniciar 30 dias grátis"** na home (`/preco`) → vai para `/checkout`.
3. `/checkout` mostra o resumo e o botão chama `POST /api/stripe/checkout`.
4. API cria a Checkout Session com `trial_period_days: 30` e redireciona o usuário para o Stripe Checkout.
5. Usuário informa cartão (sem cobrança imediata) → volta para `/checkout/success`.
6. O **webhook** atualiza:
   - `assinaturas` — registro completo com `stripe_customer_id`, `stripe_subscription_id`, `status`, `data_inicio`, `data_fim`
   - `profiles.subscription_status` — `ativo` durante trial e cobranças bem-sucedidas
   - `profiles.trial_ends_at` — data exata em que termina o trial
7. Após 30 dias o Stripe cobra automaticamente R$ 39,90 e dispara `invoice.payment_succeeded` (sem ação extra).
8. Usuário pode gerenciar/cancelar via banner do dashboard cliente → `POST /api/stripe/portal` (Stripe Billing Portal).

## Tabelas usadas

- `profiles.subscription_status` — `ativo | inativo | pendente | cancelado`
- `profiles.subscription_plan` — `cliente`
- `profiles.trial_ends_at` — timestamp do fim do trial
- `assinaturas` — espelho completo da Subscription da Stripe

## Endpoints criados

| Endpoint | Método | Descrição |
| --- | --- | --- |
| `/api/stripe/checkout` | POST | Cria Checkout Session com 30 dias de trial |
| `/api/stripe/webhook` | POST | Recebe eventos da Stripe e sincroniza com Supabase |
| `/api/stripe/portal` | POST | Abre o Billing Portal para gerenciar/cancelar |
| `/checkout` | GET | Página com resumo do plano e CTA |
| `/checkout/success` | GET | Sucesso após assinatura |
| `/checkout/canceled` | GET | Cancelamento do checkout |
