import Link from "next/link";
import { Building2 } from "lucide-react";
import { partnerLogos } from "@/lib/mock-data";

export interface PartnerCard {
  id: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  city: string | null;
  is_featured: boolean | null;
}

interface Props {
  partners?: PartnerCard[] | null;
}

export function Partners({ partners }: Props) {
  // Se não houver parceiros reais, usa fallback textual (mock)
  const useMock = !partners || partners.length === 0;

  if (useMock) {
    const logos = [...partnerLogos, ...partnerLogos];
    return (
      <section className="border-y border-brand-100 bg-white py-10">
        <div className="container-tight">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-subtle">
            Empresas que confiam no ChikJov
          </p>
          <div className="mask-fade-x mt-6 overflow-hidden">
            <div className="flex w-max animate-scroll hover:[animation-play-state:paused] items-center gap-12">
              {logos.map((name, i) => (
                <div
                  key={i}
                  className="flex h-12 items-center justify-center px-4 font-display text-xl font-bold text-ink-subtle/60"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Duplica para loop infinito do marquee
  const items = [...partners, ...partners];

  return (
    <section className="border-y border-brand-100 bg-gradient-to-b from-white to-surface-soft py-12">
      <div className="container-tight">
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700 shadow-soft">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Empresas que confiam no ChikJov
          </span>
        </div>

        {/* Carrossel marquee */}
        <div className="mask-fade-x mt-8 overflow-hidden">
          <div className="flex w-max animate-scroll hover:[animation-play-state:paused] items-stretch gap-4">
            {items.map((p, i) => (
              <Link
                key={`${p.id}-${i}`}
                href={`/empresa/${p.id}`}
                aria-label={p.name}
                className="group flex w-[180px] shrink-0 items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-3 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                {/* Logo */}
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-50 ring-1 ring-brand-100">
                  {p.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-brand-300" />
                  )}
                </div>

                {/* Nome + categoria */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold leading-tight text-ink transition-colors group-hover:text-brand-700">
                    {p.name}
                  </p>
                  <p className="truncate text-[10px] uppercase tracking-wider text-ink-subtle">
                    {p.category ?? "Parceiro"}
                  </p>
                </div>

                {/* Featured star */}
                {p.is_featured && (
                  <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-accent-500" aria-label="Em destaque" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Contador de parceiros */}
        <p className="mt-5 text-center text-xs text-ink-subtle">
          {partners.length} {partners.length === 1 ? "empresa parceira" : "empresas parceiras"} no clube · Atualizado em tempo real
        </p>
      </div>
    </section>
  );
}
