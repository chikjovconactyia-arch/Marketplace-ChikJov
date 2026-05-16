"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, CreditCard, Ticket, Share2,
  DollarSign, FileText, Layers, Grid3x3, Map, Settings, BarChart3,
  Sparkles, ChevronDown, X, Globe, UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard/admin", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/admin/empresas", icon: Building2, label: "Empresas" },
      { href: "/dashboard/admin/clientes", icon: Users, label: "Clientes" },
      { href: "/dashboard/admin/assinaturas", icon: CreditCard, label: "Assinaturas" },
    ],
  },
  {
    title: "Operações",
    items: [
      { href: "/dashboard/admin/vouchers", icon: Ticket, label: "Vouchers" },
      { href: "/dashboard/admin/indicacoes", icon: Share2, label: "Indique & Ganhe" },
      { href: "/dashboard/admin/leads", icon: UserCheck, label: "Leads" },
      { href: "/dashboard/admin/financeiro", icon: DollarSign, label: "Financeiro" },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { href: "/dashboard/admin/hero-carousel", icon: Layers, label: "Hero Carousel" },
      { href: "/dashboard/admin/parceiros", icon: Globe, label: "Parceiros" },
      { href: "/dashboard/admin/categorias", icon: Grid3x3, label: "Categorias" },
      { href: "/dashboard/admin/cidades", icon: Map, label: "Cidades" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/dashboard/admin/relatorios", icon: BarChart3, label: "Relatórios" },
      { href: "/dashboard/admin/configuracoes", icon: Settings, label: "Configurações" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col transition-transform duration-300 ease-in-out",
          "bg-[#160B3A]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/dashboard/admin" className="flex flex-col gap-1 items-start">
            <img src="/logo-2-chikjov.png" alt="ChikJov" className="h-8 w-auto brightness-0 invert" />
            <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-400">
              Painel do Admin
            </span>
          </Link>
          <button
            onClick={close}
            className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/10" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-gradient-to-r from-brand-500/30 to-brand-600/10 text-white shadow-sm ring-1 ring-brand-500/30"
                            : "text-white/60 hover:bg-white/8 hover:text-white"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive ? "text-brand-400" : "text-white/40 group-hover:text-white/80"
                          )}
                        />
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom: visit site */}
        <div className="mx-3 mb-4 mt-auto">
          <div className="h-px bg-white/10 mb-3" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-all hover:bg-white/8 hover:text-white"
          >
            <Globe className="h-4 w-4 text-white/30" />
            Ver site público
          </a>
        </div>
      </aside>
    </>
  );
}
