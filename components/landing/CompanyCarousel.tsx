"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Package, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { mockCompanies } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

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

  const [isPaused, setIsPaused] = useState(false);

  // Supabase state para checar login
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const pathname = usePathname();
  const isLandpage = pathname === "/landpage";

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const stripeLink = "https://buy.stripe.com/test_4gMaEY2cgbbheVo1x68AE00";
  const getCtaLink = (originalLink: string) => {
    if (isLandpage && !user) {
      return stripeLink;
    }
    return originalLink;
  };

  // Duplicamos os itens para criar o efeito de loop infinito
  const marqueeItems = [...items, ...items];

  return (
    <Section
      eyebrow="Marketplace"
      title="Descubra as melhores ofertas e descontos da sua cidade."
      description="Mais vantagens para você economizar no dia a dia."
      background="white"
    >
      <div
        className="mask-fade-x relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="flex w-max animate-scroll gap-5 pb-4"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {marqueeItems.map((c, idx) => (
            <article
              key={`${c.id}-${idx}`}
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
                  href={getCtaLink(`/empresa/${c.id}`)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:border-brand-400"
                >
                  {isLandpage && !user ? "Assine" : "Ver mais"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Indicador de origem dos dados */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {companies && companies.length > 0 && (
          <p className="text-center text-xs text-ink-subtle">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} parceira{companies.length !== 1 ? "s" : ""} no clube
          </p>
        )}

        <Link
          href={getCtaLink("/marketplace")}
          target={isLandpage && !user ? undefined : "_blank"}
          rel={isLandpage && !user ? undefined : "noopener noreferrer"}
          className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-8 py-3 text-sm font-bold text-white shadow-cta transition-all hover:scale-105 hover:shadow-brand-500/25 active:scale-95"
        >
          Clube de Vantagens ChikJov
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
