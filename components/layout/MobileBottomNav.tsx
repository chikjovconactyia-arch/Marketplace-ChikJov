"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
  { href: "/marketplace", icon: Store, label: "Marketplace", match: (p: string) => p.startsWith("/marketplace") },
  { href: "/dashboard/cliente", icon: User, label: "Minha Conta", match: (p: string) => p.startsWith("/dashboard/cliente") },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Esconde em rotas que não devem ter o menu inferior
  const hidden =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/dashboard/empresa") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/voucher/validar");

  if (hidden) return null;

  return (
    <>
      {/* Spacer para não cobrir o conteúdo (apenas mobile) */}
      <div aria-hidden className="h-24 md:hidden" />

      <nav
        aria-label="Navegação principal"
        className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 md:hidden"
      >
        {/* Container flutuante */}
        <div className="relative flex items-center gap-1 rounded-full border border-brand-100 bg-white/90 px-3 py-2 shadow-[0_8px_32px_rgba(124,58,237,0.18),0_2px_8px_rgba(124,58,237,0.08)] backdrop-blur-xl">
          {items.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative grid h-12 w-12 place-items-center rounded-full transition-all duration-300 ease-out",
                  "active:scale-90", // efeito zoom-out no toque
                  isActive
                    ? "bg-brand-gradient text-white shadow-lg shadow-brand-500/40 scale-110"
                    : "text-brand-600 hover:bg-brand-50"
                )}
              >
                <item.icon
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "h-6 w-6" : "h-5 w-5"
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />

                {/* Dot indicator abaixo do ícone ativo */}
                {isActive && (
                  <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
