"use client";

import { useState, useRef, useTransition, DragEvent } from "react";
import {
  Plus, Pencil, Trash2, Copy, Eye, X,
  Loader2, CheckCircle2, AlertCircle, Play, Pause,
  LayoutGrid, List, GripVertical, Heart, ExternalLink
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  createHomeCardAction,
  updateHomeCardAction,
  toggleHomeCardAction,
  deleteHomeCardAction,
  duplicateHomeCardAction,
  reorderHomeCardsAction,
} from "@/app/actions/home-cards";
import { cn } from "@/lib/utils";

interface HomeCard {
  id: string;
  title: string;
  description: string;
  tag_value: string;
  cta_link: string | null;
  icon_left_name: string;
  icon_left_bg: string;
  icon_right_name: string;
  icon_right_color: string;
  active: boolean;
  order: number;
}

const ICON_OPTIONS = [
  { value: "FolderGit2", label: "Pasta / Git" },
  { value: "Target", label: "Alvo / Foco" },
  { value: "Briefcase", label: "Maleta / Trabalho" },
  { value: "LayoutGrid", label: "Grade / Menu" },
  { value: "Compass", label: "Bússola" },
  { value: "Activity", label: "Atividade / Pulso" },
  { value: "Smile", label: "Sorriso / Clientes" },
  { value: "ShoppingBag", label: "Sacola / Vendas" },
  { value: "Award", label: "Troféu / Prêmio" },
  { value: "Heart", label: "Coração / Favorito" },
  { value: "Layers", label: "Camadas" },
  { value: "Shield", label: "Escudo / Segurança" },
  { value: "BarChart3", label: "Gráfico de Barras" },
  { value: "GitBranch", label: "Ramificação" },
  { value: "Gem", label: "Joia / Diamante" },
  { value: "TrendingUp", label: "Tendência" },
  { value: "Network", label: "Rede" },
  { value: "Mountain", label: "Montanha" },
  { value: "Sparkles", label: "Brilhos" },
  { value: "CreditCard", label: "Cartão / Pagamento" },
  { value: "Percent", label: "Porcentagem / Desconto" },
  { value: "Star", label: "Estrela" },
  { value: "Users", label: "Grupo / Clientes" },
  { value: "Settings", label: "Configuração" }
];

const LEFT_COLOR_OPTIONS = [
  { value: "bg-[#EEF2F6] text-[#6B21D9]", label: "Roxo / Lilás suave" },
  { value: "bg-[#E6F0FA] text-[#2563EB]", label: "Azul suave" },
  { value: "bg-[#E6F4EA] text-[#16A34A]", label: "Verde suave" },
  { value: "bg-[#FFF4EB] text-[#F26B0A]", label: "Laranja suave" },
  { value: "bg-[#FFF0F0] text-[#EF4444]", label: "Vermelho suave" },
  { value: "bg-[#F1F5F9] text-[#475569]", label: "Cinza suave" },
  { value: "bg-[#FCF8E3] text-[#B78B00]", label: "Amarelo suave" }
];

const RIGHT_COLOR_OPTIONS = [
  { value: "text-[#8B5CF6]", label: "Roxo" },
  { value: "text-[#2563EB]", label: "Azul" },
  { value: "text-[#16A34A]", label: "Verde" },
  { value: "text-[#F26B0A]", label: "Laranja" },
  { value: "text-[#EF4444]", label: "Vermelho" },
  { value: "text-[#64748B]", label: "Cinza Médio" },
  { value: "text-[#475569]", label: "Chumbo Escuro" }
];

// Componente para renderizar ícone dinamicamente pelo nome string
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "error"; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up",
      type === "ok" ? "bg-ink" : "bg-red-600"
    )}>
      {type === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}

// ─── Mini Card Preview ────────────────────────────────────────────────────────
function CardPreview({ card }: { card: HomeCard }) {
  return (
    <div className={cn(
      "relative flex flex-col justify-between p-5 rounded-[28px] text-left min-h-[220px]",
      "bg-brand-500/8 backdrop-blur-xl border border-brand-500/15 shadow-sm",
      "transition-all duration-300"
    )}>
      {/* Botão de favoritos fictício */}
      <div className="absolute top-4 right-4 p-2 text-slate-400">
        <Heart className="h-5 w-5 text-slate-400/80" />
      </div>

      <div>
        {/* Ícones no topo */}
        <div className="flex items-center gap-2 mb-4">
          <div className={cn(
            "flex items-center justify-center h-10 w-10 rounded-[14px]",
            card.icon_left_bg,
            "shadow-sm"
          )}>
            <DynamicIcon name={card.icon_left_name} className="h-5 w-5" />
          </div>

          <div className={cn(
            "flex items-center justify-center h-10 w-10 rounded-[14px] bg-white",
            "shadow-[0_3px_8px_-2px_rgba(15,10,31,0.08)]"
          )}>
            <DynamicIcon name={card.icon_right_name} className={cn("h-5 w-5", card.icon_right_color)} />
          </div>
        </div>

        {/* Título */}
        <h4 className="font-display text-lg font-bold text-[#0F0A1F] tracking-tight mb-1.5">
          {card.title || "Título do Card"}
        </h4>

        {/* Descrição */}
        <p className="text-xs text-slate-600/90 leading-relaxed font-sans line-clamp-3">
          {card.description || "Descrição rápida que aparecerá no card na home page..."}
        </p>
      </div>

      {/* Rodapé do Card */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[10px] text-brand-600 font-medium flex items-center gap-1">
          {card.cta_link ? (
            <><ExternalLink className="h-3 w-3" /> {card.cta_link}</>
          ) : (
            <span className="text-slate-400">Sem link</span>
          )}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F0A1F]/10 border border-white/30">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
          <span className="text-[10px] font-bold text-[#0F0A1F]/90 font-mono">
            {card.tag_value || "0.0"}
          </span>
        </div>
      </div>

      {!card.active && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-black/60 z-20">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-ink">Inativo</span>
        </div>
      )}
    </div>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────
const emptyForm = {
  title: "",
  description: "",
  tag_value: "9.0",
  cta_link: "/dashboard/cliente",
  icon_left_name: "FolderGit2",
  icon_left_bg: "bg-[#EEF2F6] text-[#6B21D9]",
  icon_right_name: "BarChart3",
  icon_right_color: "text-[#8B5CF6]",
  order: 0,
  active: true
};

function CardModal({
  editing,
  onClose,
  onSaved
}: {
  editing: HomeCard | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [form, setForm] = useState(() =>
    editing
      ? {
          title: editing.title,
          description: editing.description,
          tag_value: editing.tag_value,
          cta_link: editing.cta_link ?? "",
          icon_left_name: editing.icon_left_name,
          icon_left_bg: editing.icon_left_bg,
          icon_right_name: editing.icon_right_name,
          icon_right_color: editing.icon_right_color,
          order: editing.order,
          active: editing.active
        }
      : { ...emptyForm }
  );

  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"content" | "preview">("content");

  const save = () => {
    setError(null);
    start(async () => {
      const res = editing
        ? await updateHomeCardAction(editing.id, form)
        : await createHomeCardAction(form);
      if (res.ok) {
        onSaved(res.message);
        onClose();
      } else {
        setError(res.message);
      }
    });
  };

  const fakeCard: HomeCard = {
    id: "preview",
    title: form.title || "Título do Card",
    description: form.description || "Descrição rápida que aparecerá no card na home page...",
    tag_value: form.tag_value || "0.0",
    cta_link: form.cta_link || null,
    icon_left_name: form.icon_left_name,
    icon_left_bg: form.icon_left_bg,
    icon_right_name: form.icon_right_name,
    icon_right_color: form.icon_right_color,
    active: form.active,
    order: form.order
  };

  const inputCls = "w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4F3] px-6 py-4 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              {editing ? "Editar Card" : "Novo Card"}
            </h2>
            <p className="text-xs text-ink-muted">Recursos Exclusivos · Landing Page</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-xl bg-surface-muted p-1">
              {(["content", "preview"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    tab === t ? "bg-white text-brand-700 shadow-soft" : "text-ink-muted hover:text-ink")}>
                  {t === "content" ? "Conteúdo" : "Preview"}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "preview" ? (
            <div className="space-y-6 p-6">
              <p className="text-xs text-ink-muted">Preview · Como aparecerá na home page (sobre fundo branco)</p>
              <div className="p-8 bg-white border border-brand-100 rounded-2xl">
                <CardPreview card={fakeCard} />
              </div>
              <p className="text-center text-xs text-ink-subtle">
                O card será exibido com transparência roxa sobre o fundo branco da seção.
              </p>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* Título */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Título do Card *</label>
                <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Management" maxLength={50} />
              </div>

              {/* Descrição */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Descrição do Card *</label>
                <textarea className={cn(inputCls, "min-h-[96px] resize-none")} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Insira uma descrição explicativa curta para o card..." maxLength={220} />
                <p className="mt-1 text-right text-[10px] text-ink-subtle">{form.description.length}/220 caracteres</p>
              </div>

              {/* Link do Card */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Link do Card (CTA) (opcional)</label>
                <input className={inputCls} value={form.cta_link} onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))} placeholder="Ex: /dashboard/cliente ou https://site.com" />
                <p className="mt-1 text-[10px] text-ink-subtle">Deixe em branco para o card não ter clique de direcionamento</p>
              </div>

              {/* Tag Value */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Valor da Tag inferior (ex: 9.0)</label>
                <input className={inputCls} value={form.tag_value} onChange={(e) => setForm((f) => ({ ...f, tag_value: e.target.value }))} placeholder="Ex: 9.0 ou 5.0" maxLength={8} />
              </div>

              {/* Ícones */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Ícone Esquerdo */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Ícone da Esquerda</label>
                  <select className={inputCls} value={form.icon_left_name} onChange={(e) => setForm((f) => ({ ...f, icon_left_name: e.target.value }))}>
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Ícone Direito */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Ícone da Direita</label>
                  <select className={inputCls} value={form.icon_right_name} onChange={(e) => setForm((f) => ({ ...f, icon_right_name: e.target.value }))}>
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cores */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Cor do Ícone Esquerdo */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Cores do Ícone Esquerdo</label>
                  <select className={inputCls} value={form.icon_left_bg} onChange={(e) => setForm((f) => ({ ...f, icon_left_bg: e.target.value }))}>
                    {LEFT_COLOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Cor do Ícone Direito */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Cor do Ícone Direito</label>
                  <select className={inputCls} value={form.icon_right_color} onChange={(e) => setForm((f) => ({ ...f, icon_right_color: e.target.value }))}>
                    {RIGHT_COLOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ordem e Ativo */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Ordem de exibição</label>
                  <input type="number" className={inputCls} value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} min={0} />
                </div>
                <div className="flex items-end">
                  <div className="flex w-full items-center justify-between rounded-xl border border-[#E8E4F3] px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-ink">Card ativo</p>
                      <p className="text-[10px] text-ink-subtle">Visível na landing page</p>
                    </div>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                      className={cn("relative h-6 w-11 rounded-full transition-colors", form.active ? "bg-brand-500" : "bg-surface-muted")}>
                      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", form.active ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E8E4F3] px-6 py-4 shrink-0">
          <button onClick={onClose} className="rounded-full border border-[#E8E4F3] px-5 py-2 text-sm font-medium text-ink-muted hover:border-brand-200">
            Cancelar
          </button>
          <button onClick={save} disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#7C3AED] px-6 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
            {pending ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : <>{editing ? "Salvar" : "Criar Card"}</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function ConfirmDelete({ card, onClose, onConfirm }: { card: HomeCard; onClose: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-100">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="font-display text-lg font-bold text-ink">Excluir Card?</h3>
        <p className="mt-1 text-sm text-ink-muted">
          O card <strong>"{card.title}"</strong> será excluído permanentemente da Home.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-[#E8E4F3] py-2 text-sm font-medium text-ink-muted">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 rounded-full bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700">Excluir</button>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function HomeCardsClient({ cards: initialCards }: { cards: HomeCard[] }) {
  const [cards, setCards] = useState<HomeCard[]>(initialCards);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modal, setModal] = useState<"create" | HomeCard | null>(null);
  const [deleting, setDeleting] = useState<HomeCard | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [pending, startTransition] = useTransition();

  // Drag and Drop reorder
  const dragId = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const onDragStart = (e: DragEvent, id: string) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(id);
  };

  const onDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOver(null);
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) return;

    const fromIdx = cards.findIndex((c) => c.id === fromId);
    const toIdx = cards.findIndex((c) => c.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const newCards = [...cards];
    const [moved] = newCards.splice(fromIdx, 1);
    newCards.splice(toIdx, 0, moved);

    const updated = newCards.map((c, i) => ({ ...c, order: i }));
    setCards(updated);

    startTransition(async () => {
      const res = await reorderHomeCardsAction(updated.map((c) => ({ id: c.id, order: c.order })));
      if (res.ok) {
        showToast("Ordem dos cards salva!");
      } else {
        showToast(res.message, "error");
      }
    });
    dragId.current = null;
  };

  const onDragEnd = () => {
    setDragOver(null);
    dragId.current = null;
  };

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const reload = () => window.location.reload();

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const res = await toggleHomeCardAction(id, active);
      if (res.ok) {
        setCards((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
        showToast(res.message);
      } else {
        showToast(res.message, "error");
      }
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const res = await duplicateHomeCardAction(id);
      if (res.ok) {
        showToast(res.message);
        reload();
      } else {
        showToast(res.message, "error");
      }
    });
  };

  const handleDelete = () => {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    startTransition(async () => {
      const res = await deleteHomeCardAction(id);
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== id));
        showToast(res.message);
      } else {
        showToast(res.message, "error");
      }
    });
  };

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            {cards.filter((c) => c.active).length} ativos
          </span>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-ink-subtle">
            {cards.filter((c) => !c.active).length} inativos
          </span>
          <span className="hidden text-xs text-ink-subtle md:block">
            · Arraste os cards para reordenar a exibição
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex gap-1 rounded-xl bg-surface-muted p-1">
            <button onClick={() => setViewMode("grid")}
              className={cn("grid h-8 w-8 place-items-center rounded-lg transition-all",
                viewMode === "grid" ? "bg-white shadow-soft text-[#7C3AED]" : "text-ink-muted hover:text-ink")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={cn("grid h-8 w-8 place-items-center rounded-lg transition-all",
                viewMode === "list" ? "bg-white shadow-soft text-[#7C3AED]" : "text-ink-muted hover:text-ink")}>
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Create */}
          <button onClick={() => setModal("create")}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-500 px-5 text-sm font-bold text-white shadow-cta hover:bg-accent-600">
            <Plus className="h-4 w-4" />
            Novo Card
          </button>
        </div>
      </div>

      {/* Grid / List View */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-100 bg-white py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <LayoutGrid className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-display text-lg font-bold text-ink">Nenhum card criado</p>
          <p className="mt-1 text-sm text-ink-muted">Adicione o primeiro card de serviço para a home page!</p>
          <button onClick={() => setModal("create")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-cta hover:bg-accent-600">
            <Plus className="h-4 w-4" />
            Criar primeiro card
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => onDragStart(e, card.id)}
              onDragOver={(e) => onDragOver(e, card.id)}
              onDrop={(e) => onDrop(e, card.id)}
              onDragEnd={onDragEnd}
              className={cn(
                "group flex cursor-grab flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07)] transition-all active:cursor-grabbing hover:shadow-md",
                dragOver === card.id && "ring-2 ring-brand-400 ring-offset-2 scale-[1.01]"
              )}
            >
              <div className="relative p-5 flex-1 bg-slate-50/50">
                {/* Grip Handle */}
                <div className="absolute left-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-lg bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4" />
                </div>

                <CardPreview card={card} />

                {/* Hover overlay actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-2xl bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100 z-30">
                  <button onClick={() => setModal(card)} className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink transition-all hover:bg-brand-50 hover:text-brand-600 shadow-lg">
                    <Pencil className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={() => handleDuplicate(card.id)} className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink transition-all hover:bg-brand-50 hover:text-brand-600 shadow-lg">
                    <Copy className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={() => setDeleting(card)} className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 text-white transition-all hover:bg-red-700 shadow-lg">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-t border-brand-100 bg-white">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-ink">{card.title}</p>
                  <p className="text-[10px] text-ink-subtle">Ordem: #{card.order + 1}</p>
                </div>
                <button onClick={() => handleToggle(card.id, !card.active)} title={card.active ? "Desativar" : "Ativar"}
                  className={cn("grid h-8 w-8 place-items-center rounded-lg transition-colors",
                    card.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-surface-muted text-ink-subtle hover:bg-surface-soft")}>
                  {card.active ? <Play className="h-4 w-4 fill-emerald-600 text-emerald-600" /> : <Pause className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-2xl border border-[#E8E4F3] bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#E8E4F3] bg-surface-soft font-semibold text-ink-subtle">
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider">Ícones</th>
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider">Título</th>
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider">Descrição</th>
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider">Tag</th>
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider">Link</th>
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider">Posição</th>
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECF8]">
                {cards.map((card) => (
                  <tr key={card.id} className={cn("hover:bg-brand-50/10 transition-colors", !card.active && "opacity-75 bg-slate-50/50")}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("flex items-center justify-center h-8 w-8 rounded-lg", card.icon_left_bg)}>
                          <DynamicIcon name={card.icon_left_name} className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-brand-100 shadow-sm">
                          <DynamicIcon name={card.icon_right_name} className={cn("h-4.5 w-4.5", card.icon_right_color)} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-display font-bold text-ink whitespace-nowrap">{card.title}</td>
                    <td className="px-5 py-4 max-w-xs truncate text-ink-muted" title={card.description}>{card.description}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F0A1F]/10 text-ink">
                        {card.tag_value}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-brand-600 truncate max-w-[120px]" title={card.cta_link ?? ""}>
                      {card.cta_link || "-"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button onClick={() => handleToggle(card.id, !card.active)}
                        className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          card.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", card.active ? "bg-emerald-500" : "bg-slate-400")} />
                        {card.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">#{card.order + 1}</td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setModal(card)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-[#7C3AED]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDuplicate(card.id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-[#7C3AED]">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleting(card)} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modais */}
      {modal && (
        <CardModal
          editing={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={(msg) => {
            showToast(msg);
            reload();
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          card={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
