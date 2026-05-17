"use client";

import { useState } from "react";
import {
  ChevronDown,
  Users,
  Wallet,
  Clock,
  TrendingUp,
  Share2,
  LayoutList,
  Network,
  Search,
} from "lucide-react";
import {
  STATUS_CONFIG,
  formatBRL,
  type ReferralBizStatus,
} from "@/lib/referral-helpers";
import { cn } from "@/lib/utils";

export interface AdminReferralItem {
  id: string;
  level: number;
  commission_value: number | null;
  status: ReferralBizStatus;
  release_date: string | null;
  paid_at: string | null;
  created_at: string | null;
  indicado_nome: string | null;
}

export interface AdminReferrerRow {
  referrer_id: string;
  referrer_nome: string;
  referrer_slug: string | null;
  total_indicacoes: number;
  nivel1Count: number;
  nivel2Count: number;
  saldoDisponivel: number;
  saldoPendente: number;
  totalPago: number;
  items: AdminReferralItem[];
}

interface Props {
  rows: AdminReferrerRow[];
  kpis: {
    totalUsuariosIndicadores: number;
    totalIndicacoes: number;
    totalComissaoPaga: number;
    totalComissaoDisponivel: number;
    totalComissaoPendente: number;
  };
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function PersonIcon({ size = 32, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="9" r="5" fill={color} />
      <path
        d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function TreeNode({
  label,
  sublabel,
  status,
  isYou = false,
  level = 0,
}: {
  label: string;
  sublabel?: string;
  status?: ReferralBizStatus;
  isYou?: boolean;
  level?: number;
}) {
  const cfg = status ? STATUS_CONFIG[status] : null;
  const color = isYou ? "#7C3AED" : level === 1 ? "#F26B0A" : "#5618B0";
  const bgColor = isYou ? "bg-brand-100" : level === 1 ? "bg-accent-100" : "bg-purple-100";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("grid h-14 w-14 place-items-center rounded-2xl shadow-soft", bgColor)}>
        <PersonIcon size={36} color={color} />
      </div>
      <div className="text-center">
        <p
          className={cn(
            "max-w-[90px] truncate text-xs font-bold leading-tight",
            isYou ? "text-brand-700" : "text-ink"
          )}
        >
          {isYou ? (label.split(" ")[0] || "USUÁRIO").toUpperCase() : label.split(" ")[0] || label}
        </p>
        {sublabel && !isYou && <p className="text-[10px] text-ink-subtle">{sublabel}</p>}
        {cfg && (
          <span
            className={cn(
              "mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold",
              cfg.cls
            )}
          >
            {cfg.label}
          </span>
        )}
      </div>
    </div>
  );
}

function Connector() {
  return <div className="mx-auto h-6 w-px bg-brand-200" />;
}

function TreeView({ items, userName }: { items: AdminReferralItem[]; userName: string }) {
  const nivel1 = items.filter((i) => i.level === 1);
  const nivel2 = items.filter((i) => i.level === 2);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <TreeNode label={userName} isYou level={0} />
        <p className="mt-4 text-xs text-ink-muted">Sem indicações.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex min-w-max flex-col items-center">
        <TreeNode label={userName} isYou level={0} />

        {nivel1.length > 0 && (
          <>
            <Connector />
            <div className="flex items-start gap-0">
              {nivel1.map((item, idx) => (
                <div key={item.id} className="flex flex-col items-center">
                  <div className="flex items-center">
                    {idx === 0 && nivel1.length > 1 && (
                      <div className="h-px w-12 bg-brand-200" />
                    )}
                    {idx > 0 && idx < nivel1.length - 1 && (
                      <div className="h-px w-24 bg-brand-200" />
                    )}
                    {idx === nivel1.length - 1 && nivel1.length > 1 && (
                      <div className="h-px w-12 bg-brand-200" />
                    )}
                    <div className="h-4 w-px bg-brand-200" />
                    {idx < nivel1.length - 1 && <div className="h-px w-12 bg-brand-200" />}
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <TreeNode
                      label={item.indicado_nome ?? "?"}
                      sublabel={`R$ ${item.commission_value ?? 0}`}
                      status={item.status}
                      level={1}
                    />

                    {nivel2.length > 0 && idx === 0 && (
                      <div className="mt-1 flex flex-col items-center">
                        <Connector />
                        <div className="flex gap-3">
                          {nivel2.slice(0, 3).map((n2) => (
                            <TreeNode
                              key={n2.id}
                              label={n2.indicado_nome ?? "?"}
                              sublabel={`R$ ${n2.commission_value ?? 0}`}
                              status={n2.status}
                              level={2}
                            />
                          ))}
                          {nivel2.length > 3 && (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-50 shadow-soft">
                                <span className="font-display text-lg font-bold text-purple-500">
                                  +{nivel2.length - 3}
                                </span>
                              </div>
                              <p className="text-[10px] text-ink-subtle">mais</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
        <div className="flex items-center gap-1.5">
          <PersonIcon size={14} color="#7C3AED" />
          <span className="font-semibold text-brand-700">Usuário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PersonIcon size={14} color="#F26B0A" />
          <span>Nível 1 · R$ 20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PersonIcon size={14} color="#5618B0" />
          <span>Nível 2 · R$ 5</span>
        </div>
      </div>
    </div>
  );
}

function ListView({ items }: { items: AdminReferralItem[] }) {
  if (items.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-ink-muted">
        Sem indicações.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[#E8E4F3] bg-surface-soft">
            {["Indicado", "Nível", "Comissão", "Status", "Cadastro", "Liberação"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-subtle"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1ECF8]">
          {items.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            return (
              <tr key={item.id} className="transition-colors hover:bg-brand-50/40">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {(item.indicado_nome ?? "?")[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-ink">
                      {item.indicado_nome ?? "Aguardando cadastro"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      item.level === 1
                        ? "bg-brand-100 text-brand-700"
                        : "bg-purple-100 text-purple-700"
                    )}
                  >
                    Nível {item.level}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-semibold text-ink">
                  {formatBRL(item.commission_value ?? 0)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                      cfg.cls
                    )}
                  >
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-ink-muted">{formatDate(item.created_at)}</td>
                <td className="px-4 py-2.5 text-ink-muted">
                  {item.paid_at ? `Pago ${formatDate(item.paid_at)}` : formatDate(item.release_date)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReferrerRow({ row }: { row: AdminReferrerRow }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"lista" | "arvore">("lista");
  const initial = (row.referrer_nome[0] ?? "?").toUpperCase();

  return (
    <div className="border-b border-[#F1ECF8] last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-brand-50/40 md:grid-cols-[auto_2fr_1fr_1fr_1fr_auto]"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {initial}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{row.referrer_nome}</p>
          <p className="truncate text-xs text-ink-muted">
            {row.total_indicacoes} {row.total_indicacoes === 1 ? "indicação" : "indicações"} · N1:{" "}
            {row.nivel1Count} · N2: {row.nivel2Count}
          </p>
        </div>

        <div className="hidden text-right md:block">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
            Disponível
          </p>
          <p className="text-sm font-semibold text-emerald-600">
            {formatBRL(row.saldoDisponivel)}
          </p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
            Pendente
          </p>
          <p className="text-sm font-semibold text-amber-600">
            {formatBRL(row.saldoPendente)}
          </p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">Pago</p>
          <p className="text-sm font-semibold text-brand-700">{formatBRL(row.totalPago)}</p>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-ink-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-[#F1ECF8] bg-surface-soft/40 px-5 py-4">
          {/* Toggle Lista / Árvore */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Indicações de {row.referrer_nome}</h3>
              {row.referrer_slug && (
                <p className="font-mono text-[11px] text-ink-subtle">/ref/{row.referrer_slug}</p>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-soft">
              <button
                onClick={() => setView("lista")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  view === "lista"
                    ? "bg-brand-100 text-brand-700"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <LayoutList className="h-3.5 w-3.5" />
                Lista
              </button>
              <button
                onClick={() => setView("arvore")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  view === "arvore"
                    ? "bg-brand-100 text-brand-700"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Network className="h-3.5 w-3.5" />
                Árvore
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-soft">
            {view === "lista" ? (
              <ListView items={row.items} />
            ) : (
              <TreeView items={row.items} userName={row.referrer_nome} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function IndicacoesAdminClient({ rows, kpis }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? rows.filter(
        (r) =>
          r.referrer_nome.toLowerCase().includes(query.toLowerCase()) ||
          (r.referrer_slug ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : rows;

  const kpiCards = [
    {
      label: "Usuários indicadores",
      value: String(kpis.totalUsuariosIndicadores),
      icon: Share2,
      bg: "bg-brand-100",
      color: "text-brand-700",
    },
    {
      label: "Total de indicações",
      value: String(kpis.totalIndicacoes),
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-700",
    },
    {
      label: "Comissão disponível",
      value: formatBRL(kpis.totalComissaoDisponivel),
      icon: Wallet,
      bg: "bg-emerald-100",
      color: "text-emerald-700",
    },
    {
      label: "Comissão pendente",
      value: formatBRL(kpis.totalComissaoPendente),
      icon: Clock,
      bg: "bg-amber-100",
      color: "text-amber-700",
    },
    {
      label: "Comissão paga",
      value: formatBRL(kpis.totalComissaoPaga),
      icon: TrendingUp,
      bg: "bg-purple-100",
      color: "text-purple-700",
    },
  ];

  return (
    <div>
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]"
          >
            <div className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", k.bg)}>
              <k.icon className={cn("h-5 w-5", k.color)} />
            </div>
            <p className="font-display text-xl font-bold text-ink">{k.value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de usuários indicadores */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[#E8E4F3] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Usuários indicadores
            </h2>
            <p className="text-xs text-ink-muted">
              {filtered.length}{" "}
              {filtered.length === 1 ? "usuário encontrado" : "usuários encontrados"}
            </p>
          </div>

          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou slug..."
              className="w-full rounded-xl border border-[#E8E4F3] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
              <Users className="h-8 w-8 text-brand-300" />
            </div>
            <p className="font-display text-lg font-bold text-ink">
              Nenhum usuário indicador encontrado
            </p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              {query
                ? "Tente buscar com outro termo."
                : "Quando usuários começarem a indicar amigos, eles aparecerão aqui."}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((row) => (
              <ReferrerRow key={row.referrer_id} row={row} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
