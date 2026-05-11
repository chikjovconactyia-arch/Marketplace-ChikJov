# 🟣 ChikJov — Clube de Vantagens

Sistema SaaS marketplace de clube de vantagens por assinatura. Conecta empresas locais a consumidores via benefícios exclusivos resgatáveis por voucher.

**Repositório:** `Marketplace-ChikJov`
**Início:** 2026-05-06
**Status:** Em construção — Fase 1

---

## 🎯 Visão Geral

| Aspecto | Definição |
|---|---|
| **Modelo** | SaaS / Marketplace fechado por assinatura |
| **Receita** | Recorrente — empresas pagam para anunciar, clientes pagam para acessar |
| **Acesso** | Bloqueado sem assinatura ativa |
| **Resgate** | Voucher único (1 uso), validado pela empresa |

### Tipos de usuário
1. **Admin** — controle total, aprova empresas, gerencia destaques
2. **Empresa** — cria ofertas, valida vouchers, vê relatórios
3. **Cliente** — explora empresas, gera vouchers, usa benefícios

---

## ⚙️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 |
| Estilização | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (REST) |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Pagamentos | Stripe (assinaturas + webhooks) |
| Automação | n8n (futuro) |
| Deploy | Vercel (sugerido) |

---

## 🎨 Design System

### Paleta
- **Roxo** (primário) — identidade, headers, links
- **Laranja** (CTA) — botões de ação principais
- **Branco / Cinza claro** — backgrounds
- **Cinza escuro** — textos

### Princípios
- Bordas arredondadas (radius médio)
- Sombras leves nos cards
- Tipografia limpa e moderna
- Layout 100% responsivo (mobile-first)
- Estilo comercial, foco em conversão

---

## 🗂️ Estrutura de Rotas

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Landing Page | Pública |
| `/auth/login` | Login | Pública |
| `/auth/register` | Cadastro (cliente ou empresa) | Pública |
| `/checkout` | Stripe Checkout | Autenticado sem plano |
| `/dashboard/admin` | Dashboard Admin | Admin |
| `/dashboard/empresa` | Dashboard Empresa | Empresa com plano |
| `/dashboard/cliente` | Dashboard Cliente | Cliente com plano |
| `/empresa/[id]` | Página pública da empresa | Cliente com plano |

---

## 🗄️ Modelo de Dados (Resumo)

```
users           — id, email, role (admin|empresa|cliente), created_at
companies       — id, user_id, nome, logo, categoria, descricao, status
offers          — id, company_id, titulo, descricao, tipo, regras, validade
vouchers        — id, codigo, user_id, company_id, offer_id, status, data_uso
subscriptions   — id, user_id, stripe_id, plano, status, periodo
leads           — id, nome, whatsapp, email, empresa, instagram, origem
highlights      — id, company_id, ordem (carrossel landing)
```

---

## 📋 Roadmap por Fases

### ✅ Fase 1 — Fundação + Landing Page (CONCLUÍDA — 2026-05-06)
- [x] Setup Next.js 15 + Tailwind + Turbopack
- [x] Design tokens (cores roxo `brand-*` / laranja `accent-*`, tipografia Inter + Plus Jakarta)
- [x] Componentes base (`Button`, `Card`, `Section`)
- [x] `Header` (sticky, mobile menu) + `Footer`
- [x] Hero Section (com mockup voucher + stat de economia)
- [x] Parceiros (carrossel auto-scroll com mask fade)
- [x] Carrossel de Empresas (`CompanyCarousel` — controles prev/next)
- [x] Como Funciona (3 steps numerados)
- [x] Benefícios (grid 4 cards)
- [x] Indicação / Ganhos (mockup celular com saldo PIX)
- [x] Preço (R$ 39,90/mês — seção brand gradient)
- [x] Funcionalidades (6 cards para empresas)
- [x] CTA Empresas + formulário (Server Action `submitLead`, campo oculto `origem`)

**Estrutura criada:**
```
app/
  layout.tsx          — fontes Inter + Plus Jakarta, metadata
  page.tsx            — landing montando todas as seções
  globals.css         — tailwind + utilities customizadas
  actions/lead.ts     — Server Action de captação de leads
components/
  ui/                 — Button, Card, Section
  layout/             — Header, Footer
  landing/            — Hero, Partners, CompanyCarousel, HowItWorks,
                        Benefits, Referral, Pricing, Features, BusinessCTA
lib/
  utils.ts            — helper cn() (clsx + tailwind-merge)
  mock-data.ts        — empresas e logos de parceiros (placeholder)
```

**Como rodar:** `npm run dev` → http://localhost:3000

### ✅ Fase 2 — Auth + Supabase (CONCLUÍDA — 2026-05-06)
**Schema já existente no Supabase** (introspectado via OpenAPI):
- `profiles` (role, subscription_status, referral_slug, trial_ends_at)
- `empresarios`, `empresas` (separados — empresário pode ter N empresas)
- `ofertas`, `vouchers`, `assinaturas` (com Stripe)
- `leads_empresas`, `parceiros`, `hero_slides`, `hero_settings`
- `referrals` (programa de indicação 2 níveis)

**RPCs disponíveis:**
- `submit_empresa_lead(p_nome, p_phone, p_email, p_empresa_name, p_instagram)` ← form da landing usa
- `get_referrer_by_slug`, `register_referral`, `activate_referral_commissions`
- `generate_referral_slug`, `get_profile_name`, `unaccent`

**Implementado:**
- [x] `.env.local` com URL + anon + service_role
- [x] Tipos TypeScript completos do banco (`lib/database.types.ts`)
- [x] Clients Supabase: `client.ts` (browser), `server.ts` (SSR), `admin.ts` (service_role)
- [x] `middleware.ts` — refresh de sessão + bloqueio de rotas privadas + redirect por role
- [x] Server Actions: `loginAction`, `registerAction`, `logoutAction`
- [x] `/auth/login` com tratamento de erros traduzidos
- [x] `/auth/register` com tabs cliente/empresa + suporte a `?ref=` (indicação)
- [x] `/auth/callback` para confirmação de email
- [x] Form de leads da landing agora persiste via RPC `submit_empresa_lead`
- [x] Stubs `/dashboard/{cliente,empresa,admin}` com layout próprio + logout
- [x] `/checkout` placeholder (Fase 3)

**Estrutura adicionada:**
```
app/
  auth/{login,register,callback}/  — fluxo completo de auth
  dashboard/{cliente,empresa,admin}/ — placeholders por role
  checkout/                          — placeholder Stripe
  actions/auth.ts                    — server actions
lib/
  database.types.ts                  — tipos completos do banco
  supabase/
    client.ts                        — browser
    server.ts                        — SSR
    admin.ts                         — service_role (bypass RLS)
    middleware.ts                    — refresh session + guards
middleware.ts                        — entry point Next.js
```

**Pontos de atenção:**
- ⚠️ `service_role` foi compartilhada em chat → **ROTACIONAR no Supabase** (Settings → API)
- Confirmação de email: callback funciona com `NEXT_PUBLIC_SITE_URL` configurado
- Trigger `handle_new_user` (caso exista no banco) cria profile; caso não, fallback via service_role faz upsert
- Para empresa: ao registrar cria registro em `empresarios` + `empresas` (active=false até admin aprovar)
- Indicação: `?ref=slug` no link de registro → busca referrer via RPC e registra (R$ 20)

### ⏳ Fase 3 — Stripe Checkout + Webhooks
- Planos cliente e empresa
- Ativação automática via webhook

### ⏳ Fase 4 — Dashboard Cliente
- Explorar empresas
- Página da empresa
- Geração de voucher (com QR)

### ⏳ Fase 5 — Dashboard Empresa
- CRUD de ofertas
- Validação de voucher (código + QR)
- Relatórios

### ⏳ Fase 6 — Dashboard Admin
- Gestão de usuários e empresas
- Carrossel de destaques
- Vouchers globais
- Financeiro

---

## 🧠 Regras de Negócio Críticas

1. **Sem assinatura ativa = sem acesso** ao sistema (cliente e empresa)
2. **Empresa só aparece** no marketplace se tiver plano ativo
3. **Voucher é uso único** — após validado, não pode ser reutilizado
4. **Voucher pode expirar** conforme validade da oferta
5. **Multi-tenant** — cada empresa enxerga apenas seus próprios dados
6. **Cliente só gera voucher logado** e com plano ativo

---

## 📊 Métricas a Acompanhar

- Assinantes ativos (cliente)
- Empresas ativas
- Vouchers gerados / usados / expirados
- Taxa de resgate (gerados → usados)
- Leads por empresa
- Conversão por oferta
- MRR (Monthly Recurring Revenue)

---

## 🚀 Expansões Futuras

- Sistema de indicação 2 níveis (R$20 / R$5)
- Cashback
- Ranking de empresas
- App mobile (React Native)
- Geolocalização
- IA para recomendação de ofertas

---

## 📝 Histórico de Decisões

| Data | Decisão | Motivo |
|---|---|---|
| 2026-05-06 | Next.js (App Router) ao invés de NestJS separado | Reduz complexidade, deploy unificado, API Routes cobrem o backend necessário |
| 2026-05-06 | Supabase ao invés de Postgres + Prisma puro | Auth + DB + Storage prontos, RLS nativa, acelera Fase 2-6 |
| 2026-05-06 | Construir em fases verticais | Cada fase entrega valor isolado e testável |

---

## 🔗 Links Úteis (preencher conforme avança)

- Repo: _a definir_
- Supabase: _a definir_
- Stripe Dashboard: _a definir_
- Vercel Deploy: _a definir_
