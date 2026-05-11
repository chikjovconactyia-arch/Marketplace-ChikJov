"use client";

import { useState, useTransition } from "react";
import { Pencil, X, Loader2, CheckCircle2, AlertCircle, Search, Filter } from "lucide-react";
import { updateLeadAction } from "@/app/actions/leads";
import type { Database } from "@/lib/database.types";
type LeadEmpresa = Database["public"]["Tables"]["leads_empresas"]["Row"];
type LeadStatus = Database["public"]["Enums"]["lead_status"];
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "novo", label: "Novo lead", color: "bg-blue-100 text-blue-700" },
  { value: "em_contato", label: "Em contato", color: "bg-amber-100 text-amber-700" },
  { value: "convertido", label: "Convertido", color: "bg-emerald-100 text-emerald-700" },
  { value: "perdido", label: "Perdido", color: "bg-red-100 text-red-700" },
];

function StatusBadge({ status }: { status: LeadStatus | null }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  if (!opt) return <span className="text-xs text-ink-subtle">—</span>;
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", opt.color)}>
      {opt.label}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

interface EditModalProps {
  lead: LeadEmpresa;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

function EditModal({ lead, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({
    nome_responsavel: lead.nome_responsavel,
    telefone: lead.telefone,
    email: lead.email,
    nome_empresa: lead.nome_empresa,
    origem: lead.origem ?? "",
    status: (lead.status ?? "novo") as LeadStatus,
    instagram: lead.instagram ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateLeadAction({ id: lead.id, ...form });
      if (res.ok) {
        onSaved(res.message);
        onClose();
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4F3] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Editar empresa</h2>
            <p className="text-xs text-ink-muted">Cadastrado em {formatDate(lead.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo *" value={form.nome_responsavel} onChange={set("nome_responsavel")} placeholder="João Silva" />
            <Field label="WhatsApp *" value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-9999" />
            <Field label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="voce@empresa.com" className="sm:col-span-2" />
            <Field label="Nome da empresa *" value={form.nome_empresa} onChange={set("nome_empresa")} placeholder="Studio Bella" />
            <Field label="Instagram" value={form.instagram} onChange={set("instagram")} placeholder="@suaempresa" />
            <Field label="Origem" value={form.origem} onChange={set("origem")} placeholder="Landing Page" />
          </div>

          {/* Status select */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-ink">Status</label>
            <select
              value={form.status}
              onChange={set("status")}
              className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E8E4F3] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-[#E8E4F3] px-5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand-200 hover:text-ink"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={pending}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-500 px-5 text-sm font-semibold text-white shadow-cta transition-colors hover:bg-accent-600 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}
function Field({ label, className, ...props }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
      {message}
      <button onClick={onClose} className="ml-2 text-white/60 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LeadsTable({ leads }: { leads: LeadEmpresa[] }) {
  const [editing, setEditing] = useState<LeadEmpresa | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.nome_empresa.toLowerCase().includes(q) ||
      l.nome_responsavel.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Buscar empresa, responsável..."
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
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <span className="ml-auto text-xs text-ink-subtle">
          {filtered.length} de {leads.length} registro{leads.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E8E4F3] bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07)]">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[#E8E4F3] bg-surface-soft">
              {["Empresa", "Responsável", "WhatsApp", "Email", "Status", "Origem", "Data", "Ações"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1ECF8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-subtle">
                  Nenhum resultado encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="group transition-colors hover:bg-brand-50/40"
                >
                  <td className="px-4 py-3 font-medium text-ink">{lead.nome_empresa}</td>
                  <td className="px-4 py-3 text-ink-muted">{lead.nome_responsavel}</td>
                  <td className="px-4 py-3 text-ink-muted">{lead.telefone}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-ink-muted">
                    {lead.email}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-subtle">{lead.origem ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-subtle">{formatDate(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditing(lead)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-transparent text-ink-subtle opacity-0 transition-all group-hover:border-brand-100 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:opacity-100"
                      aria-label="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          lead={editing}
          onClose={() => setEditing(null)}
          onSaved={showToast}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
