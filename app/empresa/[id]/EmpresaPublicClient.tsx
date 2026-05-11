"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket, ArrowRight, X, Loader2, AlertCircle, CheckCircle2,
  Copy, Calendar, Sparkles, Package
} from "lucide-react";
import { generateVoucherAction } from "@/app/actions/voucher";
import { cn } from "@/lib/utils";

interface Oferta {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  price: number | null;
  discount_percent: number | null;
  image_url: string | null;
  vouchers_count: number;
  created_at: string | null;
}

interface Props {
  ofertas: Oferta[];
  empresaId: string;
  empresaNome: string;
}

const TIPO_COLORS: Record<string, string> = {
  Desconto: "bg-brand-100 text-brand-700",
  Combo: "bg-accent-100 text-accent-700",
  Cashback: "bg-emerald-100 text-emerald-700",
  Brinde: "bg-purple-100 text-purple-700",
  Experiência: "bg-pink-100 text-pink-700",
  "Plano mensal": "bg-blue-100 text-blue-700",
  Serviço: "bg-amber-100 text-amber-700",
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// ─── Voucher Generated Modal ──────────────────────────────────────────────────
function VoucherModal({
  voucher,
  empresaNome,
  ofertaTitle,
  onClose,
}: {
  voucher: { code: string; qr_code_url: string; expires_at: string | null };
  empresaNome: string;
  ofertaTitle: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expDate = voucher.expires_at
    ? new Date(voucher.expires_at).toLocaleDateString("pt-BR")
    : null;

  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(voucher.qr_code_url)}`;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header com confete */}
        <div className="relative overflow-hidden bg-brand-gradient px-6 py-8 text-center text-white">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{
            backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }} />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white/80 hover:bg-white/30 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold">Voucher gerado!</h3>
            <p className="mt-1 text-sm text-white/80">Apresente este código na empresa</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-widest text-ink-subtle">Empresa</p>
          <p className="font-display font-bold text-ink">{empresaNome}</p>
          <p className="mt-3 text-xs uppercase tracking-widest text-ink-subtle">Oferta</p>
          <p className="text-sm text-ink-muted">{ofertaTitle}</p>

          {/* Código + QR */}
          <div className="mt-5 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-5 text-center">
            {/* QR Code */}
            <div className="mx-auto mb-3 grid h-44 w-44 place-items-center rounded-xl bg-white p-2 shadow-soft">
              <img
                src={qrImageSrc}
                alt="QR Code do voucher"
                className="h-full w-full"
                width={180}
                height={180}
              />
            </div>

            <p className="text-xs uppercase tracking-widest text-brand-600">Código</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-wider text-brand-900">
              {voucher.code}
            </p>
            <button
              onClick={copyCode}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand-700 shadow-soft hover:bg-brand-100"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado!" : "Copiar código"}
            </button>
          </div>

          {expDate && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
              <Calendar className="h-3.5 w-3.5" />
              Válido até {expDate}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2">
            <a
              href="/dashboard/cliente/meus-vouchers"
              className="rounded-full border border-brand-200 py-3 text-center text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Meus vouchers
            </a>
            <button
              onClick={onClose}
              className="rounded-full bg-accent-500 py-3 text-sm font-bold text-white shadow-cta hover:bg-accent-600"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function EmpresaPublicClient({ ofertas, empresaId, empresaNome }: Props) {
  const router = useRouter();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [voucherShown, setVoucherShown] = useState<{
    voucher: { code: string; qr_code_url: string; expires_at: string | null };
    ofertaTitle: string;
  } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = (oferta: Oferta) => {
    setGeneratingId(oferta.id);
    startTransition(async () => {
      const res = await generateVoucherAction({ empresaId, ofertaId: oferta.id });
      setGeneratingId(null);

      if (res.ok && res.voucher) {
        setVoucherShown({
          voucher: {
            code: res.voucher.code,
            qr_code_url: res.voucher.qr_code_url,
            expires_at: res.voucher.expires_at,
          },
          ofertaTitle: oferta.title,
        });
      } else {
        showToast(res.message, "error");
        if (res.redirectTo) {
          setTimeout(() => router.push(res.redirectTo!), 1500);
        }
      }
    });
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ofertas.map((oferta) => {
          const pct = oferta.discount_percent ? Math.round(oferta.discount_percent) : null;
          const precoOriginal = oferta.price;
          const precoFinal = oferta.price && oferta.discount_percent
            ? oferta.price * (1 - oferta.discount_percent / 100)
            : null;

          return (
            <article
              key={oferta.id}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(124,58,237,0.18)]"
            >
              {/* Imagem */}
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                {oferta.image_url ? (
                  <img
                    src={oferta.image_url}
                    alt={oferta.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-ink-subtle/30" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  {pct && (
                    <span className="rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-cta">
                      {pct}% OFF
                    </span>
                  )}
                </div>
                {oferta.type && (
                  <span className={cn(
                    "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur",
                    TIPO_COLORS[oferta.type] ?? "bg-white/90 text-brand-700"
                  )}>
                    {oferta.type}
                  </span>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-bold leading-snug text-ink line-clamp-2">
                  {oferta.title}
                </h3>
                {oferta.description && (
                  <p className="mt-1.5 text-sm text-ink-muted line-clamp-2">
                    {oferta.description}
                  </p>
                )}

                {/* Preços */}
                {(precoOriginal || precoFinal) && (
                  <div className="mt-4 flex items-baseline gap-3">
                    {precoFinal !== null && (
                      <span className="font-display text-2xl font-bold text-brand-700">
                        {formatBRL(precoFinal)}
                      </span>
                    )}
                    {precoOriginal !== null && precoFinal !== null && precoFinal < precoOriginal && (
                      <span className="text-sm text-ink-subtle line-through">
                        {formatBRL(precoOriginal)}
                      </span>
                    )}
                  </div>
                )}

                {/* Voucher count */}
                {oferta.vouchers_count > 0 && (
                  <p className="mt-2 text-xs text-ink-subtle">
                    🎟️ {oferta.vouchers_count} {oferta.vouchers_count === 1 ? "voucher gerado" : "vouchers gerados"}
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleGenerate(oferta)}
                  disabled={generatingId === oferta.id}
                  className="mt-auto pt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-cta transition-all hover:bg-accent-600 active:scale-[0.98] disabled:opacity-60"
                >
                  {generatingId === oferta.id ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Gerando...</>
                  ) : (
                    <><Ticket className="h-4 w-4" />Gerar Voucher<ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {voucherShown && (
        <VoucherModal
          voucher={voucherShown.voucher}
          empresaNome={empresaNome}
          ofertaTitle={voucherShown.ofertaTitle}
          onClose={() => {
            setVoucherShown(null);
            router.refresh();
          }}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
