import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityFeed } from "@/components/admin/widgets/ActivityFeed";
import { CompaniesWidget } from "@/components/admin/widgets/CompaniesWidget";
import { FinancialWidget } from "@/components/admin/widgets/FinancialWidget";
import { ReferralWidget } from "@/components/admin/widgets/ReferralWidget";
import { VouchersWidget } from "@/components/admin/widgets/VouchersWidget";
import { SubscriptionsChart } from "@/components/admin/charts/SubscriptionsChart";
import { VouchersChart } from "@/components/admin/charts/VouchersChart";
import { CategoriesChart } from "@/components/admin/charts/CategoriesChart";
import {
  fetchAdminKpis,
  fetchRecentCompanies,
  fetchPendingCompanies,
  fetchTodayVouchers,
  fetchReferralStats,
  fetchFinancialSummary,
  fetchMonthlyChartData,
  fetchCategoryDistribution,
} from "@/lib/admin-data";

export const metadata = { title: "Dashboard Admin — ChikJov" };
export const revalidate = 60;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  
  if (authError || !userData?.user) {
    console.error("Erro de autenticação no dashboard admin:", authError);
    return <div>Erro de autenticação. Por favor, faça login novamente.</div>;
  }

  const user = userData.user;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao carregar perfil do admin:", profileError);
  }

  // Fetch all data in parallel with error handling
  let dashboardData;
  try {
    dashboardData = await Promise.all([
      fetchAdminKpis(),
      fetchRecentCompanies(),
      fetchPendingCompanies(),
      fetchTodayVouchers(),
      fetchReferralStats(),
      fetchFinancialSummary(),
      fetchMonthlyChartData(),
      fetchCategoryDistribution(),
    ]);
  } catch (err) {
    console.error("Erro fatal ao carregar dados do dashboard admin:", err);
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">Erro Interno do Servidor (500)</h1>
        <p className="mt-2 text-ink-muted">Ocorreu um erro ao processar os dados do dashboard. Verifique os logs do servidor.</p>
        <pre className="mt-4 inline-block rounded bg-surface-muted p-4 text-left text-xs">
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>
    );
  }

  const [
    kpis,
    recentCompanies,
    pendingCount,
    todayVouchers,
    referralStats,
    financial,
    chartData,
    categoryData,
  ] = dashboardData;

  const kpiCards = [
    {
      title: "Empresas ativas",
      value: kpis.empresasAtivas,
      icon: "building2" as const,
      iconBg: "bg-brand-100",
      iconColor: "text-brand-700",
      trend: 8,
      trendLabel: "vs mês anterior",
    },
    {
      title: "Clientes ativos",
      value: kpis.clientesAtivos,
      icon: "users" as const,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      trend: 12,
      trendLabel: "vs mês anterior",
    },
    {
      title: "Assinaturas ativas",
      value: kpis.assinaturasAtivas,
      icon: "creditcard" as const,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      trend: 5,
      trendLabel: "vs mês anterior",
    },
    {
      title: "Vouchers gerados",
      value: kpis.vouchersGerados,
      icon: "ticket" as const,
      iconBg: "bg-accent-100",
      iconColor: "text-accent-700",
      trend: 22,
      trendLabel: "vs mês anterior",
    },
    {
      title: "Economia gerada",
      value: Math.round(kpis.economiaTotal),
      prefix: "R$",
      icon: "trendingup" as const,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
      trend: 18,
      trendLabel: "total acumulado",
    },
    {
      title: "Comissões Indique",
      value: Math.round(kpis.comissoesTotal),
      prefix: "R$",
      icon: "share2" as const,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-700",
      trend: 35,
      trendLabel: "vs mês anterior",
    },
  ];

  return (
    <>
      <Topbar title="Dashboard" adminName={profile?.full_name} />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Olá, {profile?.full_name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Visão geral do ChikJov em tempo real
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>

        {/* Charts row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Subscriptions area chart — 2/3 width */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-ink">Crescimento de assinaturas</h2>
                <p className="text-xs text-ink-muted">Últimos 6 meses — clientes + empresas</p>
              </div>
            </div>
            <SubscriptionsChart data={chartData.subscriptions} />
          </div>

          {/* Categories donut — 1/3 width */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4">
              <h2 className="font-display text-base font-bold text-ink">Categorias</h2>
              <p className="text-xs text-ink-muted">Distribuição de empresas ativas</p>
            </div>
            <CategoriesChart data={categoryData} />
          </div>
        </div>

        {/* Vouchers chart + Activity */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Bar chart */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-ink">Vouchers por mês</h2>
                <p className="text-xs text-ink-muted">Gerados vs utilizados</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#C4B5FD]" />
                  Gerados
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" />
                  Usados
                </span>
              </div>
            </div>
            <VouchersChart data={chartData.vouchers} />
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4">
              <h2 className="font-display text-base font-bold text-ink">Atividades recentes</h2>
              <p className="text-xs text-ink-muted">Últimas ações no sistema</p>
            </div>
            <ActivityFeed />
          </div>
        </div>

        {/* Bottom widgets row */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Financial */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4">
              <h2 className="font-display text-base font-bold text-ink">Financeiro</h2>
              <p className="text-xs text-ink-muted">Resumo de receitas</p>
            </div>
            <FinancialWidget
              receitaMensal={financial.receitaMensal}
              receitaAnual={financial.receitaAnual}
              assinaturasAtivas={financial.assinaturasAtivas}
              assinaturasCanceladas={financial.assinaturasCanceladas}
            />
          </div>

          {/* Vouchers widget */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4">
              <h2 className="font-display text-base font-bold text-ink">Vouchers hoje</h2>
              <p className="text-xs text-ink-muted">Atividade do dia</p>
            </div>
            <VouchersWidget
              geradosHoje={todayVouchers.gerados}
              usadosHoje={todayVouchers.usados}
              totalGerados={kpis.vouchersGerados}
              economiaTotal={kpis.economiaTotal}
            />
          </div>

          {/* Companies widget */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4">
              <h2 className="font-display text-base font-bold text-ink">Empresas</h2>
              <p className="text-xs text-ink-muted">Últimas cadastradas</p>
            </div>
            <CompaniesWidget companies={recentCompanies} pending={pendingCount} />
          </div>

          {/* Referral widget */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4">
              <h2 className="font-display text-base font-bold text-ink">Indique & Ganhe</h2>
              <p className="text-xs text-ink-muted">Programa de indicação</p>
            </div>
            <ReferralWidget
              totalIndicacoes={referralStats.totalIndicacoes}
              pendentes={referralStats.pendentes}
              aprovadas={referralStats.aprovadas}
              comissoesPendentes={referralStats.comissoesPendentes}
            />
          </div>
        </div>
      </div>
    </>
  );
}
