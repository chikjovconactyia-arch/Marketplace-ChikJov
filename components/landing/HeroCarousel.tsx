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

// Fallback quando não há slides no banco
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

  const go = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setProgress(0);
    setTimeout(() => {
      setCurrent(((idx % active.length) + active.length) % active.length);
      setTransitioning(false);
    }, 350);
  }, [active.length, transitioning]);

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

  const slide = active[current];
  if (!slide) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0A0A0F]"
      style={{ height: "min(750px, 85vh)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images (all pre-rendered, animated via opacity) */}
      {active.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== current}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === current && !transitioning ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Image */}
          <div
            className="absolute inset-0 bg-cover bg-left md:bg-center"
            style={{
              backgroundImage: `url(${s.image_url})`,
              transform: i === current ? "scale(1.03)" : "scale(1)",
              transition: "transform 8s ease-out",
            }}
          />
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-r md:from-[#0A0A0F] md:via-[#0A0A0F]/70 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-[#0A0A0F]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0F]/60" />
        </div>
      ))}

      {/* Content — positioned over everything */}
      <div className="relative flex h-full items-center">
        <div className="container-tight w-full">
          <div className="mx-auto max-w-2xl text-center md:ml-0 md:text-left">
            {/* Badge */}
            {slide.badge && (
              <div
                className={cn(
                  "mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md",
                  "transition-all duration-500",
                  transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                <Sparkles className="h-3 w-3 text-accent-400" />
                {slide.badge}
              </div>
            )}

            {/* Title */}
            <h1
              className={cn(
                "font-display text-4xl font-bold leading-[1.08] text-white text-balance drop-shadow-2xl md:text-5xl lg:text-6xl",
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
                  "mt-4 mx-auto max-w-xl text-base leading-relaxed text-white/80 text-balance md:ml-0 md:text-lg",
                  "transition-all duration-500 delay-150",
                  transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                )}
              >
                {slide.subtitle}
              </p>
            )}

            {/* CTAs */}
            <div
              className={cn(
                "mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start",
                "transition-all duration-500 delay-200",
                transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
              )}
            >
              {slide.cta_text && (
                <Link
                  href={slide.cta_link ?? "#preco"}
                  className="inline-flex h-13 items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 text-base font-bold text-white shadow-cta transition-all hover:scale-[1.03] hover:bg-accent-600"
                >
                  {slide.cta_text}
                </Link>
              )}
              <Link
                href="#empresas"
                className="inline-flex h-13 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Sou empresa
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow navigation */}
      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60 md:left-8"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            aria-label="Próximo"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-black/60 md:right-8"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Bottom controls */}
      {active.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-3">
          {/* Progress bar for current slide */}
          <div className="hidden h-0.5 w-32 overflow-hidden rounded-full bg-white/20 md:block">
            <div
              className="h-full rounded-full bg-accent-500 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dots + counter */}
          <div className="flex items-center gap-4">
            {/* Slide counter */}
            <span className="hidden font-mono text-xs font-semibold text-white/60 md:block">
              {String(current + 1).padStart(2, "0")} / {String(active.length).padStart(2, "0")}
            </span>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {active.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === current
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
