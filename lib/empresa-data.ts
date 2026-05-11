import { createClient } from "@/lib/supabase/client";

export interface EmpresaKpis {
  ofertasAtivas: number;
  vouchersGerados: number;
  vouchersValidados: number;
  receitaGerada: number;
}

export interface Offer {
  id: string;
  title: string;
  discount: string;
  status: "active" | "paused" | "expired";
  vouchers_generated: number;
  vouchers_used: number;
  created_at: string | null;
}

export interface VoucherPerformance {
  date: string;
  gerados: number;
  validados: number;
}

// Encontra o empresa_id real via email → empresarios → empresas
async function resolveEmpresaId(userEmail: string): Promise<string | null> {
  const supabase = createClient();

  const { data: empresario } = await supabase
    .from("empresarios")
    .select("id")
    .eq("email", userEmail)
    .maybeSingle();

  if (!empresario) return null;

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id")
    .eq("empresario_id", empresario.id)
    .maybeSingle();

  return empresa?.id ?? null;
}

export async function fetchEmpresaKpis(userEmail: string): Promise<EmpresaKpis> {
  const supabase = createClient();

  const empresaId = await resolveEmpresaId(userEmail);
  if (!empresaId) return { ofertasAtivas: 0, vouchersGerados: 0, vouchersValidados: 0, receitaGerada: 0 };

  const [
    { count: ofertasAtivas },
    { count: vouchersGerados },
    { data: vouchersUsados },
  ] = await Promise.all([
    supabase
      .from("ofertas")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("active", true),
    supabase
      .from("vouchers")
      .select("*", { count: "exact", head: true })
      .eq("company_id", empresaId),
    supabase
      .from("vouchers")
      .select("economy_value")
      .eq("company_id", empresaId)
      .eq("status", "used"),
  ]);

  const vouchersValidados = vouchersUsados?.length ?? 0;
  const receitaGerada = (vouchersUsados ?? []).reduce(
    (acc, v) => acc + (v.economy_value ?? 0),
    0
  );

  return {
    ofertasAtivas: ofertasAtivas ?? 0,
    vouchersGerados: vouchersGerados ?? 0,
    vouchersValidados,
    receitaGerada: Math.round(receitaGerada),
  };
}

export async function fetchRecentOffers(userEmail: string): Promise<Offer[]> {
  const supabase = createClient();

  const empresaId = await resolveEmpresaId(userEmail);
  if (!empresaId) return [];

  const { data: ofertas } = await supabase
    .from("ofertas")
    .select("id, title, discount_percent, type, active, created_at")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!ofertas || ofertas.length === 0) return [];

  // Conta vouchers por oferta
  const { data: allVouchers } = await supabase
    .from("vouchers")
    .select("offer_id, status")
    .eq("company_id", empresaId);

  const voucherMap: Record<string, { generated: number; used: number }> = {};
  for (const v of allVouchers ?? []) {
    if (!v.offer_id) continue;
    if (!voucherMap[v.offer_id]) voucherMap[v.offer_id] = { generated: 0, used: 0 };
    voucherMap[v.offer_id].generated++;
    if (v.status === "used") voucherMap[v.offer_id].used++;
  }

  return ofertas.map((o) => {
    const pct = o.discount_percent ? Math.round(o.discount_percent) : null;
    const discount = pct ? `${pct}%` : (o.type ?? "—");

    const status: "active" | "paused" | "expired" = o.active ? "active" : "paused";

    return {
      id: o.id,
      title: o.title,
      discount,
      status,
      vouchers_generated: voucherMap[o.id]?.generated ?? 0,
      vouchers_used: voucherMap[o.id]?.used ?? 0,
      created_at: o.created_at,
    };
  });
}

export async function fetchVoucherPerformance(userEmail: string): Promise<VoucherPerformance[]> {
  const supabase = createClient();

  const empresaId = await resolveEmpresaId(userEmail);

  // Sempre gera os últimos 7 dias para o eixo X
  const days: VoucherPerformance[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      gerados: 0,
      validados: 0,
    });
  }

  if (!empresaId) return days;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: vouchers } = await supabase
    .from("vouchers")
    .select("generated_at, validated_at, status, created_at")
    .eq("company_id", empresaId)
    .gte("created_at", sevenDaysAgo.toISOString());

  if (!vouchers || vouchers.length === 0) return days;

  // Agrupa por data (formato dd/mm)
  const geradosPorDia: Record<string, number> = {};
  const validadosPorDia: Record<string, number> = {};

  for (const v of vouchers) {
    const dataGerado = new Date(v.generated_at ?? v.created_at ?? new Date())
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    geradosPorDia[dataGerado] = (geradosPorDia[dataGerado] ?? 0) + 1;

    if (v.status === "used" && v.validated_at) {
      const dataValidado = new Date(v.validated_at)
        .toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      validadosPorDia[dataValidado] = (validadosPorDia[dataValidado] ?? 0) + 1;
    }
  }

  return days.map((d) => ({
    ...d,
    gerados: geradosPorDia[d.date] ?? 0,
    validados: validadosPorDia[d.date] ?? 0,
  }));
}
