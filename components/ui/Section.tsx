import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  background?: "white" | "soft" | "brand";
  align?: "left" | "center";
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  background = "white",
  align = "center",
  className,
  ...props
}: SectionProps) {
  const bg = {
    white: "bg-white",
    soft: "bg-surface-soft",
    brand: "bg-brand-gradient text-white",
  }[background];

  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <section
      id={id}
      className={cn("py-16 md:py-24 lg:py-28", bg, className)}
      {...props}
    >
      <div className="container-tight">
        {(eyebrow || title || description) && (
          <div className={cn("max-w-3xl mb-12 md:mb-16", alignClass)}>
            {eyebrow && (
              <span
                className={cn(
                  "pill",
                  background === "brand" &&
                    "border-white/20 bg-white/10 text-white"
                )}
              >
                {eyebrow}
              </span>
            )}
            {title && (
              <h2
                className={cn(
                  "heading-display mt-4 text-3xl md:text-4xl lg:text-5xl text-balance",
                  background === "brand" && "text-white"
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "mt-5 text-lg text-ink-muted text-balance",
                  background === "brand" && "text-white/80"
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
