---
name: run-marketplace-chikjov
description: Run, start, launch, build, test, screenshot, verify, smoke-test the ChikJov Marketplace Next.js app. Use when asked to start the app, run the dev server, check if it works, or verify a change is working.
---

# Run — ChikJov Marketplace

Next.js 15 + Turbopack web app (Supabase Auth + Stripe). Driven via `curl`-based smoke script. Paths são relativos à raiz do projeto (`c:/Sinvaldo/sistemas/Antigravity/Marketplace-ChikJov`).

## Prerequisites

- Node.js 22+ e npm 11+ (já instalados)
- Arquivo `.env` na raiz com todas as variáveis preenchidas (ver `.env.example`). **Obrigatórias:**
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  ```
- Stripe CLI (opcional, para testar webhooks localmente):
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

## Build

```bash
npm install          # instala dependências (node_modules já existe — geralmente rápido)
npm run build        # build de produção (opcional para dev)
```

## Run (agent path)

**1. Iniciar o servidor de desenvolvimento em background:**

```bash
npm run dev &
sleep 12   # aguarda Turbopack compilar (~4s na primeira vez)
```

Porta padrão: `http://localhost:3000`. Se já estiver em uso, o Next.js sobe na `3001`, `3002`, etc. — verificar no stdout.

**2. Executar o smoke test para confirmar que está rodando:**

```bash
bash .claude/skills/run-marketplace-chikjov/smoke.sh
# ou com porta alternativa:
bash .claude/skills/run-marketplace-chikjov/smoke.sh http://localhost:3001
```

Saída esperada — todos os 11 checks passando:
```
=== ChikJov smoke test: http://localhost:3000 ===
  ✓ Landing page (200)
  ✓ Login page (200)
  ✓ Register page (200)
  ✓ Checkout (sem auth) (307)
  ✓ Dashboard cliente (307)
  ...
✅ Todos os 11 testes passaram.
```

**3. Verificar uma rota específica:**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s http://localhost:3000/auth/login | grep -o '<title>[^<]*</title>'
```

**4. Testar o webhook Stripe (requer `STRIPE_WEBHOOK_SECRET` configurado e Stripe CLI):**

```bash
# Em outro terminal:
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Simular evento:
stripe trigger checkout.session.completed
```

**5. Encerrar o servidor:**

```bash
pkill -f "next dev"
```

## Run (human path)

```bash
npm run dev
# abre http://localhost:3000 no browser
# Ctrl+C para encerrar
```

## Fluxo principal (cadastro → checkout → ativação)

1. `GET /auth/register` → cria conta (email + senha + nome)
2. Login automático → `GET /checkout` → Stripe Checkout
3. Pagamento → `GET /checkout/success?session_id=...` → ativa `profiles.subscription_status = "ativo"`
4. `GET /dashboard/cliente` → mostra banner de trial ativo

## Gotchas

- **Porta 3000 ocupada**: o Next.js sobe silenciosamente na 3001/3002. O smoke script usa 3000 por padrão — passe a porta alternativa como argumento.
- **`.env` vs `.env.local`**: o projeto usa `.env` (não `.env.local`). Não criar `.env.local` — o Next.js daria preferência a ele e as variáveis do `.env` seriam ignoradas.
- **Webhook sem Stripe CLI**: sem `stripe listen`, o webhook nunca dispara. A ativação do plano depende do fallback da success page (`/checkout/success`), que chama `syncSubscription` diretamente.
- **`STRIPE_WEBHOOK_SECRET` errado**: o webhook retorna 400 com `{"error":"Webhook erro: ..."}` em vez de `{"error":"Assinatura ausente."}`. Regenerar o secret com `stripe listen`.
- **Trial sem cobrança imediata**: em modo de teste, o período trial não cobra — a cobrança só aparece após 30 dias (ou simular com `stripe trigger invoice.payment_succeeded`).
- **`supabase_user_id` nos metadados**: a subscription tem `metadata.supabase_user_id` definido no checkout. Sem esse campo, o webhook cria o usuário via `inviteUserByEmail` (sem senha).

## Troubleshooting

| Sintoma | Causa | Fix |
|---|---|---|
| `Error: STRIPE_SECRET_KEY não está definido` | `.env` não encontrado | Verificar se o arquivo existe na raiz e tem a chave |
| Landing page retorna 500 | Variáveis do Supabase inválidas | Confirmar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `/checkout/success` não ativa o plano | `profiles.subscription_status` não atualizado | Ver logs do servidor — procurar `[stripe/sync]` |
| Página `reset-password` em loop | Link de convite expirado ou PKCE não trocado | O link redireciona para `/auth/callback?next=/auth/reset-password` — verificar se `/auth/callback` está acessível |
| `npm run dev` não termina de compilar | Turbopack compilando rota pesada | Aguardar até 60s na primeira execução |
