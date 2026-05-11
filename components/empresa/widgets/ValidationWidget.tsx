"use client";

import { useState } from "react";
import { QrCode, Search, CheckCircle2, Ticket } from "lucide-react";

export function ValidationWidget() {
  const [code, setCode] = useState("");

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    alert(`Validar voucher: ${code}`);
    setCode("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-100 text-accent-700">
          <Ticket className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-ink">Validar cliente</h3>
          <p className="text-xs text-ink-muted">Digite o código ou escaneie o QR.</p>
        </div>
      </div>

      <form onSubmit={handleValidate} className="relative mt-2 flex items-center">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Código do voucher..."
          className="h-11 w-full rounded-xl border border-[#E8E4F3] bg-surface-soft pl-4 pr-12 text-sm font-medium tracking-wide text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
          maxLength={8}
        />
        <button
          type="submit"
          className="absolute right-2 grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          disabled={code.length < 6}
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      <button className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E8E4F3] bg-white text-sm font-semibold text-brand-600 transition-all hover:border-brand-300 hover:bg-brand-50">
        <QrCode className="h-5 w-5" />
        Escanear QR Code
      </button>
    </div>
  );
}
