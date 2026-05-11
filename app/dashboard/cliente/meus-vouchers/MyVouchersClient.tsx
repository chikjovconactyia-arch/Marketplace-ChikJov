"use client";

import { useState } from "react";
import {
  Ticket, CheckCircle2, Clock, XCircle, X, Copy,
  Building2, Tag, Calendar, ChevronRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Voucher {
  id: string;
  code: string;
  qr_code_url: string | null;
  status: string | null;
  economy_value: number | null;
  generated_at: string | null;
  validated_at: string | null;
  expires_at: string | null;
  empresa: { id: string; name: string; logo_url: string | null; category: string | null; city: string | null } | null;
  oferta: { title: string; image_url: string | null; discount_percent: number | null; price: number | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", bg: "bg-emerald-100", color: "text-emerald-700", icon: Clock },
  used: { label: "Utilizado", bg: "bg-brand-100", color: "text-brand-700", icon: CheckCircle2 },
  expired: { label: "Expirado", bg: "bg-amber-100", color: "text-amber-700", icon: Clock },
  cancelled: { label: "Cancelado", bg: "bg-red-100", color: "text-red-700", icon: XCircle },
};

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function MyVouchersClient({ vouchers }: { vouchers: Voucher[] }) {
  const [filter, setFilter] = useState<"all" | "active" | "used" | "expired">("all");
  const [selected, setSelected] = useState<Voucher | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = vouchers.filter((v) => filter === "all" || v.status === filter);

  const counts = {
    all: vouchers.length,
    active: vouchers.filter((v) => v.status === "active").length,
    used: vouchers.filter((v) => v.status === "used").length,
    expired: vouchers.filter((v) => v.status === "expired").length,
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-1 rounded-xl bg-surface-muted p-1 w-fit">
        {([
          ["all", "Todos"],
          ["active", "Ativos"],
          ["used", "Usados"],
          ["expired", "Expirados"],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-semibold transition-all",
              filter === val ? "bg-white text-brand-700 shadow-soft" : "text-ink-muted hover:text-ink"
            )}
          >
            {label}
            <span className={cn(
              "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
              filter === val ? "bg-brand-100 text-brand-700" : "bg-white/60 text-ink-subtle"
            )}>
              {counts[val]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-ink-muted">
          Nenhum voucher neste filtro.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => {
            const cfg = STATUS_CONFIG[v.status ?? ""] ?? STATUS_CONFIG.active;
            const pct = v.oferta?.discount_percent ? Math.round(v.oferta.discount_percent) : null;
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,58,237,0.12)]"
              >
                {/* Imagem */}
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
                  {v.oferta?.image_url ? (
                    <img src={v.oferta.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-gradient text-white">
                      <Sparkles className="h-10 w-10 opacity-60" />
                    </div>
                  )}
                  {pct && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white shadow-cta">
                      {pct}% OFF
                    </span>
                  )}
                  <span className={cn(
                    "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                    cfg.bg, cfg.color
                  )}>
                    <cfg.icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  {v.empresa?.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      {v.empresa.category}
                    </span>
                  )}
                  <p className="mt-0.5 font-display font-bold text-ink line-clamp-1">
                    {v.empresa?.name ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted line-clamp-1">
                    {v.oferta?.title ?? "—"}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-mono text-xs font-bold text-ink-muted">
                      {v.code}
                    </p>
                    <ChevronRight className="h-4 w-4 text-ink-subtle transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {v.economy_value && v.status === "used" && (
                    <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Economizou {formatBRL(v.economy_value)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal Detalhes */}
      {selected && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="relative bg-brand-gradient p-6 text-white">
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg bg-white/20 hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs uppercase tracking-widest opacity-80">
                {STATUS_CONFIG[selected.status ?? ""]?.label ?? selected.status}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold">{selected.empresa?.name ?? "—"}</h3>
              <p className="mt-1 text-sm opacity-90">{selected.oferta?.title ?? "—"}</p>
            </div>

            <div className="px-6 py-6">
              {/* QR Code */}
              {selected.status === "active" && selected.qr_code_url && (
                <div className="mb-5 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-4 text-center">
                  <div className="mx-auto mb-3 grid h-44 w-44 place-items-center rounded-xl bg-white p-2 shadow-soft">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(selected.qr_code_url)}`}
                      alt="QR Code"
                      className="h-full w-full"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-brand-600">Apresente este código</p>
                </div>
              )}

              {/* Código */}
              <div className="rounded-xl bg-surface-soft p-4">
                <p className="text-xs uppercase tracking-widest text-ink-subtle">Código</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="font-mono text-lg font-bold tracking-wider text-ink">{selected.code}</p>
                  <button
                    onClick={() => copyCode(selected.code)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white text-brand-700 shadow-soft hover:bg-brand-50"
                    title="Copiar"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Detalhes */}
              <div className="mt-3 grid gap-2 text-sm">
                <Row icon={Building2} label="Empresa" value={selected.empresa?.name ?? "—"} />
                <Row icon={Tag} label="Oferta" value={selected.oferta?.title ?? "—"} />
                <Row icon={Calendar} label="Gerado" value={formatDate(selected.generated_at)} />
                {selected.expires_at && (
                  <Row icon={Calendar} label="Validade" value={formatDate(selected.expires_at)} />
                )}
                {selected.validated_at && (
                  <Row icon={CheckCircle2} label="Usado em" value={formatDate(selected.validated_at)} />
                )}
                {selected.economy_value && selected.status === "used" && (
                  <Row icon={Sparkles} label="Economia" value={formatBRL(selected.economy_value)} accent />
                )}
              </div>

              {/* CTA */}
              {selected.empresa && (
                <Link
                  href={`/empresa/${selected.empresa.id}`}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-brand-200 px-4 text-sm font-bold text-brand-700 hover:bg-brand-50"
                >
                  Ver mais ofertas desta empresa
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Row({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2 text-ink-muted">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className={cn("font-semibold", accent ? "text-emerald-600" : "text-ink")}>{value}</span>
    </div>
  );
}
