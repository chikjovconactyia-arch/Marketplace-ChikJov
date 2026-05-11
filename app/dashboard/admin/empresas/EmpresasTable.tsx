"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Filter, Building2, Star, CheckCircle2,
  XCircle, Pencil, X, Loader2, AlertCircle, ToggleLeft, ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleEmpresaStatusAction, toggleEmpresaFeaturedAction } from "@/app/actions/admin-empresas";
import { EditEmpresaModal } from "./EditEmpresaModal";

interface EmpresaRow {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  subscription_active: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
  empresario_nome: string | null;
  empresario_email: string | null;
  total_ofertas: number;
  total_vouchers: number;
  // Campos adicionais para edição
  cnpj: string | null;
  website: string | null;
  address: string | null;
  state: string | null;
  description: string | null;
  logo_url: string | null;
  instagram: string | null;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function StatusBadge({ active, subscriptionActive }: { active: boolean; subscriptionActive: boolean | null }) {
  if (active && subscriptionActive) return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ativa
    </span>
  );
  if (active) return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Sem plano
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Pendente
    </span>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "error"; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up",
      type === "ok" ? "bg-ink" : "bg-red-600"
    )}>
      {type === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

export function EmpresasTable({ empresas: initial }: { empresas: EmpresaRow[] }) {
  const [empresas, setEmpresas] = useState(initial);
  const router = useRouter();

  useEffect(() => {
    setEmpresas(initial);
  }, [initial]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaRow | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleAtivo = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      const res = await toggleEmpresaStatusAction(id, !currentActive);
      if (res.ok) {
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, active: !currentActive } : e));
        showToast(res.message);
      } else showToast(res.message, "error");
    });
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean | null) => {
    startTransition(async () => {
      const res = await toggleEmpresaFeaturedAction(id, !currentFeatured);
      if (res.ok) {
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, is_featured: !currentFeatured } : e));
        showToast(res.message);
      } else showToast(res.message, "error");
    });
  };

  const filtered = empresas.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.name.toLowerCase().includes(q) ||
      (e.empresario_nome ?? "").toLowerCase().includes(q) ||
      (e.empresario_email ?? "").toLowerCase().includes(q) ||
      (e.city ?? "").toLowerCase().includes(q) ||
      (e.category ?? "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && e.active && e.subscription_active) ||
      (statusFilter === "pending" && !e.active) ||
      (statusFilter === "no_plan" && e.active && !e.subscription_active);
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Buscar empresa, responsável, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#E8E4F3] bg-white pl-9 pr-4 text-sm text-ink placeholder-ink-subtle outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#E8E4F3] bg-white pl-9 pr-4 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas com plano</option>
            <option value="no_plan">Aprovadas sem plano</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>
        <span className="ml-auto text-xs text-ink-subtle">
          {filtered.length} de {empresas.length} empresa{empresas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E8E4F3] bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07)]">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-[#E8E4F3] bg-surface-soft">
              {["Empresa", "Responsável", "Contato", "Categoria / Cidade", "Ofertas", "Vouchers", "Status", "Destaque", "Cadastro", "Ações"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1ECF8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-sm text-ink-subtle">
                  Nenhuma empresa encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp.id} className="group transition-colors hover:bg-brand-50/40">
                  {/* Empresa */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-ink">{emp.name}</span>
                    </div>
                  </td>

                  {/* Responsável */}
                  <td className="px-4 py-3 text-ink-muted">
                    {emp.empresario_nome ?? "—"}
                  </td>

                  {/* Contato */}
                  <td className="px-4 py-3">
                    <p className="text-xs text-ink-muted">{emp.phone ?? "—"}</p>
                    <p className="text-xs text-ink-subtle truncate max-w-[160px]">{emp.empresario_email ?? emp.email ?? "—"}</p>
                  </td>

                  {/* Categoria / Cidade */}
                  <td className="px-4 py-3">
                    {emp.category && (
                      <span className="block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 w-fit">
                        {emp.category}
                      </span>
                    )}
                    <span className="text-xs text-ink-subtle">{emp.city ?? "—"}</span>
                  </td>

                  {/* Ofertas */}
                  <td className="px-4 py-3 text-center font-semibold text-ink">
                    {emp.total_ofertas}
                  </td>

                  {/* Vouchers */}
                  <td className="px-4 py-3 text-center font-semibold text-ink">
                    {emp.total_vouchers}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge active={emp.active} subscriptionActive={emp.subscription_active} />
                  </td>

                  {/* Destaque */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleFeatured(emp.id, emp.is_featured)}
                      title={emp.is_featured ? "Remover destaque" : "Colocar em destaque"}
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                        emp.is_featured
                          ? "bg-accent-100 text-accent-600 hover:bg-accent-200"
                          : "bg-surface-muted text-ink-subtle hover:bg-surface-soft"
                      )}
                    >
                      <Star className={cn("h-4 w-4", emp.is_featured && "fill-accent-500")} />
                    </button>
                  </td>

                  {/* Data */}
                  <td className="px-4 py-3 text-xs text-ink-subtle">
                    {formatDate(emp.created_at)}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingEmpresa(emp)}
                        title="Editar empresa"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleAtivo(emp.id, emp.active)}
                        title={emp.active ? "Bloquear empresa" : "Aprovar empresa"}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors",
                          emp.active
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        )}
                      >
                        {emp.active ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {emp.active ? "Bloquear" : "Aprovar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {editingEmpresa && (
        <EditEmpresaModal
          isOpen={!!editingEmpresa}
          empresa={editingEmpresa}
          onClose={() => setEditingEmpresa(null)}
          onSuccess={(msg) => {
            showToast(msg);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
