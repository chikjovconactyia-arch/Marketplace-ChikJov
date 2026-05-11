"use client";

import { useState, useTransition, useRef } from "react";
import {
  Search, ScanLine, Loader2, CheckCircle2, AlertCircle, X,
  User, Building2, Tag, Calendar, DollarSign, Camera, CameraOff
} from "lucide-react";
import { lookupVoucherAction, confirmVoucherAction, type VoucherDetails } from "@/app/actions/voucher-validate";
import { cn } from "@/lib/utils";

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativo", cls: "bg-emerald-100 text-emerald-700" },
  used: { label: "Já usado", cls: "bg-red-100 text-red-700" },
  expired: { label: "Expirado", cls: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
};

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

interface Props {
  initialCode?: string;
  variant?: "full" | "compact";
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

export function VoucherValidator({ initialCode = "", variant = "full" }: Props) {
  const [code, setCode] = useState(initialCode);
  const [voucher, setVoucher] = useState<VoucherDetails | null>(null);
  const [canValidate, setCanValidate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [pending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const scanningRef = useRef(false);

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLookup = (c?: string) => {
    const target = (c ?? code).trim().toUpperCase();
    if (!target) return;
    setError(null);
    startTransition(async () => {
      const res = await lookupVoucherAction(target);
      if (res.ok && res.voucher) {
        setVoucher(res.voucher);
        setCanValidate(res.canValidate ?? false);
      } else {
        setError(res.message);
        setVoucher(null);
      }
    });
  };

  const handleConfirm = () => {
    if (!voucher) return;
    startTransition(async () => {
      const res = await confirmVoucherAction(voucher.code);
      if (res.ok) {
        showToast(res.message, "ok");
        setVoucher({ ...voucher, status: "used", validated_at: new Date().toISOString() });
        setCanValidate(false);
      } else {
        showToast(res.message, "error");
      }
    });
  };

  // ─── Camera QR Scanner via BarcodeDetector API ─────────────────────────────
  const startScanner = async () => {
    setError(null);
    if (!("BarcodeDetector" in window)) {
      setError("Seu navegador não suporta leitura de QR. Use Chrome ou Edge atualizado, ou digite o código manualmente.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // @ts-expect-error — BarcodeDetector é tipo do browser
      detectorRef.current = new BarcodeDetector({ formats: ["qr_code"] });
      setScanning(true);
      scanningRef.current = true;
      tick();
    } catch (e: any) {
      setError("Não foi possível acessar a câmera: " + (e?.message ?? "erro desconhecido"));
    }
  };

  const stopScanner = () => {
    scanningRef.current = false;
    setScanning(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const tick = async () => {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;
    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      if (codes.length > 0) {
        const raw = codes[0].rawValue as string;
        // Pode vir como URL completa /voucher/validar/CHIK-XXXX-XXXX
        const match = raw.match(/CHIK-[A-Z0-9]{4}-[A-Z0-9]{4}/i);
        const detected = (match?.[0] ?? raw).toUpperCase();
        stopScanner();
        setCode(detected);
        handleLookup(detected);
        return;
      }
    } catch {}
    if (scanningRef.current) requestAnimationFrame(tick);
  };

  const reset = () => {
    setVoucher(null);
    setCode("");
    setError(null);
  };

  return (
    <>
      {/* Input + Scanner */}
      {!voucher && (
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Código do voucher
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="CHIK-XXXX-XXXX"
                className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-base font-mono uppercase tracking-wider text-ink placeholder-ink-subtle outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              onClick={() => handleLookup()}
              disabled={pending || !code.trim()}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Validar
            </button>
          </div>

          {/* Scanner toggle */}
          <div className="mt-4">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                <Camera className="h-4 w-4" />
                Escanear QR Code com câmera
              </button>
            ) : (
              <div>
                <div className="relative overflow-hidden rounded-xl border-2 border-brand-300 bg-black">
                  <video ref={videoRef} className="aspect-video w-full max-w-md object-cover" muted playsInline />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-2/3 w-2/3 rounded-2xl border-2 border-accent-500/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                  </div>
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white">
                    <ScanLine className="h-3 w-3 animate-pulse" />
                    Escaneando...
                  </div>
                </div>
                <button
                  onClick={stopScanner}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  <CameraOff className="h-4 w-4" />
                  Parar câmera
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Voucher Details */}
      {voucher && (
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-lg font-bold tracking-wider text-ink">{voucher.code}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", STATUS_BADGES[voucher.status]?.cls ?? "bg-surface-muted text-ink-muted")}>
                  {STATUS_BADGES[voucher.status]?.label ?? voucher.status}
                </span>
              </div>
            </div>
            <button onClick={reset} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Detalhes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem icon={User} label="Cliente" value={voucher.cliente_nome ?? "—"} />
            <DetailItem icon={Building2} label="Empresa" value={voucher.empresa_nome} />
            <DetailItem icon={Tag} label="Oferta" value={voucher.oferta_titulo ?? "—"} />
            <DetailItem
              icon={DollarSign}
              label="Economia"
              value={voucher.economy_value ? formatBRL(voucher.economy_value) : "—"}
            />
            <DetailItem icon={Calendar} label="Gerado em" value={formatDateTime(voucher.generated_at)} />
            <DetailItem icon={Calendar} label="Válido até" value={voucher.expires_at ? new Date(voucher.expires_at).toLocaleDateString("pt-BR") : "—"} />
            {voucher.validated_at && (
              <DetailItem icon={CheckCircle2} label="Validado em" value={formatDateTime(voucher.validated_at)} />
            )}
          </div>

          {/* CTA */}
          {voucher.status === "active" && canValidate && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={reset} className="rounded-full border border-[#E8E4F3] px-6 py-2.5 text-sm font-medium text-ink-muted hover:border-brand-200 hover:text-ink">
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-card hover:bg-emerald-600 disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmar uso do voucher
              </button>
            </div>
          )}
          {voucher.status === "active" && !canValidate && (
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              Você está logado como uma empresa diferente da emissora deste voucher.
            </div>
          )}
          {voucher.status !== "active" && (
            <div className={cn(
              "mt-6 flex items-start gap-2 rounded-xl p-4 text-sm",
              voucher.status === "used" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"
            )}>
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Este voucher não pode ser validado: {STATUS_BADGES[voucher.status]?.label ?? voucher.status}.
            </div>
          )}
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-soft p-4">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
