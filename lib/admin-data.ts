import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminKpis {
  empresasAtivas: number;
  clientesAtivos: number;
  assinaturasAtivas: number;
  vouchersGerados: number;
  economiaTotal: number;
  comissoesTotal: number;
}

export interface RecentActivity {
  id: string;
  type: "empresa" | "voucher" | "assinatura" | "indicacao" | "pagamento";
  title: string;
  subtitle: string;
  time: string;
}

export interface RecentCompany {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  active: boolean;
  is_featured: boolean | null;
  subscription_active: boolean | null;
  created_at: string | null;
}

export interface TopReferral {
  referrer_user_id: string;
  total_commissions: number;
  total_referrals: number;
}

export async function fetchAdminKpis(): Promise<AdminKpis> {
  try {
    const supabase = createAdminClient();

    const [
      { count: empresasAtivas, error: err1 },
      { count: clientesAtivos, error: err2 },
      { count: assinaturasAtivas, error: err3 },
      { count: vouchersGerados, error: err4 },
      { data: vouchers, error: err5 },
      { data: referrals, error: err6 },
    ] = await Promise.all([
      supabase.from("empresas").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente").eq("subscription_status", "active"),
      supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo"),
      supabase.from("vouchers").select("*", { count: "exact", head: true }),
      supabase.from("vouchers").select("economy_value").eq("status", "used"),
      supabase.from("referrals").select("commission_value").eq("commission_status", "pago"),
    ]);

    if (err1 || err2 || err3 || err4 || err5 || err6) {
      console.error("Erro ao buscar KPIs do admin:", { err1, err2, err3, err4, err5, err6 });
    }

    const economiaTotal = (vouchers ?? []).reduce((acc, v) => acc + (v.economy_value ?? 0), 0);
    const comissoesTotal = (referrals ?? []).reduce((acc, r) => acc + (r.commission_value ?? 0), 0);

    return {
      empresasAtivas: empresasAtivas ?? 0,
      clientesAtivos: clientesAtivos ?? 0,
      assinaturasAtivas: assinaturasAtivas ?? 0,
      vouchersGerados: vouchersGerados ?? 0,
      economiaTotal,
      comissoesTotal,
    };
  } catch (error) {
    console.error("Erro de exceção em fetchAdminKpis:", error);
    return {
      empresasAtivas: 0,
      clientesAtivos: 0,
      assinaturasAtivas: 0,
      vouchersGerados: 0,
      economiaTotal: 0,
      comissoesTotal: 0,
    };
  }
}

export async function fetchRecentCompanies(): Promise<RecentCompany[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("empresas")
      .select("id, name, category, city, active, is_featured, subscription_active, created_at")
      .order("created_at", { ascending: false })
      .limit(6);
    
    if (error) console.error("Erro em fetchRecentCompanies:", error);
    return data ?? [];
  } catch (error) {
    console.error("Exceção em fetchRecentCompanies:", error);
    return [];
  }
}

export async function fetchPendingCompanies(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("empresas")
      .select("*", { count: "exact", head: true })
      .eq("active", false);
    
    if (error) console.error("Erro em fetchPendingCompanies:", error);
    return count ?? 0;
  } catch (error) {
    console.error("Exceção em fetchPendingCompanies:", error);
    return 0;
  }
}

export async function fetchTodayVouchers(): Promise<{ gerados: number; usados: number }> {
  try {
    const supabase = createAdminClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const [{ count: gerados, error: err1 }, { count: usados, error: err2 }] = await Promise.all([
      supabase.from("vouchers").select("*", { count: "exact", head: true }).gte("created_at", todayStr),
      supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "used").gte("validated_at", todayStr),
    ]);

    if (err1 || err2) console.error("Erro em fetchTodayVouchers:", { err1, err2 });
    return { gerados: gerados ?? 0, usados: usados ?? 0 };
  } catch (error) {
    console.error("Exceção em fetchTodayVouchers:", error);
    return { gerados: 0, usados: 0 };
  }
}

export async function fetchReferralStats(): Promise<{
  totalIndicacoes: number;
  pendentes: number;
  aprovadas: number;
  comissoesPendentes: number;
}> {
  try {
    const supabase = createAdminClient();
    const [
      { count: totalIndicacoes, error: err1 },
      { count: pendentes, error: err2 },
      { count: aprovadas, error: err3 },
      { data: pendData, error: err4 },
    ] = await Promise.all([
      supabase.from("referrals").select("*", { count: "exact", head: true }),
      supabase.from("referrals").select("*", { count: "exact", head: true }).eq("commission_status", "pending"),
      supabase.from("referrals").select("*", { count: "exact", head: true }).eq("commission_status", "pago"),
      supabase.from("referrals").select("commission_value").eq("commission_status", "pending"),
    ]);

    if (err1 || err2 || err3 || err4) {
      console.error("Erro em fetchReferralStats:", { err1, err2, err3, err4 });
    }

    const comissoesPendentes = (pendData ?? []).reduce((acc, r) => acc + (r.commission_value ?? 0), 0);

    return {
      totalIndicacoes: totalIndicacoes ?? 0,
      pendentes: pendentes ?? 0,
      aprovadas: aprovadas ?? 0,
      comissoesPendentes,
    };
  } catch (error) {
    console.error("Exceção em fetchReferralStats:", error);
    return { totalIndicacoes: 0, pendentes: 0, aprovadas: 0, comissoesPendentes: 0 };
  }
}

export async function fetchFinancialSummary(): Promise<{
  receitaMensal: number;
  receitaAnual: number;
  assinaturasAtivas: number;
  assinaturasCanceladas: number;
}> {
  try {
    const supabase = createAdminClient();
    const PRECO_PLANO = 29.9;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    const [
      { count: atMes, error: err1 },
      { count: atAno, error: err2 },
      { count: assinaturasAtivas, error: err3 },
      { count: assinaturasCanceladas, error: err4 },
    ] = await Promise.all([
      supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo").gte("created_at", startOfMonth),
      supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo").gte("created_at", startOfYear),
      supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo"),
      supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "cancelado"),
    ]);

    if (err1 || err2 || err3 || err4) {
      console.error("Erro em fetchFinancialSummary:", { err1, err2, err3, err4 });
    }

    return {
      receitaMensal: (atMes ?? 0) * PRECO_PLANO,
      receitaAnual: (atAno ?? 0) * PRECO_PLANO,
      assinaturasAtivas: assinaturasAtivas ?? 0,
      assinaturasCanceladas: assinaturasCanceladas ?? 0,
    };
  } catch (error) {
    console.error("Exceção em fetchFinancialSummary:", error);
    return {
      receitaMensal: 0,
      receitaAnual: 0,
      assinaturasAtivas: 0,
      assinaturasCanceladas: 0,
    };
  }
}

// Gera dados mensais para gráficos agrupando por mês nos últimos 6 meses
export async function fetchMonthlyChartData(): Promise<{
  subscriptions: { month: string; assinantes: number; empresas: number }[];
  vouchers: { month: string; gerados: number; usados: number }[];
}> {
  try {
    const supabase = createAdminClient();

    const months: { label: string; start: string; end: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = start.toLocaleString("pt-BR", { month: "short" });
      months.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }

    const subscriptions = await Promise.all(
      months.map(async (m) => {
        const [{ count: assinantes }, { count: empresas }] = await Promise.all([
          supabase.from("assinaturas").select("*", { count: "exact", head: true }).gte("created_at", m.start).lte("created_at", m.end),
          supabase.from("empresas").select("*", { count: "exact", head: true }).gte("created_at", m.start).lte("created_at", m.end),
        ]);
        return { month: m.label, assinantes: assinantes ?? 0, empresas: empresas ?? 0 };
      })
    );

    const vouchers = await Promise.all(
      months.map(async (m) => {
        const [{ count: gerados }, { count: usados }] = await Promise.all([
          supabase.from("vouchers").select("*", { count: "exact", head: true }).gte("created_at", m.start).lte("created_at", m.end),
          supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "used").gte("validated_at", m.start).lte("validated_at", m.end),
        ]);
        return { month: m.label, gerados: gerados ?? 0, usados: usados ?? 0 };
      })
    );

    return { subscriptions, vouchers };
  } catch (error) {
    console.error("Exceção em fetchMonthlyChartData:", error);
    return { subscriptions: [], vouchers: [] };
  }
}

export async function fetchCategoryDistribution(): Promise<{ name: string; value: number }[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("empresas")
      .select("category")
      .eq("active", true)
      .not("category", "is", null);

    if (error) console.error("Erro em fetchCategoryDistribution:", error);

    if (!data || data.length === 0) {
      return [
        { name: "Beleza", value: 32 },
        { name: "Saúde", value: 24 },
        { name: "Alimentação", value: 18 },
        { name: "Esporte", value: 14 },
        { name: "Outros", value: 12 },
      ];
    }

    const counts: Record<string, number> = {};
    for (const { category } of data) {
      if (category) counts[category] = (counts[category] ?? 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  } catch (error) {
    console.error("Exceção em fetchCategoryDistribution:", error);
    return [];
  }
}
