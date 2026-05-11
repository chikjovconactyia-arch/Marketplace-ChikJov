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
  const supabase = createAdminClient();

  const [
    { count: empresasAtivas },
    { count: clientesAtivos },
    { count: assinaturasAtivas },
    { count: vouchersGerados },
    { data: vouchers },
    { data: referrals },
  ] = await Promise.all([
    supabase.from("empresas").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente").eq("subscription_status", "active"),
    supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("vouchers").select("*", { count: "exact", head: true }),
    supabase.from("vouchers").select("economy_value").eq("status", "used"),
    supabase.from("referrals").select("commission_value").eq("commission_status", "pago"),
  ]);

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
}

export async function fetchRecentCompanies(): Promise<RecentCompany[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("empresas")
    .select("id, name, category, city, active, is_featured, subscription_active, created_at")
    .order("created_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

export async function fetchPendingCompanies(): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("empresas")
    .select("*", { count: "exact", head: true })
    .eq("active", false);
  return count ?? 0;
}

export async function fetchTodayVouchers(): Promise<{ gerados: number; usados: number }> {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [{ count: gerados }, { count: usados }] = await Promise.all([
    supabase.from("vouchers").select("*", { count: "exact", head: true }).gte("created_at", todayStr),
    supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "used").gte("validated_at", todayStr),
  ]);

  return { gerados: gerados ?? 0, usados: usados ?? 0 };
}

export async function fetchReferralStats(): Promise<{
  totalIndicacoes: number;
  pendentes: number;
  aprovadas: number;
  comissoesPendentes: number;
}> {
  const supabase = createAdminClient();
  const [
    { count: totalIndicacoes },
    { count: pendentes },
    { count: aprovadas },
    { data: pendData },
  ] = await Promise.all([
    supabase.from("referrals").select("*", { count: "exact", head: true }),
    supabase.from("referrals").select("*", { count: "exact", head: true }).is("commission_status", null),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("commission_status", "pago"),
    supabase.from("referrals").select("commission_value").is("commission_status", null),
  ]);

  const comissoesPendentes = (pendData ?? []).reduce((acc, r) => acc + (r.commission_value ?? 0), 0);

  return {
    totalIndicacoes: totalIndicacoes ?? 0,
    pendentes: pendentes ?? 0,
    aprovadas: aprovadas ?? 0,
    comissoesPendentes,
  };
}

export async function fetchFinancialSummary(): Promise<{
  receitaMensal: number;
  receitaAnual: number;
  assinaturasAtivas: number;
  assinaturasCanceladas: number;
}> {
  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const [
    { count: atMes },
    { count: atAno },
    { count: assinaturasAtivas },
    { count: assinaturasCanceladas },
  ] = await Promise.all([
    supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo").gte("created_at", monthStart),
    supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo").gte("created_at", yearStart),
    supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "cancelado"),
  ]);

  const PRECO_PLANO = 39.9;

  return {
    receitaMensal: (atMes ?? 0) * PRECO_PLANO,
    receitaAnual: (atAno ?? 0) * PRECO_PLANO,
    assinaturasAtivas: assinaturasAtivas ?? 0,
    assinaturasCanceladas: assinaturasCanceladas ?? 0,
  };
}

// Gera dados mensais para gráficos agrupando por mês nos últimos 6 meses
export async function fetchMonthlyChartData(): Promise<{
  subscriptions: { month: string; assinantes: number; empresas: number }[];
  vouchers: { month: string; gerados: number; usados: number }[];
}> {
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
}

export async function fetchCategoryDistribution(): Promise<{ name: string; value: number }[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("empresas")
    .select("category")
    .eq("active", true)
    .not("category", "is", null);

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
}
