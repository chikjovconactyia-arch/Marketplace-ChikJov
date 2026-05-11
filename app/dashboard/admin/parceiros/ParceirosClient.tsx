"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Search, Star, Building2, ExternalLink, CheckCircle2, AlertCircle,
  X, Eye, ShieldCheck, ShieldOff
} from "lucide-react";
import { togglePartnerCarouselAction, togglePartnerActiveAction } from "@/app/actions/admin-parceiros";
import { cn } from "@/lib/utils";

interface Empresa {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  logo_url: string | null;
  active: boolean;
  subscription_active: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
}

function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "error"; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up",
      type === "ok" ? "bg-ink" : "bg-red-600"
    )}>
      {type === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
    </div>
  );
}

export function ParceirosClient({ empresas: initial }: { empresas: Empresa[] }) {
  const [empresas, setEmpresas] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "in_carousel" | "out_carousel">("all");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleCarousel = (id: string, current: boolean | null) => {
    const newVal = !current;
    setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, is_featured: newVal } : e));
    startTransition(async () => {
      const res = await togglePartnerCarouselAction(id, newVal);
      if (res.ok) showToast(res.message);
      else {
        // rollback
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, is_featured: current } : e));
        showToast(res.message, "error");
      }
    });
  };

  const handleToggleActive = (id: string, current: boolean) => {
    const newVal = !current;
    setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, active: newVal } : e));
    startTransition(async () => {
      const res = await togglePartnerActiveAction(id, newVal);
      if (res.ok) showToast(res.message);
      else {
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, active: current } : e));
        showToast(res.message, "error");
      }
    });
  };

  const filtered = useMemo(() => {
    return empresas.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.name.toLowerCase().includes(q) ||
        (e.category ?? "").toLowerCase().includes(q) ||
        (e.city ?? "").toLowerCase().includes(q);
      const inCarousel = e.is_featured && e.active;
      const matchFilter =
        filter === "all" ||
        (filter === "in_carousel" && inCarousel) ||
        (filter === "out_carousel" && !inCarousel);
      return matchSearch && matchFilter;
    });
  }, [empresas, search, filter]);

  return (
    <>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Buscar empresa, categoria, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#E8E4F3] bg-white pl-9 pr-4 text-sm text-ink placeholder-ink-subtle outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex gap-1 rounded-xl bg-surface-muted p-1">
          {([
            ["all", "Todas"],
            ["in_carousel", "No carrossel"],
            ["out_carousel", "Fora"],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                filter === val ? "bg-white text-brand-700 shadow-soft" : "text-ink-muted hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-ink-subtle">
          {filtered.length} de {empresas.length}
        </span>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-2xl border border-[#E8E4F3] bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07)]">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-[#E8E4F3] bg-surface-soft">
              {["Empresa", "Categoria", "Cidade", "Status", "Carrossel", "Ações"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1ECF8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-subtle">
                  Nenhuma empresa encontrada com este filtro.
                </td>
              </tr>
            ) : (
              filtered.map((emp) => {
                const inCarousel = emp.is_featured && emp.active;
                return (
                  <tr key={emp.id} className="group transition-colors hover:bg-brand-50/30">
                    {/* Empresa + logo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-50 ring-1 ring-brand-100">
                          {emp.logo_url ? (
                            <img src={emp.logo_url} alt={emp.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-4 w-4 text-brand-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{emp.name}</p>
                          {!emp.logo_url && (
                            <p className="text-[10px] text-amber-600">⚠ Sem logo</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3">
                      {emp.category ? (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                          {emp.category}
                        </span>
                      ) : <span className="text-ink-subtle">—</span>}
                    </td>

                    {/* Cidade */}
                    <td className="px-4 py-3 text-ink-muted">{emp.city ?? "—"}</td>

                    {/* Status ativo — botão explícito de aprovar/bloquear */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          emp.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                        )}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {emp.active ? "Ativa" : "Inativa"}
                        </span>
                        <button
                          onClick={() => handleToggleActive(emp.id, emp.active)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors border",
                            emp.active
                              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          )}
                        >
                          {emp.active
                            ? <><ShieldOff className="h-3 w-3" />Desativar</>
                            : <><ShieldCheck className="h-3 w-3" />Aprovar</>
                          }
                        </button>
                      </div>
                    </td>

                    {/* Toggle carrossel — independente do active */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCarousel(emp.id, emp.is_featured)}
                          title={emp.is_featured ? "Remover do carrossel" : "Adicionar ao carrossel"}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            emp.is_featured ? "bg-accent-500" : "bg-surface-muted hover:bg-surface-soft"
                          )}
                        >
                          <span className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                            emp.is_featured ? "translate-x-5" : "translate-x-0.5"
                          )} />
                        </button>
                        {emp.is_featured && (
                          <span className={cn(
                            "text-[10px] font-bold",
                            emp.active ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {emp.active ? "✓ No ar" : "⚠ Aprovar empresa"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <Link
                          href={`/empresa/${emp.id}`}
                          target="_blank"
                          title="Ver página pública"
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-brand-50 hover:text-brand-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Preview do carrossel atual */}
      {empresas.filter((e) => e.is_featured && e.active).length > 0 && (
        <div className="mt-8 rounded-2xl border border-[#E8E4F3] bg-white p-6 shadow-[0_1px_3px_rgba(124,58,237,0.07)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-ink">Pré-visualização do carrossel</h2>
              <p className="text-xs text-ink-muted">Como aparece na landing page agora</p>
            </div>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E4F3] px-3 py-1.5 text-xs font-semibold text-ink-muted hover:border-brand-200 hover:text-brand-700"
            >
              <Eye className="h-3.5 w-3.5" />
              Ver na landing
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {empresas
              .filter((e) => e.is_featured && e.active)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex w-[180px] items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-soft"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-50 ring-1 ring-brand-100">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5 text-brand-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-tight text-ink">{p.name}</p>
                    <p className="truncate text-[10px] uppercase tracking-wider text-ink-subtle">
                      {p.category ?? "Parceiro"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
