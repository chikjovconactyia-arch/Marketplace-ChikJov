import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { deriveReferralStatus, getReleaseDate } from "@/lib/referral-helpers";
import { FinanceiroClient, type AssinaturaRow, type ComissaoRow, type FinanceiroMetrics } from "./FinanceiroClient";

export const metadata = { title: "Financeiro — Admin ChikJov" };
export const revalidate = 0;

const PLAN_PRICE = 39.9;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthsBetween(from: Date, to: Date): number {
  return Math.max(
    0,
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  );
}

export default async function AdminFinanceiroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: adminProfile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const admin = createAdminClient();

  const [
    { data: assinaturasRaw },
    { data: profilesRaw },
    { data: referralsRaw },
  ] = await Promise.all([
    admin
      .from("assinaturas")
      .select(
        "id, cliente_id, plano, status, data_inicio, data_fim, stripe_customer_id, stripe_subscription_id, created_at, updated_at"
      )
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select(
        "id, full_name, subscription_status, subscription_plan, trial_ends_at, created_at"
      ),
    admin
      .from("referrals")
      .select(
        "id, referrer_user_id, referred_user_id, level, commission_value, commission_status, subscription_status, activated_at, paid_at, created_at"
      )
      .order("created_at", { ascending: false }),
  ]);

  const assinaturas_ = assinaturasRaw ?? [];
  const profiles_ = profilesRaw ?? [];
  const referrals_ = referralsRaw ?? [];

  const profileById = new Map(profiles_.map((p) => [p.id, p]));

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // ─── Classificação de assinaturas ─────────────────────────────────────────────
  const assinaturas: AssinaturaRow[] = assinaturas_.map((a) => {
    const profile = profileById.get(a.cliente_id);
    const trialEndsAt = profile?.trial_ends_at ?? null;
    const trialAtivo = trialEndsAt ? new Date(trialEndsAt) > now : false;

    let categoria: AssinaturaRow["categoria"] = "inativo";
    if (a.status === "ativo") {
      categoria = trialAtivo ? "trial" : "pagante";
    } else if (a.status === "pendente") categoria = "pendente";
    else if (a.status === "cancelado") categoria = "cancelado";

    const inicio = a.data_inicio ? new Date(a.data_inicio) : null;
    const fim = a.data_fim ? new Date(a.data_fim) : null;

    // Cálculo aproximado de meses faturados
    // Trial = 1 mês gratuito; só conta a partir do 2º mês
    let mesesFaturados = 0;
    if (inicio) {
      const ate = fim && fim < now ? fim : now;
      const mesesTotal = monthsBetween(inicio, ate);
      mesesFaturados = Math.max(0, mesesTotal - 1); // primeiro mês = trial
    }
    const totalFaturado = mesesFaturados * PLAN_PRICE;

    return {
      id: a.id,
      cliente_id: a.cliente_id,
      cliente_nome: profile?.full_name ?? "Sem nome",
      plano: a.plano,
      status_db: a.status,
      categoria,
      data_inicio: a.data_inicio,
      data_fim: a.data_fim,
      trial_ends_at: trialEndsAt,
      stripe_customer_id: a.stripe_customer_id,
      meses_faturados: mesesFaturados,
      total_faturado: totalFaturado,
      created_at: a.created_at,
    };
  });

  // ─── Métricas de receita ─────────────────────────────────────────────────────
  const pagantes = assinaturas.filter((a) => a.categoria === "pagante").length;
  const emTrial = assinaturas.filter((a) => a.categoria === "trial").length;
  const pendentes = assinaturas.filter((a) => a.categoria === "pendente").length;
  const cancelados = assinaturas.filter((a) => a.categoria === "cancelado").length;
  const totalAssinaturas = assinaturas.length;

  const mrr = pagantes * PLAN_PRICE;
  const mrrPotencial = (pagantes + emTrial) * PLAN_PRICE;
  const totalFaturado = assinaturas.reduce((s, a) => s + a.total_faturado, 0);

  // Receita do mês atual = soma de assinaturas pagantes que tiveram cobrança neste mês
  const faturadoMesAtual = assinaturas
    .filter((a) => {
      if (a.categoria !== "pagante" || !a.data_inicio) return false;
      const fim = a.data_fim ? new Date(a.data_fim) : now;
      // Considera ativo no mês se data_inicio < fim do mês E data_fim > início do mês
      return new Date(a.data_inicio) <= now && fim >= inicioMes;
    })
    .length * PLAN_PRICE;

  // Cancelamentos do mês
  const canceladosMesAtual = assinaturas.filter(
    (a) =>
      a.categoria === "cancelado" &&
      a.data_fim &&
      new Date(a.data_fim) >= inicioMes
  ).length;

  const canceladosMesAnterior = assinaturas.filter((a) => {
    if (a.categoria !== "cancelado" || !a.data_fim) return false;
    const df = new Date(a.data_fim);
    return df >= inicioMesAnterior && df < inicioMes;
  }).length;

  // Novos clientes do mês (data_inicio neste mês)
  const novosClientesMes = assinaturas.filter(
    (a) => a.data_inicio && new Date(a.data_inicio) >= inicioMes
  ).length;

  // Conversão de trial: aprovados / (aprovados + cancelados durante trial)
  const conversionTrial = (() => {
    const aprovados = assinaturas.filter((a) => a.categoria === "pagante").length;
    const total = aprovados + cancelados;
    return total > 0 ? (aprovados / total) * 100 : 0;
  })();

  // Churn rate (mês atual)
  const churnRate = pagantes + canceladosMesAtual > 0
    ? (canceladosMesAtual / (pagantes + canceladosMesAtual)) * 100
    : 0;

  // ─── Comissões ─────────────────────────────────────────────────────────────────
  const comissoes: ComissaoRow[] = referrals_.map((r) => {
    const status = deriveReferralStatus(r);
    const releaseDate = r.activated_at ? getReleaseDate(r.activated_at) : null;
    const referrerProfile = profileById.get(r.referrer_user_id);
    const referredProfile = r.referred_user_id
      ? profileById.get(r.referred_user_id)
      : null;

    return {
      id: r.id,
      referrer_id: r.referrer_user_id,
      referrer_nome: referrerProfile?.full_name ?? "Sem nome",
      indicado_nome: referredProfile?.full_name ?? null,
      level: r.level,
      commission_value: r.commission_value ?? 0,
      status,
      release_date: releaseDate?.toISOString() ?? null,
      paid_at: r.paid_at,
      activated_at: r.activated_at,
      created_at: r.created_at,
    };
  });

  let comissoesDisponivel = 0;
  let comissoesPendente = 0;
  let comissoesPagas = 0;
  let comissoesCanceladas = 0;
  for (const c of comissoes) {
    const v = c.commission_value;
    if (c.status === "paid") comissoesPagas += v;
    else if (c.status === "available") comissoesDisponivel += v;
    else if (c.status === "approved_pending_release") {
      if (c.release_date && new Date(c.release_date) <= now) comissoesDisponivel += v;
      else comissoesPendente += v;
    } else if (c.status === "pending_payment") comissoesPendente += v;
    else if (c.status === "cancelled") comissoesCanceladas += v;
  }

  // Comissões pagas neste mês
  const comissoesPagasMes = comissoes
    .filter((c) => c.paid_at && new Date(c.paid_at) >= inicioMes)
    .reduce((s, c) => s + c.commission_value, 0);

  // ─── Saldo / receita líquida ─────────────────────────────────────────────────
  const receitaLiquidaMRR = mrr - (comissoesDisponivel + comissoesPendente) / 12; // amortização
  const saldoMes = faturadoMesAtual - comissoesPagasMes;

  // ARPU e LTV
  const arpu = pagantes > 0 ? mrr / pagantes : 0;
  const ltvEstimado = arpu * 12; // estimativa: 12 meses de vida média

  const metrics: FinanceiroMetrics = {
    // Receita
    mrr,
    mrrPotencial,
    faturadoMesAtual,
    totalFaturado,
    arpu,
    ltvEstimado,
    receitaLiquidaMRR,
    saldoMes,
    // Clientes
    pagantes,
    emTrial,
    pendentes,
    cancelados,
    totalAssinaturas,
    novosClientesMes,
    canceladosMesAtual,
    canceladosMesAnterior,
    conversionTrial,
    churnRate,
    // Comissões
    comissoesDisponivel,
    comissoesPendente,
    comissoesPagas,
    comissoesPagasMes,
    comissoesCanceladas,
    totalComissoes: comissoes.length,
  };

  return (
    <>
      <Topbar
        title="Financeiro"
        breadcrumbs={[{ label: "Financeiro" }]}
        adminName={adminProfile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Financeiro
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gestão completa de receitas, comissões e fluxo de caixa
          </p>
        </div>

        <FinanceiroClient
          metrics={metrics}
          assinaturas={assinaturas}
          comissoes={comissoes}
        />
      </div>
    </>
  );
}
