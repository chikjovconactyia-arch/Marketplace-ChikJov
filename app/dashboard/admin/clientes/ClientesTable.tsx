"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search, CheckCircle2, ShieldBan, Pencil, Trash2,
  AlertCircle, MessageCircle, User, ShieldCheck, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { blockClienteAction, deleteClienteAction } from "@/app/actions/admin-clientes";
import { EditClienteModal } from "./EditClienteModal";

interface ClienteRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  email: string;
  is_banned: boolean;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatWhatsApp(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? `https://wa.me/55${digits}` : null;
}

function StatusBadge({ isBanned, status }: { isBanned: boolean; status: string | null }) {
  if (isBanned) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Bloqueado
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ativo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Inativo
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
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

export function ClientesTable({ clientes }: { clientes: ClienteRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [editingCliente, setEditingCliente] = useState<ClienteRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleBlock = (id: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? "Deseja desbloquear este cliente?" : "Deseja bloquear o acesso deste cliente?")) return;
    
    startTransition(async () => {
      const res = await blockClienteAction(id, currentlyBanned);
      if (res.ok) {
        showToast(res.message);
        router.refresh();
      } else {
        showToast(res.message, "error");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente DEFINITIVAMENTE? Essa ação não pode ser desfeita.")) return;
    
    startTransition(async () => {
      const res = await deleteClienteAction(id);
      if (res.ok) {
        showToast(res.message);
        router.refresh();
      } else {
        showToast(res.message, "error");
      }
    });
  };

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (c.full_name ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q) ||
      (c.city ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Filtros */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#E8E4F3] bg-white pl-9 pr-4 text-sm text-ink placeholder-ink-subtle outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <span className="ml-auto text-xs text-ink-subtle">
          {filtered.length} de {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-2xl border border-[#E8E4F3] bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07)]">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-[#E8E4F3] bg-surface-soft">
              {["Cliente", "Contato / Local", "Plano", "Status", "Data Cadastro", "Ações"].map((h) => (
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
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const waLink = formatWhatsApp(c.phone);
                
                return (
                  <tr key={c.id} className="group transition-colors hover:bg-brand-50/40">
                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block font-semibold text-ink">{c.full_name || "Sem Nome"}</span>
                          <span className="block text-xs text-ink-subtle">{c.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contato / Local */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-ink-muted">{c.phone ?? "Sem Telefone"}</p>
                      <p className="text-xs text-ink-subtle">{c.city ?? "Cidade não informada"}</p>
                    </td>

                    {/* Plano */}
                    <td className="px-4 py-3">
                      <span className="block rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink w-fit">
                        {c.subscription_plan || "Gratuito"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge isBanned={c.is_banned} status={c.subscription_status} />
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 text-xs text-ink-subtle">
                      {formatDate(c.created_at)}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* WhatsApp */}
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Contato via WhatsApp"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        ) : (
                          <div className="h-8 w-8" />
                        )}

                        {/* Editar */}
                        <button
                          onClick={() => setEditingCliente(c)}
                          title="Editar cliente"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* Bloquear / Desbloquear */}
                        <button
                          onClick={() => handleToggleBlock(c.id, c.is_banned)}
                          title={c.is_banned ? "Desbloquear cliente" : "Bloquear cliente"}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            c.is_banned 
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          )}
                        >
                          {c.is_banned ? <ShieldCheck className="h-4 w-4" /> : <ShieldBan className="h-4 w-4" />}
                        </button>
                        
                        {/* Excluir */}
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Excluir cliente"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {editingCliente && (
        <EditClienteModal
          cliente={editingCliente}
          onClose={() => setEditingCliente(null)}
          onSuccess={() => {
            showToast("Cliente atualizado com sucesso!");
            router.refresh();
          }}
        />
      )}
    </>
  );
}
