import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "outline";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variants = {
    default: "bg-white shadow-card",
    soft: "bg-surface-soft",
    outline: "bg-white border border-brand-100",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-shadow",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
