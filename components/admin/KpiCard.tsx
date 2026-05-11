"use client";

import { useEffect, useRef } from "react";
import {
  TrendingUp, TrendingDown, Building2, Users, CreditCard, Ticket, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconName = "building2" | "users" | "creditcard" | "ticket" | "trendingup" | "share2";

const iconMap: Record<IconName, React.ElementType> = {
  building2: Building2,
  users: Users,
  creditcard: CreditCard,
  ticket: Ticket,
  trendingup: TrendingUp,
  share2: Share2,
};

interface KpiCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
  animate?: boolean;
}

function useCountUp(target: number, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current || typeof target !== "number") return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      if (ref.current) ref.current.textContent = current.toLocaleString("pt-BR");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return ref;
}

export function KpiCard({
  title,
  value,
  prefix,
  suffix,
  icon: iconName,
  iconBg,
  iconColor,
  trend,
  trendLabel,
}: KpiCardProps) {
  const numericValue = typeof value === "number" ? value : 0;
  const countRef = useCountUp(numericValue);
  const Icon = iconMap[iconName];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(124,58,237,0.12)] hover:-translate-y-0.5">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-subtle">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            {prefix && <span className="text-sm font-medium text-ink-muted">{prefix}</span>}
            <span
              ref={countRef}
              className="font-display text-3xl font-bold leading-none text-ink"
            >
              {typeof value === "number" ? "0" : value}
            </span>
            {suffix && <span className="text-sm font-medium text-ink-muted">{suffix}</span>}
          </div>
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          {trend >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={trend >= 0 ? "text-emerald-600" : "text-red-600"}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
          {trendLabel && <span className="text-ink-subtle">{trendLabel}</span>}
        </div>
      )}

      {/* Decorative corner */}
      <div className={cn(
        "pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-0 transition-opacity group-hover:opacity-100",
        iconBg
      )} style={{ filter: "blur(16px)" }} />
    </div>
  );
}
