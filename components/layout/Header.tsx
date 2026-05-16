"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Sparkles, Ticket, PiggyBank, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const links = isMarketplace ? marketplaceLinks : defaultLinks;

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", session.user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const dashboardLink = profile?.role === "empresa" ? "/dashboard/empresa" : "/dashboard/cliente";
  
  // Extrai as iniciais do nome ou email
  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(" ");
      if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      return names[0][0].toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  // Se o usuário tem foto no metadata do Google, usa ela
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/60 bg-white/80 backdrop-blur-md">
      <div className="container-tight flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-chikjov.png" alt="ChikJov" className="h-10 w-auto" />
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

          {!isMarketplace && !user && (
            <div className="hidden items-center gap-3 md:flex">
              <Button href="/auth/login" variant="ghost" size="sm">
                Entrar
              </Button>
              <Button href="#preco" size="sm">
                Assinar agora
              </Button>
            </div>
          )}

          {user && (
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 overflow-hidden rounded-full border-2 border-brand-100 bg-brand-50 text-brand-700 transition-colors hover:border-brand-200"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{getInitials()}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#F1ECF8] bg-white p-2 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
                  <div className="px-3 py-2 mb-1 border-b border-[#F1ECF8]">
                    <p className="truncate text-sm font-bold text-ink">{profile?.full_name || "Usuário"}</p>
                    <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  </div>
                  <Link
                    href={dashboardLink}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserCircle className="h-4 w-4" />
                    Minha Conta
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              )}
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

          {user && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-brand-50/50 p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{getInitials()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{profile?.full_name || "Usuário"}</p>
                <p className="truncate text-xs text-ink-muted">{user.email}</p>
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
              {l.label}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link
                href={dashboardLink}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
              >
                <UserCircle className="h-4 w-4 text-brand-500" />
                Minha Conta
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </>
          ) : (
            !isMarketplace && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button href="/auth/login" variant="outline" size="sm">
                  Entrar
                </Button>
                <Button href="#preco" size="sm">
                  Assinar
                </Button>
              </div>
            )
          )}
          
          {isMarketplace && !user && (
             <div className="mt-2 grid grid-cols-1 gap-2">
               <Button href="/auth/login" variant="outline" size="sm">
                 Entrar / Assinar
               </Button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}
