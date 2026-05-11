"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles, Ticket, PiggyBank, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const defaultLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#beneficios", label: "Benefícios" },
  { href: "/#preco", label: "Preço" },
  { href: "/#empresas", label: "Para empresas" },
];

const marketplaceLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/dashboard/cliente", label: "Minha Conta" },
];

interface HeaderProps {
  isMarketplace?: boolean;
  voucherStats?: {
    count: number;
    totalSaved: number;
  };
}

export function Header({ isMarketplace, voucherStats }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const links = isMarketplace ? marketplaceLinks : defaultLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/60 bg-white/80 backdrop-blur-md">
      <div className="container-tight flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-card">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="hidden font-display text-xl font-bold text-brand-700 sm:inline-block">
            ChikJov
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isMarketplace && voucherStats && (
            <div className="hidden items-center gap-2 lg:flex">
              <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm border border-brand-100">
                <Ticket className="h-3.5 w-3.5" />
                <span>{voucherStats.count} Vouchers</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm border border-emerald-100">
                <PiggyBank className="h-3.5 w-3.5" />
                <span>R$ {voucherStats.totalSaved.toFixed(2)}</span>
              </div>
            </div>
          )}

          {!isMarketplace && (
            <div className="hidden items-center gap-3 md:flex">
              <Button href="/auth/login" variant="ghost" size="sm">
                Entrar
              </Button>
              <Button href="#preco" size="sm">
                Assinar agora
              </Button>
            </div>
          )}

          <button
            aria-label="Abrir menu"
            className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-brand-100 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="container-tight flex flex-col gap-1 py-4">
          {isMarketplace && voucherStats && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center justify-center rounded-xl bg-brand-50 p-3 text-center border border-brand-100">
                <Ticket className="mb-1 h-5 w-5 text-brand-600" />
                <span className="text-xs font-medium text-brand-900">Vouchers</span>
                <span className="text-sm font-bold text-brand-700">{voucherStats.count}</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 p-3 text-center border border-emerald-100">
                <PiggyBank className="mb-1 h-5 w-5 text-emerald-600" />
                <span className="text-xs font-medium text-brand-900">Economia</span>
                <span className="text-sm font-bold text-emerald-700">R$ {voucherStats.totalSaved.toFixed(2)}</span>
              </div>
            </div>
          )}

          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
            >
              {l.label === "Minha Conta" && <UserCircle className="h-4 w-4 text-brand-500" />}
              {l.label}
            </Link>
          ))}
          
          {!isMarketplace && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button href="/auth/login" variant="outline" size="sm">
                Entrar
              </Button>
              <Button href="#preco" size="sm">
                Assinar
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
