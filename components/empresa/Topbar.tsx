"use client";

import { Menu, Bell, Search, ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useSidebar } from "./SidebarContext";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  empresaName?: string | null;
}

export function Topbar({ title, breadcrumbs, empresaName }: TopbarProps) {
  const { toggle } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#E8E4F3] bg-white/95 px-4 shadow-sm backdrop-blur-md md:px-6">
      {/* Hamburger */}
      <button
        onClick={toggle}
        className="grid h-9 w-9 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface-muted"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-ink-subtle">Painel de controle</span>
          {breadcrumbs?.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5 text-ink-subtle">
              <span>›</span>
              <span className={i === breadcrumbs.length - 1 ? "font-semibold text-ink" : ""}>
                {b.label}
              </span>
            </span>
          )) ?? (
            <>
              <span className="text-ink-subtle">›</span>
              <span className="font-semibold text-ink">{title}</span>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mx-auto hidden max-w-xs flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="h-9 w-full rounded-xl border border-[#E8E4F3] bg-surface-soft pl-9 pr-4 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-[#E8E4F3] bg-white text-ink-muted transition-colors hover:border-brand-200 hover:text-brand-700">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-[#E8E4F3] bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-brand-200"
          >
            <div className="grid h-6 w-6 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
              {(empresaName ?? "E")[0].toUpperCase()}
            </div>
            <span className="hidden sm:block max-w-[100px] truncate">
              {empresaName ?? "Empresa"}
            </span>
            <ChevronDown className="h-3 w-3 text-ink-subtle" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-[#E8E4F3] bg-white py-1 shadow-card">
                <a
                  href="/dashboard/empresa/configuracoes"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-soft"
                >
                  <User className="h-4 w-4 text-ink-muted" />
                  Meu perfil
                </a>
                <div className="my-1 h-px bg-[#E8E4F3]" />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
