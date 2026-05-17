"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Clock,
  Users,
  UserCheck,
  Sparkles,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  LayoutDashboard,
  Repeat,
  Share2,
} from "lucide-react";
import {
  STATUS_CONFIG,
  formatBRL,
  type ReferralBizStatus,
} from "@/lib/referral-helpers";
import { cn } from "@/lib/utils";

export type AssinaturaCategoria = "pagante" | "trial" | "pendente" | "cancelado" | "inativo";

export interface AssinaturaRow {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  plano: string;
  status_db: string;
  categoria: AssinaturaCategoria;
  data_inicio: string | null;
  data_fim: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  meses_faturados: number;
  total_faturado: number;
  created_at: string | null;
}

export interface ComissaoRow {
  id: string;
  referrer_id: string;
  referrer_nome: string;
  indicado_nome: string | null;
  level: number;
  commission_value: number;
  status: ReferralBizStatus;
  release_date: string | null;
  paid_at: string | null;
  activated_at: string | null;
  created_at: string | null;
}

export interface FinanceiroMetrics {
  mrr: number;
  mrrPotencial: number;
  faturadoMesAtual: number;
  totalFaturado: number;
  arpu: number;
  ltvEstimado: number;
  receitaLiquidaMRR: number;
  saldoMes: number;
  pagantes: number;
  emTrial: number;
  pendentes: number;
  cancelados: number;
  totalAssinaturas: number;
  novosClientesMes: number;
  canceladosMesAtual: number;
  canceladosMesAnterior: number;
  conversionTrial: number;
  churnRate: number;
  comissoesDisponivel: number;
  comissoesPendente: number;
  comissoesPagas: number;
  comissoesPagasMes: number;
  comissoesCanceladas: number;
  totalComissoes: number;
}

interface Props {
  metrics: FinanceiroMetrics;
  assinaturas: AssinaturaRow[];
  comissoes: ComissaoRow[];
}

const CATEGORIA_CFG: Record<AssinaturaCategoria, { label: string; cls: string }> = {
  pagante: { label: "Pagante", cls: "bg-emerald-100 text-emerald-700" },
  trial: { label: "Em trial", cls: "bg-amber-100 text-amber-700" },
  pendente: { label: "Pendente", cls: "bg-red-100 text-red-700" },
  cancelado: { label: "Cancelado", cls: "bg-purple-100 text-purple-700" },
  inativo: { label: "Inativo", cls: "bg-surface-muted text-ink-subtle" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function Trend({ value, label }: { value: number; label?: string }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-ink-subtle">
        <Minus className="h-3 w-3" />
        {label ?? "0%"}
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        up ? "text-emerald-600" : "text-red-600"
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {label ?? `${up ? "+" : ""}${value.toFixed(1)}%`}
    </span>
  );
}

// ─── Hero KPIs principais ────────────────────────────────────────────────────────
function HeroKPIs({ m }: { m: FinanceiroMetrics }) {
  const cards = [
    {
      label: "MRR atual",
      value: formatBRL(m.mrr),
      sub: `${m.pagantes} pagantes ativos`,
      icon: Repeat,
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconBg: "bg-white/20",
    },
    {
      label: "MRR potencial",
      value: formatBRL(m.mrrPotencial),
      sub: `${m.emTrial} em trial`,
      icon: TrendingUp,
      bg: "bg-gradient-to-br from-brand-500 to-brand-700",
      iconBg: "bg-white/20",
    },
    {
      label: "Comissões a pagar",
      value: formatBRL(m.comissoesDisponivel + m.comissoesPendente),
      sub: `${formatBRL(m.comissoesDisponivel)} disponível`,
      icon: Wallet,
      bg: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconBg: "bg-white/20",
    },
    {
      label: "Saldo do mês",
      value: formatBRL(m.saldoMes),
      sub: `Receita − comissões`,
      icon: DollarSign,
      bg: m.saldoMes >= 0
        ? "bg-gradient-to-br from-purple-600 to-brand-700"
        : "bg-gradient-to-br from-red-500 to-red-700",
      iconBg: "bg-white/20",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={cn("rounded-2xl p-5 text-white shadow-card", c.bg)}
        >
          <div className="flex items-start justify-between">
            <div className={cn("grid h-11 w-11 place-items-center rounded-xl", c.iconBg)}>
              <c.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {c.label}
            </span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{c.value}</p>
          <p className="mt-1 text-xs opacity-90">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Visão Geral ────────────────────────────────────────────────────────────
function VisaoGeral({ m }: { m: FinanceiroMetrics }) {
  const diffCancelados = m.canceladosMesAtual - m.canceladosMesAnterior;
  const diffPct = m.canceladosMesAnterior > 0
    ? ((diffCancelados / m.canceladosMesAnterior) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Bloco Receita */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100">
            <TrendingUp className="h-4 w-4 text-emerald-700" />
          </div>
          <h3 className="font-display text-base font-bold text-ink">Receitas</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              Faturado este mês
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.faturadoMesAtual)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              {m.pagantes} cobranças recorrentes
            </p>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-700">
              Total faturado
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.totalFaturado)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">Histórico acumulado</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
              ARPU
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.arpu)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">Receita por cliente / mês</p>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-700">
              LTV estimado
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.ltvEstimado)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">12 meses de vida média</p>
          </div>
        </div>
      </div>

      {/* Bloco Comissões */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100">
              <Share2 className="h-4 w-4 text-amber-700" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">
              Comissões — Indique &amp; Ganhe
            </h3>
          </div>
          <span className="text-xs text-ink-muted">
            {m.totalComissoes} comissões geradas
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Disponível p/ saque
              </p>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.comissoesDisponivel)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700">Pode ser sacado agora</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                Pendente liberação
              </p>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.comissoesPendente)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">Aguarda dia 01</p>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-700">
                Pago este mês
              </p>
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.comissoesPagasMes)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              {formatBRL(m.comissoesPagas)} acumulado
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">
                Canceladas
              </p>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {formatBRL(m.comissoesCanceladas)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">Estornadas</p>
          </div>
        </div>
      </div>

      {/* Bloco Clientes */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-100">
            <Users className="h-4 w-4 text-brand-700" />
          </div>
          <h3 className="font-display text-base font-bold text-ink">Base de clientes</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
          <MiniMetric
            label="Pagantes"
            value={String(m.pagantes)}
            icon={UserCheck}
            color="emerald"
          />
          <MiniMetric
            label="Em trial"
            value={String(m.emTrial)}
            icon={Clock}
            color="amber"
          />
          <MiniMetric
            label="Pendentes"
            value={String(m.pendentes)}
            icon={AlertCircle}
            color="red"
          />
          <MiniMetric
            label="Cancelados"
            value={String(m.cancelados)}
            icon={CreditCard}
            color="purple"
          />
          <MiniMetric
            label="Novos no mês"
            value={String(m.novosClientesMes)}
            icon={Sparkles}
            color="blue"
          />
          <MiniMetric
            label="Conversão trial"
            value={`${m.conversionTrial.toFixed(0)}%`}
            icon={TrendingUp}
            color="brand"
          />
        </div>

        {/* Churn analysis */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#E8E4F3] bg-surface-soft/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
                Taxa de Churn
              </p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  m.churnRate < 5
                    ? "bg-emerald-100 text-emerald-700"
                    : m.churnRate < 10
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {m.churnRate < 5 ? "Saudável" : m.churnRate < 10 ? "Atenção" : "Crítico"}
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-ink">
              {m.churnRate.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {m.canceladosMesAtual} cancelamentos este mês
            </p>
          </div>

          <div className="rounded-xl border border-[#E8E4F3] bg-surface-soft/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
                Cancelamentos mês a mês
              </p>
              {m.canceladosMesAnterior > 0 && <Trend value={-diffPct} />}
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-ink">
              {m.canceladosMesAtual}
              <span className="text-base font-normal text-ink-muted">
                {" "}
                vs {m.canceladosMesAnterior}
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-muted">Atual vs anterior</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  color: "emerald" | "amber" | "red" | "purple" | "blue" | "brand";
}) {
  const cls = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    brand: "bg-brand-100 text-brand-700",
  }[color];

  return (
    <div className="rounded-xl border border-[#E8E4F3] bg-white p-3">
      <div className={cn("mb-2 grid h-8 w-8 place-items-center rounded-lg", cls)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}

// ─── Tab: Assinaturas ────────────────────────────────────────────────────────────
function AssinaturasTab({ rows }: { rows: AssinaturaRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AssinaturaCategoria | "todos">("todos");

  const filtered = useMemo(() => {
    let list = rows;
    if (filter !== "todos") list = list.filter((r) => r.categoria === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => r.cliente_nome.toLowerCase().includes(q));
    return list;
  }, [rows, filter, query]);

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
      <div className="flex flex-col gap-3 border-b border-[#E8E4F3] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Assinaturas
          </h2>
          <p className="text-xs text-ink-muted">
            {filtered.length}{" "}
            {filtered.length === 1 ? "assinatura" : "assinaturas"}
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full rounded-xl border border-[#E8E4F3] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AssinaturaCategoria | "todos")}
            className="rounded-xl border border-[#E8E4F3] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="todos">Todos os status</option>
            <option value="pagante">Pagantes</option>
            <option value="trial">Em trial</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelado">Cancelados</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <Receipt className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-display text-lg font-bold text-ink">
            Nenhuma assinatura encontrada
          </p>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Quando clientes assinarem, aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-[#E8E4F3] bg-surface-soft">
                {[
                  "Cliente",
                  "Plano",
                  "Status",
                  "Início",
                  "Trial expira",
                  "Meses",
                  "Total faturado",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECF8]">
              {filtered.map((a) => {
                const cfg = CATEGORIA_CFG[a.categoria];
                const initial = (a.cliente_nome[0] ?? "?").toUpperCase();
                return (
                  <tr key={a.id} className="transition-colors hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                          {initial}
                        </div>
                        <span className="font-medium text-ink">{a.cliente_nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                        <CreditCard className="h-3 w-3" />
                        {a.plano}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                          cfg.cls
                        )}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {formatDate(a.data_inicio)}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {formatDate(a.trial_ends_at)}
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {a.meses_faturados}
                    </td>
                    <td className="px-5 py-3 font-semibold text-emerald-700">
                      {formatBRL(a.total_faturado)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Comissões ──────────────────────────────────────────────────────────────
function ComissoesTab({ rows }: { rows: ComissaoRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ReferralBizStatus | "todos">("todos");

  const filtered = useMemo(() => {
    let list = rows;
    if (filter !== "todos") list = list.filter((r) => r.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.referrer_nome.toLowerCase().includes(q) ||
          (r.indicado_nome ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, filter, query]);

  const totalFiltrado = filtered.reduce((s, r) => s + r.commission_value, 0);

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
      <div className="flex flex-col gap-3 border-b border-[#E8E4F3] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-ink">Comissões</h2>
          <p className="text-xs text-ink-muted">
            {filtered.length} comissões · Total filtrado:{" "}
            <span className="font-semibold text-ink">{formatBRL(totalFiltrado)}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar indicador/indicado..."
              className="w-full rounded-xl border border-[#E8E4F3] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ReferralBizStatus | "todos")}
            className="rounded-xl border border-[#E8E4F3] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="todos">Todos os status</option>
            <option value="available">Disponível</option>
            <option value="approved_pending_release">Liberação em breve</option>
            <option value="pending_payment">Em período grátis</option>
            <option value="pending_signup">Aguardando cadastro</option>
            <option value="paid">Pago</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <Share2 className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-display text-lg font-bold text-ink">
            Nenhuma comissão encontrada
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-[#E8E4F3] bg-surface-soft">
                {[
                  "Indicador",
                  "Indicado",
                  "Nível",
                  "Valor",
                  "Status",
                  "Cadastro",
                  "Liberação",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECF8]">
              {filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <tr key={c.id} className="transition-colors hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <span className="font-medium text-ink">{c.referrer_nome}</span>
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {c.indicado_nome ?? "Aguardando"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold",
                          c.level === 1
                            ? "bg-brand-100 text-brand-700"
                            : "bg-purple-100 text-purple-700"
                        )}
                      >
                        N{c.level}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-ink">
                      {formatBRL(c.commission_value)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                          cfg.cls
                        )}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {c.paid_at
                        ? `Pago ${formatDate(c.paid_at)}`
                        : formatDate(c.release_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────────
export function FinanceiroClient({ metrics, assinaturas, comissoes }: Props) {
  const [tab, setTab] = useState<"visao" | "assinaturas" | "comissoes">("visao");

  const tabs = [
    { id: "visao" as const, label: "Visão geral", icon: LayoutDashboard, count: null },
    {
      id: "assinaturas" as const,
      label: "Assinaturas",
      icon: Receipt,
      count: metrics.totalAssinaturas,
    },
    {
      id: "comissoes" as const,
      label: "Comissões",
      icon: Share2,
      count: metrics.totalComissoes,
    },
  ];

  return (
    <div>
      {/* Hero KPIs */}
      <HeroKPIs m={metrics} />

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-soft">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              tab === t.id
                ? "bg-brand-100 text-brand-700"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.count !== null && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  tab === t.id ? "bg-brand-200 text-brand-800" : "bg-surface-muted text-ink-subtle"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "visao" && <VisaoGeral m={metrics} />}
      {tab === "assinaturas" && <AssinaturasTab rows={assinaturas} />}
      {tab === "comissoes" && <ComissoesTab rows={comissoes} />}
    </div>
  );
}
