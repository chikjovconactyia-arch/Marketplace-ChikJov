"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, Settings, User, Share2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/marketplace", icon: Star, label: "Clube", match: (p: string) => p.startsWith("/marketplace") },
  { href: "/landpage", icon: Globe, label: "Landpage", match: (p: string) => p.startsWith("/landpage") },
  { href: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
  { href: "/dashboard/cliente", icon: User, label: "Minha Conta", match: (p: string) => p.startsWith("/dashboard/cliente") && !p.startsWith("/dashboard/cliente/indicacoes") },
  { href: "/dashboard/cliente/indicacoes", icon: Share2, label: "Indique", match: (p: string) => p.startsWith("/dashboard/cliente/indicacoes") },
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
        className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-2 pb-3 pt-2 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.04)] rounded-t-2xl md:hidden"
      >
        {items.map((item) => {
          const isActive = item.match(pathname);
          
          return (
            <div key={item.href} className="flex-1 flex justify-center items-end h-14">
              {isActive ? (
                <div className="relative -top-5 flex flex-col items-center">
                  {/* Outer glow and ring effect */}
                  <div className="absolute inset-0 bg-brand-500 opacity-20 rounded-full blur-xl scale-150"></div>
                  
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current="page"
                    className={cn(
                      "flex flex-col items-center justify-center bg-brand-gradient text-white rounded-full w-[68px] h-[68px] transform scale-105 transition-all active:scale-100 duration-200 z-10 border-[5px] border-surface shadow-[0_10px_25px_-5px_rgba(124,58,237,0.5),0_8px_10px_-6px_rgba(124,58,237,0.4)]"
                    )}
                  >
                    <item.icon className="h-6 w-6" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold mt-1 tracking-tight">{item.label}</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="flex flex-col items-center justify-center text-ink-muted w-full h-full hover:bg-brand-50 rounded-xl transition-all active:scale-90 duration-150"
                >
                  <item.icon className="h-6 w-6 mb-1" strokeWidth={2} />
                  <span className="text-[11px] font-medium tracking-tight truncate w-full text-center px-1">{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
