"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Topbar } from "@/components/empresa/Topbar";
import { KpiCard } from "@/components/empresa/KpiCard";
import { ValidationWidget } from "@/components/empresa/widgets/ValidationWidget";
import { OffersWidget } from "@/components/empresa/widgets/OffersWidget";
import dynamic from "next/dynamic";

const PerformanceChart = dynamic(
  () => import("@/components/empresa/charts/PerformanceChart").then((mod) => mod.PerformanceChart),
  { ssr: false, loading: () => <div className="h-[220px] w-100% animate-pulse rounded-xl bg-gray-100" /> }
);
import {
  fetchEmpresaKpis,
  fetchRecentOffers,
  fetchVoucherPerformance,
} from "@/lib/empresa-data";
import { Suspense } from "react";

export default function EmpresaDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    kpis: any;
    offers: any[];
    performanceData: any[];
    user: any;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email ?? "";

      // Busca nome do perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id ?? "")
        .maybeSingle();

      const [kpis, offers, performanceData] = await Promise.all([
        fetchEmpresaKpis(userEmail),
        fetchRecentOffers(userEmail),
        fetchVoucherPerformance(userEmail),
      ]);

      setData({ kpis, offers, performanceData, user: { ...user, full_name: profile?.full_name } });
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F2FA]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const { kpis, offers, performanceData, user } = data;

  const kpiCards = [
    {
      title: "Ofertas Ativas",
      value: kpis.ofertasAtivas,
      icon: "building2" as const,
      iconBg: "bg-brand-100",
      iconColor: "text-brand-700",
    },
    {
      title: "Vouchers Gerados",
      value: kpis.vouchersGerados,
      icon: "ticket" as const,
      iconBg: "bg-accent-100",
      iconColor: "text-accent-700",
      trend: 12,
      trendLabel: "vs semana anterior",
    },
    {
      title: "Vouchers Validados",
      value: kpis.vouchersValidados,
      icon: "usercheck" as const,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      trend: 5,
      trendLabel: "vs semana anterior",
    },
    {
      title: "Receita (Est.)",
      value: kpis.receitaGerada,
      prefix: "R$",
      icon: "trendingup" as const,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  return (
    <>
      <Topbar title="Visão Geral" empresaName={user?.full_name ?? user?.email} />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Painel da Empresa 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gerencie suas ofertas e valide vouchers de clientes
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Area: Charts + Quick Validation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <div className="rounded-2xl bg-white p-5 shadow-soft border border-[#E8E4F3]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-ink">Desempenho de Vouchers</h2>
                  <p className="text-xs text-ink-muted">Gerados vs Validados nos últimos 7 dias</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
                   <div className="flex items-center gap-1.5 text-brand-400">
                     <div className="h-2 w-2 rounded-full bg-brand-200" />
                     Gerados
                   </div>
                   <div className="flex items-center gap-1.5 text-brand-700">
                     <div className="h-2 w-2 rounded-full bg-brand-500" />
                     Validados
                   </div>
                </div>
              </div>
              <Suspense fallback={<div className="h-[220px] animate-pulse rounded-lg bg-surface-soft" />}>
                <PerformanceChart data={performanceData} />
              </Suspense>
            </div>

            {/* Offers List */}
            <div className="rounded-2xl bg-white shadow-soft border border-[#E8E4F3] overflow-hidden">
              <div className="p-5 border-b border-[#E8E4F3] flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-ink">Minhas Ofertas</h2>
                  <p className="text-xs text-ink-muted">Gerencie suas promoções ativas</p>
                </div>
                <button className="rounded-xl bg-brand-gradient px-4 py-2 text-xs font-bold text-white shadow-lg shadow-brand-500/20 transition-transform active:scale-95">
                  Nova Oferta
                </button>
              </div>
              <OffersWidget offers={offers} />
            </div>
          </div>

          {/* Right Sidebar: Validation Widget */}
          <div className="space-y-6">
            <ValidationWidget />
            
            {/* Help/Tips card */}
            <div className="rounded-2xl bg-brand-gradient p-6 text-white shadow-lg shadow-brand-500/20">
              <h3 className="font-display font-bold">Dica do dia</h3>
              <p className="mt-2 text-sm text-brand-100">
                Ofertas com mais de 20% de desconto costumam ter 3x mais resgates na primeira semana.
              </p>
              <button className="mt-4 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-white/20 transition-colors">
                Ver mais dicas
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
