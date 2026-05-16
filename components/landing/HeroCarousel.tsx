"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  cta_text: string | null;
  cta_link: string | null;
  cta2_text: string | null;
  cta2_link: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  logo_image_url?: string | null;
  city?: string | null;
  active: boolean;
  order: number;
}

interface Props {
  slides: HeroSlide[];
}

const AUTOPLAY_MS = 5000;

const FALLBACK_SLIDE: HeroSlide = {
  id: "fallback",
  title: "Economize de verdade nas empresas que você ama",
  subtitle: "Acesso ilimitado a descontos exclusivos em restaurantes, academias, clínicas e centenas de empresas locais. Por apenas R$ 39,90/mês.",
  badge: "Clube de Vantagens",
  cta_text: "Assinar agora",
  cta_link: "#preco",
  cta2_text: "Sou empresa",
  cta2_link: "#empresas",
  image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=85",
  active: true,
  order: 0,
};

export function HeroCarousel({ slides }: Props) {
  const active = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const go = useCallback(
    (idx: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrent(((idx % active.length) + active.length) % active.length);
        setTransitioning(false);
      }, 350);
    },
    [active.length, transitioning]
  );

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  // Autoplay
  useEffect(() => {
    if (paused || active.length <= 1) return;
    setProgress(0);
    timerRef.current = setInterval(() => go(current + 1), AUTOPLAY_MS);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (AUTOPLAY_MS / 50), 100));
    }, 50);
    return () => {
      clearInterval(timerRef.current!);
      clearInterval(progressRef.current!);
    };
  }, [current, paused, active.length, go]);

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
    touchEndX.current = null;
    setPaused(false);
  };

  const slide = active[current];
  if (!slide) return null;

  return (
    <section
      className={cn(
        "relative w-full",
        // Mobile: pt-[116px] = header(100px) + 16px gap — cria espaço total correto
        // O card usa mt-[-116px] para subir sobre o header, então a section
        // começa com recuo de 116px para manter o layout visualmente correto
        "pt-[116px] pb-6 md:pt-0 md:pb-0 md:overflow-hidden",
        "md:bg-[#0A0A0F]"
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={cn(
        "relative mx-auto overflow-hidden transition-all duration-500",
        // Mobile: card sobe SOBRE o header (h=[100px]) com margem negativa
        // mt-[-137px] = header(100px) + 16px gap + 21px a mais (≈10% do card)
        // z-[60] garante que fica acima do header (z-50)
        "w-[calc(100%-2rem)] max-w-[500px] h-[210px] rounded-[24px]",
        "shadow-[0_20px_60px_rgba(101,40,167,0.35),0_0_0_1px_rgba(255,255,255,0.12)]",
        "mt-[-137px] mx-auto z-[60]",
        // Desktop: hero banner full width
        "md:w-full md:max-w-none md:h-[82vh] md:max-h-[760px] md:rounded-none md:shadow-none md:mt-0 md:z-auto"
      )}>
        {/* Background slides */}
        {active.map((s, i) => {
          const desktopSrc = s.image_url;
          const mobileSrc = s.mobile_image_url ?? s.image_url; // fallback p/ desktop se mobile não existir
          return (
            <div
              key={s.id}
              aria-hidden={i !== current}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                i === current && !transitioning ? "opacity-100 z-0" : "opacity-0 -z-10"
              )}
            >
              <picture>
                {/* Mobile (até 767px) — imagem mobile */}
                <source media="(max-width: 767px)" srcSet={mobileSrc} />
                {/* Desktop — imagem horizontal */}
                <source media="(min-width: 768px)" srcSet={desktopSrc} />
                <img
                  src={desktopSrc}
                  alt={s.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover",
                    i === current ? "scale-[1.04]" : "scale-100"
                  )}
                  style={{ transition: "transform 8s ease-out" }}
                />
              </picture>
              {/* Mobile overlays: Gradiente escuro garantindo contraste no card */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/95 via-[#0A0A0F]/70 to-[#0A0A0F]/30 md:hidden" />
              
              {/* Desktop overlays */}
              <div className="absolute inset-0 hidden bg-black/30 md:block" />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/75 to-transparent md:block" />
              <div className="absolute inset-0 hidden bg-gradient-to-t from-[#0A0A0F]/80 via-transparent to-transparent md:block" />
            </div>
          );
        })}

        {/* Content Mobile */}
        <div className="absolute inset-0 flex items-center p-5 gap-4 md:hidden z-10">
          {slide.logo_image_url && (
            <div className={cn(
              "flex-shrink-0 w-[84px] h-[84px] rounded-full border-[3px] border-white/10 overflow-hidden shadow-2xl bg-white",
              "transition-all duration-500 delay-75",
              transitioning ? "opacity-0 scale-90" : "opacity-100 scale-100"
            )}>
              <img src={slide.logo_image_url} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {slide.badge && (
              <div
                className={cn(
                  "mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-sm shadow-sm",
                  "transition-all duration-500",
                  transitioning ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
                )}
              >
                <Sparkles className="h-2.5 w-2.5 text-accent-400" />
                {slide.badge}
              </div>
            )}
            <h2
              className={cn(
                "font-display text-[17px] leading-[1.15] font-bold text-white line-clamp-2 drop-shadow-md",
                "transition-all duration-500 delay-100",
                transitioning ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              )}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p
                className={cn(
                  "mt-1.5 text-[11px] text-white/80 line-clamp-2 leading-snug drop-shadow-sm",
                  "transition-all duration-500 delay-150",
                  transitioning ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
                )}
              >
                {slide.subtitle}
              </p>
            )}
            {slide.cta_text && slide.cta_link && (
              <div
                className={cn(
                  "mt-3",
                  "transition-all duration-500 delay-200",
                  transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                <Link
                  href={slide.cta_link}
                  className="inline-flex h-8 items-center justify-center rounded-full bg-accent-500 px-5 text-[11px] font-bold tracking-wide text-white shadow-cta transition-all hover:bg-accent-600 hover:scale-105 active:scale-95"
                >
                  {slide.cta_text}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Content Desktop */}
        <div className="absolute inset-0 hidden md:flex h-full items-center pointer-events-none z-10">
          <div className="container-tight w-full pointer-events-auto">
            <div className="mx-auto w-full max-w-2xl text-left pb-0">
              {slide.badge && (
                <div
                  className={cn(
                    "mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md",
                    "px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white",
                    "transition-all duration-500",
                    transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  )}
                >
                  <Sparkles className="h-3 w-3 text-accent-400" />
                  {slide.badge}
                </div>
              )}

              <h1
                className={cn(
                  "font-display font-bold leading-tight text-white drop-shadow-2xl",
                  "text-5xl lg:text-6xl",
                  "transition-all duration-500 delay-75",
                  transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                )}
              >
                {slide.title}
              </h1>

              {slide.subtitle && (
                <p
                  className={cn(
                    "mt-2 text-white/80 leading-relaxed",
                    "text-lg max-w-xl",
                    "transition-all duration-500 delay-150",
                    transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                  )}
                >
                  {slide.subtitle}
                </p>
              )}

              {(slide.cta_text?.trim() || slide.cta2_text?.trim()) && (
                <div
                  className={cn(
                    "mt-8 flex flex-row justify-start gap-3",
                    "transition-all duration-500 delay-200",
                    transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                  )}
                >
                  {slide.cta_text?.trim() && slide.cta_link?.trim() && (
                    <Link
                      href={slide.cta_link}
                      className={cn(
                        "inline-flex items-center justify-center rounded-full bg-accent-500 font-bold text-white shadow-cta transition-all hover:bg-accent-600 active:scale-[0.98]",
                        "h-14 px-8 text-base"
                      )}
                    >
                      {slide.cta_text}
                    </Link>
                  )}
                  {slide.cta2_text?.trim() && slide.cta2_link?.trim() && (
                    <Link
                      href={slide.cta2_link}
                      className={cn(
                        "inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20",
                        "h-14 px-8 text-base"
                      )}
                    >
                      {slide.cta2_text}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Controls (Arrows & Progress) */}
        {active.length > 1 && (
          <div className="hidden md:block z-20">
            <button
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-8 top-1/2 -translate-y-1/2 h-12 w-12 grid place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60 pointer-events-auto"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              aria-label="Próximo"
              className="absolute right-8 top-1/2 -translate-y-1/2 h-12 w-12 grid place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60 pointer-events-auto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-7 left-0 right-0 flex flex-col items-center gap-3">
              <div className="h-0.5 w-32 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-accent-500 transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-semibold text-white/60">
                  {String(current + 1).padStart(2, "0")} / {String(active.length).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2.5 pointer-events-auto">
                  {active.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i)}
                      aria-label={`Slide ${i + 1}`}
                      className="flex items-center justify-center p-1"
                    >
                      <span
                        className={cn(
                          "block rounded-full transition-all duration-300",
                          i === current ? "h-2 w-6 bg-white" : "h-2 w-2 bg-white/40 hover:bg-white/70"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls (Dots below the card) */}
      {active.length > 1 && (
        <div className="flex md:hidden justify-center items-center gap-2.5 pt-3 pb-2 z-[60] relative">
          {active.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              className="flex items-center justify-center p-1"
            >
              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  i === current
                    ? "h-2 w-7 bg-brand-600"
                    : "h-2 w-2 bg-brand-200 hover:bg-brand-300"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
