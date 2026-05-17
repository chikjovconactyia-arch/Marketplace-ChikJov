"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  UserPlus,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LeadStatus =
  | "nunca_pagou"
  | "em_trial"
  | "trial_expirado"
  | "pendente"
  | "cancelado";

export interface LeadClienteRow {
  id: string;
  nome: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  created_at: string | null;
  created_ago: string;
  status: LeadStatus;
}

interface KpiCounts {
  total: number;
  emTrial: number;
  trialExpirado: number;
  pendente: number;
  cancelado: number;
}

interface Props {
  rows: LeadClienteRow[];
  kpis: KpiCounts;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; cls: string }> = {
  nunca_pagou: {
    label: "Sem assinatura",
    cls: "bg-surface-muted text-ink-subtle",
  },
  em_trial: { label: "Em período grátis", cls: "bg-amber-100 text-amber-700" },
  trial_expirado: { label: "Trial expirado", cls: "bg-orange-100 text-orange-700" },
  pendente: { label: "Pagamento pendente", cls: "bg-red-100 text-red-700" },
  cancelado: { label: "Cancelou no trial", cls: "bg-purple-100 text-purple-700" },
};

const STATUS_OPTIONS: { value: LeadStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "nunca_pagou", label: "Sem assinatura" },
  { value: "em_trial", label: "Em período grátis" },
  { value: "trial_expirado", label: "Trial expirado" },
  { value: "pendente", label: "Pagamento pendente" },
  { value: "cancelado", label: "Cancelou no trial" },
];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}


export function LeadsClientesClient({ rows, kpis }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "todos">("todos");

  const kpiCards = [
    { label: "Total de leads", value: kpis.total, icon: UserPlus, bg: "bg-brand-100", color: "text-brand-700" },
    { label: "Em período grátis", value: kpis.emTrial, icon: Clock, bg: "bg-amber-100", color: "text-amber-700" },
    { label: "Trial expirado", value: kpis.trialExpirado, icon: AlertCircle, bg: "bg-orange-100", color: "text-orange-700" },
    { label: "Pagamento pendente", value: kpis.pendente, icon: XCircle, bg: "bg-red-100", color: "text-red-700" },
    { label: "Cancelados em trial", value: kpis.cancelado, icon: Ban, bg: "bg-purple-100", color: "text-purple-700" },
  ];

  const filtered = useMemo(() => {
    let list = rows;
    if (statusFilter !== "todos") {
      list = list.filter((r) => r.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.nome ?? "").toLowerCase().includes(q) ||
          (r.email ?? "").toLowerCase().includes(q) ||
          (r.phone ?? "").toLowerCase().includes(q) ||
          (r.city ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, query, statusFilter]);

  return (
    <div>
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]"
          >
            <div
              className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", k.bg)}
            >
              <k.icon className={cn("h-5 w-5", k.color)} />
            </div>
            <p className="font-display text-3xl font-bold text-ink">{k.value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        {/* Cabeçalho com busca e filtro */}
        <div className="flex flex-col gap-3 border-b border-[#E8E4F3] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Lista de leads
            </h2>
            <p className="text-xs text-ink-muted">
              {filtered.length}{" "}
              {filtered.length === 1 ? "lead encontrado" : "leads encontrados"}
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar nome, email, telefone..."
                className="w-full rounded-xl border border-[#E8E4F3] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "todos")}
              className="rounded-xl border border-[#E8E4F3] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
              <Users className="h-8 w-8 text-brand-300" />
            </div>
            <p className="font-display text-lg font-bold text-ink">
              Nenhum lead encontrado
            </p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              {query || statusFilter !== "todos"
                ? "Tente ajustar a busca ou o filtro de status."
                : "Quando novos clientes se cadastrarem sem pagar, eles aparecerão aqui."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-[#E8E4F3] bg-surface-soft">
                  {["Cliente", "Contato", "Cidade", "Status", "Trial expira", "Cadastro"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECF8]">
                {filtered.map((lead) => {
                  const cfg = STATUS_CONFIG[lead.status];
                  const initial = (lead.nome ?? lead.email ?? "?")[0]?.toUpperCase();
                  return (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-brand-50/40"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {lead.nome ?? "Sem nome"}
                            </p>
                            {lead.email && (
                              <p className="truncate text-xs text-ink-muted">
                                {lead.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1 text-xs">
                          {lead.phone ? (
                            <span className="inline-flex items-center gap-1.5 text-ink">
                              <Phone className="h-3 w-3 text-ink-muted" />
                              {lead.phone}
                            </span>
                          ) : (
                            <span className="text-ink-subtle">—</span>
                          )}
                          {lead.email && (
                            <span className="inline-flex items-center gap-1.5 text-ink-muted">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {lead.city ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-ink">
                            <MapPin className="h-3.5 w-3.5 text-ink-muted" />
                            {lead.city}
                          </span>
                        ) : (
                          <span className="text-ink-subtle">—</span>
                        )}
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
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Calendar className="h-3 w-3" />
                          {formatDate(lead.trial_ends_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-ink">
                            {formatDate(lead.created_at)}
                          </span>
                          <span className="text-[10px] text-ink-subtle">
                            {lead.created_ago}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
