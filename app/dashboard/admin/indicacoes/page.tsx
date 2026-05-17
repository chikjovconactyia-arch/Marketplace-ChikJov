import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import {
  deriveReferralStatus,
  getReleaseDate,
  type ReferralBizStatus,
} from "@/lib/referral-helpers";
import { IndicacoesAdminClient, type AdminReferrerRow } from "./IndicacoesAdminClient";

export const metadata = { title: "Indique & Ganhe — Admin ChikJov" };
export const revalidate = 0;

export default async function AdminIndicacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: adminProfile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const admin = createAdminClient();

  // Busca todos os referrals e todos os profiles relevantes em paralelo
  const [{ data: referralsRaw }, { data: profilesRaw }] = await Promise.all([
    admin
      .from("referrals")
      .select(
        "id, referrer_user_id, referred_user_id, level, commission_value, commission_status, subscription_status, activated_at, paid_at, created_at"
      )
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("id, full_name, subscription_status, trial_ends_at, created_at, referral_slug"),
  ]);

  const referrals_ = referralsRaw ?? [];
  const profiles_ = profilesRaw ?? [];
  const profileById = new Map(profiles_.map((p) => [p.id, p]));

  // Agrupa por referrer_user_id
  const grouped = new Map<string, typeof referrals_>();
  for (const r of referrals_) {
    if (!r.referrer_user_id) continue;
    if (!grouped.has(r.referrer_user_id)) grouped.set(r.referrer_user_id, []);
    grouped.get(r.referrer_user_id)!.push(r);
  }

  const now = new Date();

  // Constrói lista por referrer
  const rows: AdminReferrerRow[] = [];
  for (const [referrerId, refs] of grouped.entries()) {
    const refProfile = profileById.get(referrerId);

    let saldoDisponivel = 0;
    let saldoPendente = 0;
    let totalPago = 0;
    let nivel1Count = 0;
    let nivel2Count = 0;

    const items = refs.map((r) => {
      const status: ReferralBizStatus = deriveReferralStatus(r);
      const indicado = r.referred_user_id ? profileById.get(r.referred_user_id) : null;
      const releaseDate = r.activated_at ? getReleaseDate(r.activated_at) : null;
      const value = r.commission_value ?? 0;

      if (r.level === 1) nivel1Count++;
      if (r.level === 2) nivel2Count++;

      if (status === "paid") totalPago += value;
      else if (status === "available") saldoDisponivel += value;
      else if (status === "approved_pending_release") {
        if (releaseDate && releaseDate <= now) saldoDisponivel += value;
        else saldoPendente += value;
      } else if (status === "pending_payment") saldoPendente += value;

      return {
        id: r.id,
        level: r.level,
        commission_value: r.commission_value,
        status,
        release_date: releaseDate?.toISOString() ?? null,
        paid_at: r.paid_at,
        created_at: r.created_at,
        indicado_nome: indicado?.full_name ?? null,
      };
    });

    rows.push({
      referrer_id: referrerId,
      referrer_nome: refProfile?.full_name ?? "Usuário sem nome",
      referrer_slug: refProfile?.referral_slug ?? null,
      total_indicacoes: items.length,
      nivel1Count,
      nivel2Count,
      saldoDisponivel,
      saldoPendente,
      totalPago,
      items,
    });
  }

  // Ordena por total de indicações (maior primeiro)
  rows.sort((a, b) => b.total_indicacoes - a.total_indicacoes);

  // KPIs gerais
  const totalUsuariosIndicadores = rows.length;
  const totalIndicacoes = rows.reduce((s, r) => s + r.total_indicacoes, 0);
  const totalComissaoPaga = rows.reduce((s, r) => s + r.totalPago, 0);
  const totalComissaoDisponivel = rows.reduce((s, r) => s + r.saldoDisponivel, 0);
  const totalComissaoPendente = rows.reduce((s, r) => s + r.saldoPendente, 0);

  return (
    <>
      <Topbar
        title="Indique & Ganhe"
        breadcrumbs={[{ label: "Indique & Ganhe" }]}
        adminName={adminProfile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Indique &amp; Ganhe
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Visão consolidada dos usuários que indicaram e suas redes
          </p>
        </div>

        <IndicacoesAdminClient
          rows={rows}
          kpis={{
            totalUsuariosIndicadores,
            totalIndicacoes,
            totalComissaoPaga,
            totalComissaoDisponivel,
            totalComissaoPendente,
          }}
        />
      </div>
    </>
  );
}
