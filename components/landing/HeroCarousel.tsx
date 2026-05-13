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
        "relative w-full overflow-hidden bg-[#0A0A0F]",
        // Mobile: aspect-ratio 4:5 vertical (estilo Instagram/TikTok)
        "aspect-[4/5] sm:aspect-[16/10]",
        // Desktop: altura fixa wide
        "md:aspect-auto md:h-[82vh] md:max-h-[760px]"
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background slides — usa <picture> para carregar imagem correta por device */}
      {active.map((s, i) => {
        const desktopSrc = s.image_url;
        const mobileSrc = s.mobile_image_url ?? s.image_url; // fallback p/ desktop se mobile não existir
        return (
          <div
            key={s.id}
            aria-hidden={i !== current}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              i === current && !transitioning ? "opacity-100" : "opacity-0"
            )}
          >
            <picture>
              {/* Mobile (até 767px) — imagem vertical 1080×1350 */}
              <source media="(max-width: 767px)" srcSet={mobileSrc} />
              {/* Desktop — imagem horizontal 1920×700 */}
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
            {/* Mobile: gradiente forte na parte inferior para legibilidade do texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent md:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent md:hidden" />
            {/* Desktop: overlay + gradiente lateral para o texto */}
            <div className="absolute inset-0 hidden bg-black/30 md:block" />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/75 to-transparent md:block" />
            <div className="absolute inset-0 hidden bg-gradient-to-t from-[#0A0A0F]/80 via-transparent to-transparent md:block" />
          </div>
        );
      })}

      {/* Content */}
      <div className="relative flex h-full items-end md:items-center">
        <div className="container-tight w-full">
          <div
            className="mx-auto w-full max-w-2xl text-center md:ml-0 md:text-left pb-14 sm:pb-16 md:pb-0"
          >
            {/* Badge */}
            {slide.badge && (
              <div
                className={cn(
                  "mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md",
                  "px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white",
                  "md:mb-5 md:gap-2 md:px-4 md:py-1.5 md:text-xs",
                  "transition-all duration-500",
                  transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                <Sparkles className="h-2.5 w-2.5 text-accent-400 md:h-3 md:w-3" />
                {slide.badge}
              </div>
            )}

            {/* Title */}
            <h1
              className={cn(
                "font-display font-bold leading-tight text-white drop-shadow-2xl",
                "text-xl sm:text-2xl md:text-5xl lg:text-6xl",
                "transition-all duration-500 delay-75",
                transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
              )}
            >
              {slide.title}
            </h1>

            {/* Subtitle — oculto no mobile menor, visível no sm+ */}
            {slide.subtitle && (
              <p
                className={cn(
                  "mx-auto mt-2 text-white/80 leading-relaxed md:ml-0",
                  "hidden sm:block sm:text-sm md:text-lg",
                  "max-w-[90%] sm:max-w-lg md:max-w-xl",
                  "transition-all duration-500 delay-150",
                  transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                )}
              >
                {slide.subtitle}
              </p>
            )}

            {/* Subtitle curto no mobile */}
            {slide.subtitle && (
              <p
                className={cn(
                  "mx-auto mt-2 text-xs text-white/75 leading-snug",
                  "block sm:hidden",
                  "max-w-[85%]",
                  "transition-all duration-500 delay-150",
                  transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                )}
              >
                {slide.subtitle.length > 80 ? slide.subtitle.slice(0, 80) + "…" : slide.subtitle}
              </p>
            )}

            {/* CTAs — só exibe se texto E link estiverem preenchidos */}
            {(slide.cta_text?.trim() || slide.cta2_text?.trim()) && (
              <div
                className={cn(
                  "mt-4 flex flex-col items-center gap-2 md:mt-8 md:flex-row md:justify-start",
                  "sm:flex-row sm:justify-center sm:gap-3",
                  "transition-all duration-500 delay-200",
                  transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                )}
              >
                {/* Botão 1 — só aparece se texto e link preenchidos */}
                {slide.cta_text?.trim() && slide.cta_link?.trim() && (
                  <Link
                    href={slide.cta_link}
                    className={cn(
                      "inline-flex items-center justify-center rounded-full bg-accent-500 font-bold text-white shadow-cta transition-all hover:bg-accent-600 active:scale-[0.98]",
                      "h-10 w-full px-5 text-sm",
                      "sm:h-12 sm:w-auto sm:px-7",
                      "md:h-14 md:px-8 md:text-base"
                    )}
                  >
                    {slide.cta_text}
                  </Link>
                )}
                {/* Botão 2 — só aparece se texto e link preenchidos */}
                {slide.cta2_text?.trim() && slide.cta2_link?.trim() && (
                  <Link
                    href={slide.cta2_link}
                    className={cn(
                      "inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20",
                      "h-10 w-full px-5 text-sm",
                      "sm:h-12 sm:w-auto sm:px-7",
                      "md:h-14 md:px-8 md:text-base"
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

      {/* Arrows — ocultas no mobile (usa swipe), visíveis md+ */}
      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="hidden md:grid absolute left-8 top-1/2 z-20 -translate-y-1/2 h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            aria-label="Próximo"
            className="hidden md:grid absolute right-8 top-1/2 z-20 -translate-y-1/2 h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Bottom controls */}
      {active.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center gap-2 md:bottom-7 md:gap-3">
          {/* Progress bar — apenas desktop */}
          <div className="hidden h-0.5 w-32 overflow-hidden rounded-full bg-white/20 md:block">
            <div
              className="h-full rounded-full bg-accent-500 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Counter — apenas desktop */}
            <span className="hidden font-mono text-xs font-semibold text-white/60 md:block">
              {String(current + 1).padStart(2, "0")} / {String(active.length).padStart(2, "0")}
            </span>

            {/* Dots — maiores no mobile para toque fácil */}
            <div className="flex items-center gap-2.5">
              {active.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1}`}
                  // Área de toque grande no mobile
                  className="flex items-center justify-center p-1"
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-300",
                      i === current
                        ? "h-2 w-7 bg-white md:w-6"
                        : "h-2 w-2 bg-white/40 hover:bg-white/70"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
