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
  image_url: string;
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
        // Mobile: altura menor e fixa; desktop: baseada no viewport
        "min-h-[520px] sm:min-h-[600px] md:min-h-[0]"
      )}
      style={{ height: "clamp(520px, 85vh, 760px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background slides */}
      {active.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== current}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === current && !transitioning ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${s.image_url})`,
              transform: i === current ? "scale(1.04)" : "scale(1)",
              transition: "transform 8s ease-out",
            }}
          />
          {/* Mobile: overlay mais escuro para garantir legibilidade */}
          <div className="absolute inset-0 bg-black/60 md:bg-black/30" />
          {/* Desktop: gradiente lateral para o texto */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/75 to-transparent md:block" />
          {/* Gradiente inferior em todos */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative flex h-full items-center">
        <div className="container-tight w-full">
          <div
            className={cn(
              // Mobile: centralizado; Desktop: alinhado à esquerda
              "mx-auto w-full max-w-2xl text-center md:ml-0 md:text-left",
              // Padding bottom no mobile para não sobrepor os dots
              "pb-20 md:pb-0"
            )}
          >
            {/* Badge */}
            {slide.badge && (
              <div
                className={cn(
                  "mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md",
                  // Mobile menor
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white",
                  "md:px-4 md:py-1.5 md:text-xs",
                  "transition-all duration-500",
                  transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                <Sparkles className="h-3 w-3 text-accent-400" />
                {slide.badge}
              </div>
            )}

            {/* Title — escala mobile→desktop */}
            <h1
              className={cn(
                "font-display font-bold leading-[1.08] text-white text-balance drop-shadow-2xl",
                "text-[1.75rem] sm:text-3xl md:text-5xl lg:text-6xl",
                "transition-all duration-500 delay-75",
                transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
              )}
            >
              {slide.title}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p
                className={cn(
                  "mx-auto mt-3 text-white/80 text-balance leading-relaxed md:ml-0",
                  "text-sm sm:text-base md:text-lg",
                  "max-w-[90%] sm:max-w-xl",
                  "transition-all duration-500 delay-150",
                  transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                )}
              >
                {slide.subtitle}
              </p>
            )}

            {/* CTAs — full-width no mobile, auto no desktop */}
            <div
              className={cn(
                "mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-start",
                "sm:flex-row sm:justify-center",
                "transition-all duration-500 delay-200",
                transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
              )}
            >
              {slide.cta_text && (
                <Link
                  href={slide.cta_link ?? "#preco"}
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 font-bold text-white shadow-cta transition-all hover:scale-[1.03] hover:bg-accent-600",
                    // Mobile: maior altura para toque confortável
                    "h-14 px-7 text-base sm:h-14 sm:w-auto md:h-13"
                  )}
                >
                  {slide.cta_text}
                </Link>
              )}
              <Link
                href="#empresas"
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20",
                  "h-14 px-7 text-base sm:h-14 sm:w-auto md:h-13"
                )}
              >
                Sou empresa
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows — menores no mobile, maiores no desktop; ocultos se 1 slide */}
      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className={cn(
              "absolute top-1/2 z-20 -translate-y-1/2 grid place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60",
              // Mobile: menor e mais próximo da borda
              "left-3 h-10 w-10 md:left-8 md:h-12 md:w-12"
            )}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={next}
            aria-label="Próximo"
            className={cn(
              "absolute top-1/2 z-20 -translate-y-1/2 grid place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60",
              "right-3 h-10 w-10 md:right-8 md:h-12 md:w-12"
            )}
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Bottom controls */}
      {active.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2 md:bottom-7 md:gap-3">
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
