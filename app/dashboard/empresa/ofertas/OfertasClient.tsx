"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import {
  Plus, Pencil, Pause, Play, Copy, Trash2, Tag, Ticket,
  TrendingUp, LayoutGrid, CheckCircle2, AlertCircle,
  X, Eye, Zap, Image as ImageIcon, Package, UploadCloud, Loader2
} from "lucide-react";
import {
  createOfertaAction, updateOfertaAction,
  toggleOfertaAction, duplicateOfertaAction, deleteOfertaAction,
} from "@/app/actions/ofertas";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Oferta {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  price: number | null;
  discount_percent: number | null;
  image_url: string | null;
  active: boolean;
  created_at: string | null;
  vouchers_gerados: number;
  vouchers_usados: number;
}

interface Kpis {
  totalOfertas: number;
  ativas: number;
  pausadas: number;
  vouchersUsados: number;
  economiaTotal: number;
}

interface Props {
  ofertas: Oferta[];
  kpis: Kpis;
  empresaId: string | null;
  empresaNome: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TIPOS = ["Desconto", "Combo", "Cashback", "Brinde", "Experiência", "Plano mensal", "Serviço"];

const TIPO_COLORS: Record<string, string> = {
  Desconto: "bg-brand-100 text-brand-700",
  Combo: "bg-accent-100 text-accent-700",
  Cashback: "bg-emerald-100 text-emerald-700",
  Brinde: "bg-purple-100 text-purple-700",
  Experiência: "bg-pink-100 text-pink-700",
  "Plano mensal": "bg-blue-100 text-blue-700",
  Serviço: "bg-amber-100 text-amber-700",
};

const emptyForm = {
  title: "",
  description: "",
  type: "",
  originalPrice: "",
  discountPrice: "",
  discount_percent: "",
  image_url: "",
  active: true,
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-fade-up",
      type === "ok" ? "bg-[#0F0A1F]" : "bg-red-600"
    )}>
      {type === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, bg, color, prefix }: {
  label: string; value: number | string; icon: React.ElementType;
  bg: string; color: string; prefix?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(124,58,237,0.12)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-subtle">{label}</p>
          <p className="mt-2 flex items-baseline gap-1 font-display text-3xl font-bold text-ink">
            {prefix && <span className="text-base font-medium text-ink-muted">{prefix}</span>}
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
      </div>
    </div>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = useCallback(async (file: File) => {
    setUploadError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro no upload");
      onChange(json.url);
    } catch (e: any) {
      setUploadError(e.message ?? "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFile = (file: File | null) => { if (file) upload(file); };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">Imagem da oferta</label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-brand-100">
          <img src={value} alt="Preview" className="h-40 w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-ink hover:bg-white"
            >
              Trocar imagem
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 transition-all",
            dragging ? "border-brand-400 bg-brand-50" : "border-brand-100 bg-surface-soft hover:border-brand-300 hover:bg-brand-50/50",
            uploading && "cursor-not-allowed opacity-60"
          )}
        >
          {uploading ? (
            <><Loader2 className="h-8 w-8 animate-spin text-brand-400" /><p className="text-sm text-brand-600">Enviando...</p></>
          ) : (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100">
                <UploadCloud className="h-6 w-6 text-brand-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-ink">
                  Clique ou arraste a imagem aqui
                </p>
                <p className="mt-0.5 text-xs text-ink-subtle">JPG, PNG ou WebP · máx. 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />{uploadError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// ─── Live Preview Card ────────────────────────────────────────────────────────
function PreviewCard({ title, type, discount_percent, image_url, active }: {
  title: string; type: string; discount_percent: number | null; image_url: string; active: boolean;
}) {
  const pct = discount_percent ? Math.round(discount_percent) : null;
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card w-full max-w-[260px] mx-auto">
      <div className="relative aspect-[4/3] bg-surface-muted">
        {image_url ? (
          <img src={image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-subtle">
            <ImageIcon className="h-10 w-10 opacity-30" />
          </div>
        )}
        {pct && (
          <div className="absolute left-2.5 top-2.5 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white shadow-cta">
            {pct}% OFF
          </div>
        )}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink">Pausada</span>
          </div>
        )}
      </div>
      <div className="p-4">
        {type && (
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", TIPO_COLORS[type] ?? "bg-brand-100 text-brand-700")}>
            {type}
          </span>
        )}
        <p className="mt-1.5 font-display font-bold text-ink line-clamp-2">
          {title || "Nome da oferta"}
        </p>
        <button className="mt-3 w-full rounded-full border border-brand-200 py-1.5 text-xs font-semibold text-brand-700">
          Gerar Voucher
        </button>
      </div>
    </div>
  );
}

// ─── Oferta Card ──────────────────────────────────────────────────────────────
function OfertaCard({ oferta, onEdit, onToggle, onDuplicate, onDelete }: {
  oferta: Oferta;
  onEdit: (o: Oferta) => void;
  onToggle: (id: string, active: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (o: Oferta) => void;
}) {
  const pct = oferta.discount_percent ? Math.round(oferta.discount_percent) : null;
  const conversao = oferta.vouchers_gerados > 0
    ? Math.round((oferta.vouchers_usados / oferta.vouchers_gerados) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.06),0_4px_16px_rgba(124,58,237,0.04)] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(124,58,237,0.12)] hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
        {oferta.image_url ? (
          <img src={oferta.image_url} alt={oferta.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-ink-subtle/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {pct && (
            <span className="rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white shadow-cta">
              {pct}% OFF
            </span>
          )}
          {oferta.type && (
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", TIPO_COLORS[oferta.type] ?? "bg-brand-100 text-brand-700")}>
              {oferta.type}
            </span>
          )}
        </div>

        {/* Status indicator */}
        <div className="absolute right-3 top-3">
          <span className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm",
            oferta.active ? "bg-emerald-500 text-white" : "bg-white/90 text-amber-700"
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", oferta.active ? "bg-white" : "bg-amber-500")} />
            {oferta.active ? "Ativa" : "Pausada"}
          </span>
        </div>

        {/* Hover actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
          <ActionBtn icon={Pencil} label="Editar" onClick={() => onEdit(oferta)} />
          <ActionBtn icon={oferta.active ? Pause : Play} label={oferta.active ? "Pausar" : "Ativar"} onClick={() => onToggle(oferta.id, !oferta.active)} />
          <ActionBtn icon={Copy} label="Duplicar" onClick={() => onDuplicate(oferta.id)} />
          <ActionBtn icon={Trash2} label="Excluir" onClick={() => onDelete(oferta)} danger />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-display font-bold leading-snug text-ink line-clamp-2">{oferta.title}</p>
        {oferta.description && (
          <p className="mt-1 text-xs text-ink-muted line-clamp-2">{oferta.description}</p>
        )}

        {/* Stats */}
        <div className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t border-[#F1ECF8] mt-3">
          <Stat label="Gerados" value={oferta.vouchers_gerados} />
          <Stat label="Usados" value={oferta.vouchers_usados} />
          <Stat label="Conversão" value={`${conversao}%`} />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, danger }: {
  icon: React.ElementType; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-xl text-sm font-medium transition-colors",
        danger ? "bg-red-500/90 text-white hover:bg-red-600" : "bg-white/90 text-ink hover:bg-white"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="font-display text-base font-bold text-ink">{value}</p>
      <p className="text-[10px] text-ink-subtle">{label}</p>
    </div>
  );
}

// ─── Offer Form Modal ─────────────────────────────────────────────────────────
function OfertaModal({ editing, onClose, onSaved }: {
  editing: Oferta | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState(() => editing ? {
    title: editing.title,
    description: editing.description ?? "",
    type: editing.type ?? "",
    originalPrice: editing.price?.toString() ?? "",
    discountPrice: editing.price && editing.discount_percent
      ? (editing.price * (1 - editing.discount_percent / 100)).toFixed(2)
      : "",
    discount_percent: editing.discount_percent?.toString() ?? "",
    image_url: editing.image_url ?? "",
    active: editing.active,
  } : { ...emptyForm });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate discount % from prices
  const handlePriceChange = (field: "originalPrice" | "discountPrice", val: string) => {
    setForm((f) => {
      const updated = { ...f, [field]: val };
      const orig = parseFloat(field === "originalPrice" ? val : f.originalPrice);
      const disc = parseFloat(field === "discountPrice" ? val : f.discountPrice);
      if (orig > 0 && disc >= 0 && disc < orig) {
        updated.discount_percent = (((orig - disc) / orig) * 100).toFixed(1);
      } else {
        updated.discount_percent = "";
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    setError(null);
    start(async () => {
      const payload = {
        title: form.title,
        description: form.description || null,
        type: form.type || null,
        price: form.originalPrice ? parseFloat(form.originalPrice) : null,
        discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
        image_url: form.image_url || null,
        active: form.active,
      };

      const res = isEdit
        ? await updateOfertaAction(editing.id, payload)
        : await createOfertaAction(payload);

      if (res.ok) { onSaved(res.message); onClose(); }
      else setError(res.message);
    });
  };

  const discPct = form.discount_percent ? Math.round(parseFloat(form.discount_percent)) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4F3] px-6 py-4 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              {isEdit ? "Editar oferta" : "Nova oferta"}
            </h2>
            <p className="text-xs text-ink-muted">
              {isEdit ? "Atualize os detalhes da oferta" : "Crie uma promoção exclusiva para seus clientes"}
            </p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — form + preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Título */}
            <FormField label="Título da oferta *">
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Hidratação Capilar Premium"
                maxLength={80}
              />
              <p className="mt-1 text-right text-[10px] text-ink-subtle">{form.title.length}/80</p>
            </FormField>

            {/* Tipo */}
            <FormField label="Categoria">
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Valor original (R$)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">R$</span>
                  <input
                    className={cn(inputCls, "pl-9")}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={(e) => handlePriceChange("originalPrice", e.target.value)}
                    placeholder="120,00"
                  />
                </div>
              </FormField>
              <FormField label="Valor promocional (R$)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">R$</span>
                  <input
                    className={cn(inputCls, "pl-9")}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountPrice}
                    onChange={(e) => handlePriceChange("discountPrice", e.target.value)}
                    placeholder="59,00"
                  />
                </div>
              </FormField>
            </div>

            {/* Desconto calculado */}
            {discPct !== null && discPct > 0 && (
              <div className="flex items-center gap-3 rounded-xl bg-accent-50 px-4 py-3">
                <Zap className="h-5 w-5 text-accent-600" />
                <span className="text-sm font-medium text-accent-800">
                  Você está oferecendo <strong>{discPct}% de desconto</strong> — ótimo para atrair clientes! 🎯
                </span>
              </div>
            )}

            {/* Descrição */}
            <FormField label="Descrição">
              <textarea
                className={cn(inputCls, "min-h-[80px] resize-y")}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o benefício, validade, condições..."
              />
            </FormField>

            {/* Upload de imagem */}
            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
            />

            {/* Status */}
            <div className="flex items-center justify-between rounded-xl border border-[#E8E4F3] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Oferta ativa</p>
                <p className="text-xs text-ink-muted">Visível para os assinantes do clube</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors duration-200",
                  form.active ? "bg-brand-500" : "bg-surface-muted"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                  form.active ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                {error}
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="hidden w-72 shrink-0 overflow-y-auto border-l border-[#E8E4F3] bg-[#F4F2FA] px-6 py-5 lg:block">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Preview ao vivo</p>
            </div>
            <p className="mb-4 text-[11px] text-ink-subtle">Assim ficará o card na plataforma</p>
            <PreviewCard
              title={form.title}
              type={form.type}
              discount_percent={discPct}
              image_url={form.image_url}
              active={form.active}
            />
            {discPct !== null && discPct > 0 && (
              <div className="mt-4 rounded-xl bg-accent-gradient p-4 text-center text-white">
                <p className="text-xs opacity-80">Desconto aplicado</p>
                <p className="font-display text-4xl font-bold">{discPct}%</p>
                <p className="text-xs opacity-80">OFF</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E8E4F3] px-6 py-4 shrink-0">
          <button onClick={onClose} className="rounded-full border border-[#E8E4F3] px-5 py-2 text-sm font-medium text-ink-muted hover:border-brand-200 hover:text-ink">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-semibold text-white shadow-cta hover:bg-accent-600 disabled:opacity-60"
          >
            {pending ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Salvando...</>
            ) : (
              <>{isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{isEdit ? "Salvar alterações" : "Criar oferta"}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function ConfirmDelete({ oferta, onClose, onConfirmed }: {
  oferta: Oferta; onClose: () => void; onConfirmed: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-100">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="font-display text-lg font-bold text-ink">Excluir oferta?</h3>
        <p className="mt-1 text-sm text-ink-muted">
          <strong>"{oferta.title}"</strong> será removida permanentemente. Esta ação não pode ser desfeita.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-[#E8E4F3] py-2 text-sm font-medium text-ink-muted hover:border-brand-200">
            Cancelar
          </button>
          <button onClick={onConfirmed} className="flex-1 rounded-full bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Sim, excluir
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
const inputCls = "w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OfertasClient({ ofertas: initialOfertas, kpis, empresaId }: Props) {
  const [ofertas, setOfertas] = useState(initialOfertas);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Oferta | null>(null);
  const [deletingOferta, setDeletingOferta] = useState<Oferta | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (msg: string, type: "ok" | "error" = "ok") => setToast({ msg, type });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (o: Oferta) => { setEditing(o); setModalOpen(true); };

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const res = await toggleOfertaAction(id, active);
      if (res.ok) {
        setOfertas((prev) => prev.map((o) => o.id === id ? { ...o, active } : o));
        showToast(res.message);
      } else showToast(res.message, "error");
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const res = await duplicateOfertaAction(id);
      if (res.ok) { showToast(res.message); window.location.reload(); }
      else showToast(res.message, "error");
    });
  };

  const handleDelete = () => {
    if (!deletingOferta) return;
    const id = deletingOferta.id;
    setDeletingOferta(null);
    startTransition(async () => {
      const res = await deleteOfertaAction(id);
      if (res.ok) {
        setOfertas((prev) => prev.filter((o) => o.id !== id));
        showToast(res.message);
      } else showToast(res.message, "error");
    });
  };

  const handleSaved = (msg: string) => {
    showToast(msg);
    window.location.reload(); // força refetch dos dados atualizados
  };

  const filtered = ofertas.filter((o) => {
    if (filter === "active") return o.active;
    if (filter === "paused") return !o.active;
    return true;
  });

  return (
    <>
      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Minhas Ofertas</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Gerencie as ofertas da sua empresa no ChikJov</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white shadow-cta transition-all hover:bg-accent-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Criar nova oferta
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total de ofertas" value={kpis.totalOfertas} icon={Tag} bg="bg-brand-100" color="text-brand-700" />
        <KpiCard label="Ofertas ativas" value={kpis.ativas} icon={CheckCircle2} bg="bg-emerald-100" color="text-emerald-700" />
        <KpiCard label="Pausadas" value={kpis.pausadas} icon={Pause} bg="bg-amber-100" color="text-amber-700" />
        <KpiCard label="Vouchers usados" value={kpis.vouchersUsados} icon={Ticket} bg="bg-accent-100" color="text-accent-700" />
        <KpiCard label="Economia gerada" value={kpis.economiaTotal} icon={TrendingUp} bg="bg-purple-100" color="text-purple-700" prefix="R$" />
      </div>

      {/* ── Filter tabs ── */}
      <div className="mb-5 flex items-center gap-1 rounded-xl bg-surface-muted p-1 w-fit">
        {([["all", "Todas"], ["active", "Ativas"], ["paused", "Pausadas"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-semibold transition-all",
              filter === val ? "bg-white text-brand-700 shadow-soft" : "text-ink-muted hover:text-ink"
            )}
          >
            {label}
            <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
              filter === val ? "bg-brand-100 text-brand-700" : "bg-surface-soft text-ink-subtle"
            )}>
              {val === "all" ? ofertas.length : val === "active" ? kpis.ativas : kpis.pausadas}
            </span>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-100 bg-white py-20 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <LayoutGrid className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-display text-lg font-bold text-ink">
            {filter === "all" ? "Nenhuma oferta criada ainda" : "Nenhuma oferta neste status"}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {filter === "all" ? "Crie sua primeira oferta e comece a atrair clientes!" : "Mude o filtro ou crie uma nova oferta."}
          </p>
          {filter === "all" && (
            <button onClick={openCreate} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-2.5 text-sm font-bold text-white shadow-cta hover:bg-accent-600">
              <Plus className="h-4 w-4" />
              Criar primeira oferta
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((oferta) => (
            <OfertaCard
              key={oferta.id}
              oferta={oferta}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDuplicate={handleDuplicate}
              onDelete={setDeletingOferta}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {modalOpen && (
        <OfertaModal
          editing={editing}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deletingOferta && (
        <ConfirmDelete
          oferta={deletingOferta}
          onClose={() => setDeletingOferta(null)}
          onConfirmed={handleDelete}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
