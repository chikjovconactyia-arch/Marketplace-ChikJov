"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Package, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { mockCompanies } from "@/lib/mock-data";

interface CompanyCard {
  id: string;
  name: string;
  category: string;
  image: string | null;
  discount: string | null;
  city?: string | null;
}

interface Props {
  companies?: CompanyCard[] | null;
}

export function CompanyCarousel({ companies }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Usa dados reais se disponíveis; caso contrário usa mock
  const items: CompanyCard[] =
    companies && companies.length > 0
      ? companies
      : mockCompanies.map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          image: c.image,
          discount: c.discount,
          city: null,
        }));

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -(el.clientWidth * 0.8) : el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <Section
      eyebrow="Marketplace"
      title="Centenas de empresas, descontos reais"
      description="Explore os parceiros mais procurados do clube. Toda semana novas marcas entram com ofertas exclusivas para assinantes."
      background="white"
    >
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((c) => (
            <article
              key={c.id}
              className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)] sm:w-[300px]"
            >
              {/* Imagem */}
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                {c.image ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${c.image})` }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-50">
                    <Package className="h-12 w-12 text-brand-200" />
                  </div>
                )}

                {/* Badge de desconto */}
                {c.discount && (
                  <div className="absolute left-3 top-3 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-cta">
                    {c.discount}
                  </div>
                )}

                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              {/* Conteúdo */}
              <div className="flex flex-1 flex-col p-5 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {c.category}
                </span>
                <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink">
                  {c.name}
                </h3>

                {c.city && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-ink-subtle">
                    <MapPin className="h-3 w-3" />
                    {c.city}
                  </div>
                )}

                <Link
                  href={`/empresa/${c.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:border-brand-400"
                >
                  Ver mais
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Controles */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-700 shadow-card transition-colors hover:bg-brand-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Próximo"
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-700 shadow-card transition-colors hover:bg-brand-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Indicador de origem dos dados */}
        {companies && companies.length > 0 && (
          <p className="mt-4 text-center text-xs text-ink-subtle">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} parceira{companies.length !== 1 ? "s" : ""} no clube
          </p>
        )}
      </div>
    </Section>
  );
}
