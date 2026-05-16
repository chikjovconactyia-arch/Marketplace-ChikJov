"use client";

import { useState, useEffect, useTransition, useRef, useCallback, DragEvent } from "react";
import {
  Plus, Pencil, Trash2, Copy, Eye, X,
  Loader2, CheckCircle2, AlertCircle, UploadCloud, Play, Pause,
  Image as ImageIcon, GripVertical, LayoutGrid, List, Monitor
} from "lucide-react";
import {
  createHeroSlideAction, updateHeroSlideAction,
  toggleHeroSlideAction, deleteHeroSlideAction,
  duplicateHeroSlideAction, reorderHeroSlidesAction,
} from "@/app/actions/hero-slides";
import type { HeroSlide } from "@/components/landing/HeroCarousel";
import { cn } from "@/lib/utils";

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

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro no upload");
      onChange(json.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  return (
    <div>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-brand-100">
          <img src={value} alt="Preview" className="h-36 w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-ink hover:bg-white">
              Trocar imagem
            </button>
            <button type="button" onClick={() => onChange("")}
              className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600">
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-all",
            dragging ? "border-brand-400 bg-brand-50" : "border-brand-100 bg-surface-soft hover:border-brand-300"
          )}
        >
          {uploading ? (
            <><Loader2 className="h-7 w-7 animate-spin text-brand-400" /><p className="text-sm text-brand-600">Enviando...</p></>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-brand-400" />
              <p className="text-center text-sm text-ink-muted">
                <span className="font-semibold text-brand-700">Clique ou arraste</span><br />
                JPG, PNG, WebP · máx. 5MB · recomendado 1600×750
              </p>
            </>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
    </div>
  );
}

// ─── Preview overlay (mini cinema) ───────────────────────────────────────────
function SlidePreview({ slide, device = "desktop" }: { slide: HeroSlide; device?: "desktop" | "mobile" }) {
  const isMobile = device === "mobile";
  const imageUrl = isMobile ? (slide.mobile_image_url ?? slide.image_url) : slide.image_url;
  return (
    <div className={cn(
      "relative w-full overflow-hidden rounded-2xl bg-[#0A0A0F]",
      isMobile ? "aspect-[4/5] max-w-[280px] mx-auto" : "h-64"
    )}>
      {imageUrl && (
        <>
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }} />
          {isMobile ? (
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-[#0A0A0F]/85" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/70 to-transparent" />
            </>
          )}
        </>
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
        {slide.badge && (
          <span className="mb-2 inline-block w-fit rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
            {slide.badge}
          </span>
        )}
        <h3 className="font-display text-lg font-bold leading-snug drop-shadow-lg line-clamp-2">
          {slide.title || "Título do slide"}
        </h3>
        {slide.subtitle && (
          <p className="mt-1 text-xs text-white/75 line-clamp-2">{slide.subtitle}</p>
        )}
        {slide.cta_text && (
          <div className="mt-3">
            <span className="inline-flex items-center rounded-full bg-accent-500 px-4 py-1.5 text-xs font-bold text-white shadow-cta">
              {slide.cta_text}
            </span>
          </div>
        )}
      </div>
      {!slide.active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-ink">Inativo</span>
        </div>
      )}
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
const emptyForm = {
  title: "", subtitle: "", badge: "",
  image_url: "", mobile_image_url: "",
  cta_text: "Assinar agora", cta_link: "#preco",
  cta2_text: "", cta2_link: "",
  city: "",
  order: 0, active: true,
};

const CIDADES_RMBH = [
  "Belo Horizonte", "Betim", "Contagem", "Ribeirão das Neves", "Santa Luzia", 
  "Ibirité", "Sabará", "Vespasiano", "Nova Lima", "Caeté", "Igarapé", 
  "São José da Lapa", "Mário Campos", "Confins", "Esmeraldas", "Florestal", 
  "Itaguara", "Itatiaiuçu", "Jaboticatubas", "Nova União", "Pedro Leopoldo", 
  "Raposos", "Rio Acima", "Taquaraçu de Minas", "Sarzedo", "São Joaquim de Bicas", 
  "Mateus Leme", "Juátuba", "Baldim", "Capim Branco", "Matozinhos", "Rio Manso", 
  "Brumadinho", "Barão de Cocais", "Bom Jesus do Amparo", "Itabirito", "Sete Lagoas", "São Gonçalo do Rio Abaixo"
];

function SlideModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: HeroSlide | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [form, setForm] = useState(() =>
    editing
      ? {
          title: editing.title,
          subtitle: editing.subtitle ?? "",
          badge: editing.badge ?? "",
          image_url: editing.image_url,
          mobile_image_url: editing.mobile_image_url ?? "",
          cta_text: editing.cta_text ?? "Assinar agora",
          cta_link: editing.cta_link ?? "#preco",
          cta2_text: editing.cta2_text ?? "",
          cta2_link: editing.cta2_link ?? "",
          city: editing.city ?? "",
          order: editing.order,
          active: editing.active,
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
        ? await updateHeroSlideAction(editing.id, form)
        : await createHeroSlideAction(form);
      if (res.ok) { onSaved(res.message); onClose(); }
      else setError(res.message);
    });
  };

  const fakeSlide: HeroSlide = {
    id: "preview",
    title: form.title || "Título do slide",
    subtitle: form.subtitle || null,
    badge: form.badge || null,
    image_url: form.image_url,
    mobile_image_url: form.mobile_image_url || null,
    cta_text: form.cta_text || null,
    cta_link: form.cta_link || null,
    cta2_text: form.cta2_text || null,
    cta2_link: form.cta2_link || null,
    city: form.city || null,
    active: form.active,
    order: form.order,
  };

  const inputCls = "w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4F3] px-6 py-4 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              {editing ? "Editar slide" : "Novo slide"}
            </h2>
            <p className="text-xs text-ink-muted">Hero Carousel · Landing Page</p>
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
              <p className="text-xs text-ink-muted">Preview · Como aparecerá no hero da landing page</p>

              {/* Desktop */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop — 1920 × 700
                </div>
                <SlidePreview slide={fakeSlide} device="desktop" />
              </div>

              {/* Mobile */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-700">
                  📱 Mobile — 1080 × 1350
                  {!fakeSlide.mobile_image_url && (
                    <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                      usando desktop
                    </span>
                  )}
                </div>
                <SlidePreview slide={fakeSlide} device="mobile" />
              </div>

              <p className="text-center text-xs text-ink-subtle">
                O resultado real depende da resolução exata enviada.
              </p>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* Imagens — Desktop + Mobile */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Desktop */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
                    <Monitor className="h-3.5 w-3.5 text-brand-600" />
                    Imagem Desktop *
                    <span className="ml-auto rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                      1920 × 700
                    </span>
                  </label>
                  <ImageUpload value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
                  <p className="mt-1.5 text-[10px] text-ink-subtle">Banner horizontal widescreen</p>
                </div>

                {/* Mobile */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
                    📱 Imagem Mobile
                    <span className="ml-auto rounded-md bg-accent-50 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">
                      1080 × 1350
                    </span>
                  </label>
                  <ImageUpload value={form.mobile_image_url} onChange={(url) => setForm((f) => ({ ...f, mobile_image_url: url }))} />
                  <p className="mt-1.5 text-[10px] text-ink-subtle">Vertical estilo Instagram (opcional — usa desktop se vazio)</p>
                </div>
              </div>

              {/* Badge e Cidade */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Badge (opcional)</label>
                  <input className={inputCls} value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="Ex: Clube de Vantagens" maxLength={40} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Cidade alvo</label>
                  <select 
                    className={inputCls} 
                    value={form.city} 
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  >
                    <option value="">Todas as cidades (Global)</option>
                    {CIDADES_RMBH.sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Título *</label>
                <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Economize de verdade nas empresas que você ama" maxLength={80} />
                <p className="mt-1 text-right text-[10px] text-ink-subtle">{form.title.length}/80</p>
              </div>

              {/* Subtítulo */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Subtítulo</label>
                <textarea className={cn(inputCls, "min-h-[72px] resize-none")} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Acesso ilimitado a descontos exclusivos..." maxLength={180} />
              </div>

              {/* Botão 1 */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-500 text-[10px] font-bold text-white">1</span>
                  Botão principal
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-muted">Texto</label>
                    <input className={inputCls} value={form.cta_text} onChange={(e) => setForm((f) => ({ ...f, cta_text: e.target.value }))} placeholder="Assinar agora" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-muted">Link</label>
                    <input className={inputCls} value={form.cta_link} onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))} placeholder="#preco ou /auth/register" />
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-ink-subtle">
                  {!form.cta_text?.trim() || !form.cta_link?.trim()
                    ? "⚠️ Texto e link devem ser preenchidos para o botão aparecer"
                    : "✓ Botão visível no slide"}
                </p>
              </div>

              {/* Botão 2 */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-200 text-[10px] font-bold text-brand-700">2</span>
                  Botão secundário
                  <span className="ml-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] text-ink-subtle">opcional</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-muted">Texto</label>
                    <input className={inputCls} value={form.cta2_text} onChange={(e) => setForm((f) => ({ ...f, cta2_text: e.target.value }))} placeholder="Sou empresa" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-muted">Link</label>
                    <input className={inputCls} value={form.cta2_link} onChange={(e) => setForm((f) => ({ ...f, cta2_link: e.target.value }))} placeholder="#empresas ou /auth/register?role=empresa" />
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-ink-subtle">
                  {!form.cta2_text?.trim() || !form.cta2_link?.trim()
                    ? "Deixe vazio para ocultar este botão no slide"
                    : "✓ Botão 2 visível no slide"}
                </p>
              </div>

              {/* Ordem + Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Ordem</label>
                  <input type="number" className={inputCls} value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} min={0} />
                </div>
                <div className="flex items-end">
                  <div className="flex w-full items-center justify-between rounded-xl border border-[#E8E4F3] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">Slide ativo</p>
                      <p className="text-[11px] text-ink-subtle">Aparece no hero da landing</p>
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
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white shadow-cta hover:bg-accent-600 disabled:opacity-60">
            {pending ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : <>{editing ? "Salvar" : "Criar slide"}</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function ConfirmDelete({ slide, onClose, onConfirm }: { slide: HeroSlide; onClose: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-100">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="font-display text-lg font-bold text-ink">Excluir slide?</h3>
        <p className="mt-1 text-sm text-ink-muted">
          <strong>"{slide.title}"</strong> será removido permanentemente.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-[#E8E4F3] py-2 text-sm font-medium text-ink-muted">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 rounded-full bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700">Excluir</button>
        </div>
      </div>
    </>
  );
}

// ─── Carousel Preview Modal ───────────────────────────────────────────────────
function CarouselPreviewModal({ slides, onClose }: { slides: HeroSlide[]; onClose: () => void }) {
  const active = slides.filter((s) => s.active);
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (active.length <= 1) return;
    const t = setInterval(() => setCur((c) => (c + 1) % active.length), 4000);
    return () => clearInterval(t);
  }, [active.length]);

  const slide = active[cur];
  if (!slide) return (
    <>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 text-center shadow-2xl">
        <p className="font-bold text-ink">Nenhum slide ativo para prévia.</p>
        <button onClick={onClose} className="mt-4 rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white">Fechar</button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[420px] overflow-hidden rounded-2xl shadow-2xl" style={{ background: "#0A0A0F" }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image_url})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/70 to-transparent" />
          <div className="relative flex h-full items-center px-12">
            <div className="max-w-lg">
              {slide.badge && <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">{slide.badge}</span>}
              <h2 className="font-display text-4xl font-bold leading-tight text-white">{slide.title}</h2>
              {slide.subtitle && <p className="mt-3 text-base text-white/80">{slide.subtitle}</p>}
              {slide.cta_text && (
                <div className="mt-5 flex gap-3">
                  <span className="inline-flex rounded-full bg-accent-500 px-6 py-2.5 text-sm font-bold text-white">{slide.cta_text}</span>
                  <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm">Sou empresa</span>
                </div>
              )}
            </div>
          </div>
          {active.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {active.map((_, i) => (
                <button key={i} onClick={() => setCur(i)}
                  className={cn("rounded-full transition-all", i === cur ? "w-6 h-2 bg-white" : "h-2 w-2 bg-white/40")} />
              ))}
            </div>
          )}
          <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            PRÉVIA · {active.length} slide{active.length !== 1 ? "s" : ""} ativo{active.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button onClick={onClose} className="absolute -right-4 -top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30">
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function HeroSlidesClient({ slides: initialSlides }: { slides: HeroSlide[] }) {
  const [slides, setSlides] = useState(initialSlides);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modal, setModal] = useState<"create" | HeroSlide | null>(null);
  const [deleting, setDeleting] = useState<HeroSlide | null>(null);
  const [previewing, setPreviewing] = useState<HeroSlide | null>(null);
  const [showCarouselPreview, setShowCarouselPreview] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [, startTransition] = useTransition();

  // ─── DnD state ─────────────────────────────────────────────────────────────
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
    const fromIdx = slides.findIndex((s) => s.id === fromId);
    const toIdx = slides.findIndex((s) => s.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const newSlides = [...slides];
    const [moved] = newSlides.splice(fromIdx, 1);
    newSlides.splice(toIdx, 0, moved);
    const updated = newSlides.map((s, i) => ({ ...s, order: i }));
    setSlides(updated);
    startTransition(async () => {
      await reorderHeroSlidesAction(updated.map((s) => ({ id: s.id, order: s.order })));
      showToast("Ordem atualizada!");
    });
    dragId.current = null;
  };
  const onDragEnd = () => { setDragOver(null); dragId.current = null; };

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const reload = () => window.location.reload();

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const res = await toggleHeroSlideAction(id, active);
      if (res.ok) {
        setSlides((prev) => prev.map((s) => s.id === id ? { ...s, active } : s));
        showToast(res.message);
      } else showToast(res.message, "error");
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const res = await duplicateHeroSlideAction(id);
      if (res.ok) { showToast(res.message); reload(); }
      else showToast(res.message, "error");
    });
  };

  const handleDelete = () => {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    startTransition(async () => {
      const res = await deleteHeroSlideAction(id);
      if (res.ok) { setSlides((prev) => prev.filter((s) => s.id !== id)); showToast(res.message); }
      else showToast(res.message, "error");
    });
  };

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            {slides.filter((s) => s.active).length} ativos
          </span>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-ink-subtle">
            {slides.filter((s) => !s.active).length} inativos
          </span>
          <span className="hidden text-xs text-ink-subtle md:block">
            · Arraste os cards para reordenar
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex gap-1 rounded-xl bg-surface-muted p-1">
            <button onClick={() => setViewMode("grid")}
              className={cn("grid h-8 w-8 place-items-center rounded-lg transition-all",
                viewMode === "grid" ? "bg-white shadow-soft text-brand-700" : "text-ink-muted hover:text-ink")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={cn("grid h-8 w-8 place-items-center rounded-lg transition-all",
                viewMode === "list" ? "bg-white shadow-soft text-brand-700" : "text-ink-muted hover:text-ink")}>
              <List className="h-4 w-4" />
            </button>
          </div>
          {/* Preview carousel */}
          <button onClick={() => setShowCarouselPreview(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E8E4F3] bg-white px-4 text-sm font-semibold text-ink-muted transition-colors hover:border-brand-200 hover:text-brand-700">
            <Monitor className="h-4 w-4" />
            Prévia do Hero
          </button>
          {/* Create */}
          <button onClick={() => setModal("create")}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-500 px-5 text-sm font-bold text-white shadow-cta hover:bg-accent-600">
            <Plus className="h-4 w-4" />
            Novo slide
          </button>
        </div>
      </div>

      {/* Hint DnD */}
      {slides.length > 1 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-xs text-brand-800">
          <GripVertical className="h-4 w-4 text-brand-500" />
          <span>Arraste os cards para reordenar os slides. A ordem é salva automaticamente.</span>
        </div>
      )}

      {/* Grid/List */}
      {slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-100 bg-white py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <ImageIcon className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-display text-lg font-bold text-ink">Nenhum slide criado</p>
          <p className="mt-1 text-sm text-ink-muted">Crie o primeiro slide do Hero Carousel!</p>
          <button onClick={() => setModal("create")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-cta hover:bg-accent-600">
            <Plus className="h-4 w-4" />
            Criar primeiro slide
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => onDragStart(e, slide.id)}
              onDragOver={(e) => onDragOver(e, slide.id)}
              onDrop={(e) => onDrop(e, slide.id)}
              onDragEnd={onDragEnd}
              className={cn(
                "group flex cursor-grab flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] transition-all active:cursor-grabbing active:scale-[0.98]",
                dragOver === slide.id && "ring-2 ring-brand-400 ring-offset-2 scale-[1.01]"
              )}
            >
              <div className="relative">
                {/* Grip handle */}
                <div className="absolute left-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-lg bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4" />
                </div>
                <SlidePreview slide={slide} />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <ActionBtn icon={Pencil} label="Editar" onClick={() => setModal(slide)} />
                  <ActionBtn icon={Eye} label="Preview" onClick={() => setPreviewing(slide)} />
                  <ActionBtn icon={Copy} label="Duplicar" onClick={() => handleDuplicate(slide.id)} />
                  <ActionBtn icon={Trash2} label="Excluir" onClick={() => setDeleting(slide)} danger />
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 px-4 py-3">
                <GripVertical className="h-5 w-5 shrink-0 text-ink-subtle/30" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-ink">{slide.title}</p>
                  <p className="text-[11px] text-ink-subtle">Posição #{slide.order + 1}</p>
                </div>
                <button onClick={() => handleToggle(slide.id, !slide.active)} title={slide.active ? "Desativar" : "Ativar"}
                  className={cn("grid h-8 w-8 place-items-center rounded-lg transition-colors",
                    slide.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-surface-muted text-ink-subtle hover:bg-surface-soft")}>
                  {slide.active ? <Play className="h-4 w-4 fill-emerald-600 text-emerald-600" /> : <Pause className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-2xl border border-[#E8E4F3] bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E4F3] bg-surface-soft">
                {["", "Preview", "Título", "Badge", "Cidade", "Status", "Posição", "Ações"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECF8]">
              {slides.map((slide) => (
                <tr key={slide.id}
                  draggable
                  onDragStart={(e) => onDragStart(e as any, slide.id)}
                  onDragOver={(e) => onDragOver(e as any, slide.id)}
                  onDrop={(e) => onDrop(e as any, slide.id)}
                  onDragEnd={onDragEnd}
                  className={cn("group cursor-grab transition-colors hover:bg-brand-50/30 active:cursor-grabbing",
                    dragOver === slide.id && "bg-brand-50 ring-1 ring-inset ring-brand-300")}>
                  <td className="px-3 py-3">
                    <GripVertical className="h-5 w-5 text-ink-subtle/40 group-hover:text-ink-subtle" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative h-14 w-24 overflow-hidden rounded-lg bg-[#0A0A0F]">
                      {slide.image_url && (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image_url})` }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink max-w-[200px] truncate">{slide.title}</td>
                  <td className="px-4 py-3">
                    {slide.badge ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">{slide.badge}</span>
                    ) : <span className="text-ink-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted whitespace-nowrap">
                    {slide.city ? (
                      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-brand-400"></span>{slide.city}</span>
                    ) : (
                      "Todas as cidades"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                      slide.active ? "bg-emerald-100 text-emerald-700" : "bg-surface-muted text-ink-subtle")}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {slide.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">#{slide.order + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => setModal(slide)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-brand-50 hover:text-brand-700"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleToggle(slide.id, !slide.active)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-surface-soft">
                        {slide.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => handleDuplicate(slide.id)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-surface-soft"><Copy className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleting(slide)} className="grid h-7 w-7 place-items-center rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {(modal === "create" || (modal && typeof modal === "object")) && (
        <SlideModal
          editing={typeof modal === "object" ? modal : null}
          onClose={() => setModal(null)}
          onSaved={(msg) => { showToast(msg); reload(); }}
        />
      )}

      {deleting && (
        <ConfirmDelete slide={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
      )}

      {/* Full preview modal */}
      {previewing && (
        <>
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewing(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-2xl">
              <SlidePreview slide={previewing} />
            </div>
            <button onClick={() => setPreviewing(null)}
              className="absolute -right-4 -top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30">
              <X className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {/* Carousel full preview */}
      {showCarouselPreview && (
        <CarouselPreviewModal slides={slides} onClose={() => setShowCarouselPreview(false)} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

function ActionBtn({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} title={label}
      className={cn("grid h-9 w-9 place-items-center rounded-xl transition-colors text-sm",
        danger ? "bg-red-500/90 text-white hover:bg-red-600" : "bg-white/90 text-ink hover:bg-white")}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
