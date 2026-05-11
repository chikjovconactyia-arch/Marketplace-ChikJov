"use client";

import { Offer } from "@/lib/empresa-data";
import { MoreHorizontal, Play, Pause, Edit, Percent } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function OffersWidget({ offers }: { offers: Offer[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  if (!offers.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-surface-muted text-ink-muted">
          <Percent className="h-6 w-6" />
        </div>
        <p className="font-medium text-ink">Nenhuma oferta ativa</p>
        <p className="mt-1 text-sm text-ink-subtle">Crie sua primeira oferta para atrair clientes.</p>
        <button className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Criar oferta
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="group relative flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface-soft"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold",
                offer.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-surface-muted text-ink-muted"
              )}
            >
              {offer.discount}
            </div>
            <div>
              <p className="font-semibold text-ink line-clamp-1">{offer.title}</p>
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      offer.status === "active" ? "bg-emerald-500" : "bg-ink-muted"
                    )}
                  />
                  {offer.status === "active" ? "Ativa" : "Pausada"}
                </span>
                <span>•</span>
                <span>{offer.vouchers_generated} gerados</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => toggleMenu(offer.id)}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {openMenu === offer.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-[#E8E4F3] bg-white py-1 shadow-card">
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface-soft">
                    <Edit className="h-4 w-4 text-ink-muted" /> Editar
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface-soft">
                    {offer.status === "active" ? (
                      <>
                        <Pause className="h-4 w-4 text-ink-muted" /> Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 text-ink-muted" /> Ativar
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      <button className="mt-2 w-full rounded-xl py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50">
        Ver todas
      </button>
    </div>
  );
}
