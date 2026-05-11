import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveReferralStatus, getReleaseDate } from "@/lib/referral-helpers";
import { Topbar } from "@/components/cliente/Topbar";
import { IndicacoesClient } from "./IndicacoesClient";

export const metadata = { title: "Indique & Ganhe — ChikJov" };
export const revalidate = 0;

export default async function IndicacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/cliente/indicacoes");

  const admin = createAdminClient();

  // Profile com slug + dados Stripe (campos podem não existir ainda — safe fallback)
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, referral_slug")
    .eq("id", user.id)
    .maybeSingle();

  // Indicações onde o usuário é o referrer
  const { data: referrals } = await admin
    .from("referrals")
    .select("id, referrer_user_id, referred_user_id, level, commission_value, commission_status, subscription_status, activated_at, paid_at, created_at")
    .eq("referrer_user_id", user.id)
    .order("created_at", { ascending: false });

  const referrals_ = referrals ?? [];
  const referredIds = referrals_.map((r) => r.referred_user_id).filter(Boolean) as string[];

  // Busca nomes dos indicados
  const { data: profiles } = referredIds.length
    ? await admin
        .from("profiles")
        .select("id, full_name, subscription_status, trial_ends_at, created_at")
        .in("id", referredIds)
    : { data: [] };

  // Constrói lista enriquecida
  const items = referrals_.map((r) => {
    const status = deriveReferralStatus(r);
    const indicado = profiles?.find((p) => p.id === r.referred_user_id);
    const releaseDate = r.activated_at ? getReleaseDate(r.activated_at) : null;
    return {
      id: r.id,
      level: r.level,
      commission_value: r.commission_value,
      commission_status: r.commission_status,
      activated_at: r.activated_at,
      paid_at: r.paid_at,
      created_at: r.created_at,
      release_date: releaseDate?.toISOString() ?? null,
      indicado_nome: indicado?.full_name ?? null,
      indicado_subscription: indicado?.subscription_status ?? null,
      indicado_trial_ends_at: indicado?.trial_ends_at ?? null,
      status,
    };
  });

  // Calcula saldos
  const now = new Date();
  let saldoDisponivel = 0;
  let saldoPendente = 0;
  let totalPago = 0;
  let nivel1Count = 0;
  let nivel2Count = 0;

  for (const item of items) {
    const value = item.commission_value ?? 0;
    if (item.level === 1) nivel1Count++;
    if (item.level === 2) nivel2Count++;

    if (item.status === "paid") {
      totalPago += value;
    } else if (item.status === "available") {
      saldoDisponivel += value;
    } else if (item.status === "approved_pending_release") {
      // Se a release_date já passou mas status não foi atualizado por job → considera available
      if (item.release_date && new Date(item.release_date) <= now) {
        saldoDisponivel += value;
      } else {
        saldoPendente += value;
      }
    } else if (item.status === "pending_payment") {
      saldoPendente += value;
    }
  }

  return (
    <>
      <Topbar
        title="Indique & Ganhe"
        breadcrumbs={[{ label: "Indique & Ganhe" }]}
        userName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <IndicacoesClient
          userName={profile?.full_name ?? user.email ?? "Você"}
          slug={profile?.referral_slug ?? null}
          items={items}
          kpis={{
            saldoDisponivel,
            saldoPendente,
            totalPago,
            nivel1Count,
            nivel2Count,
            totalIndicados: items.length,
          }}
        />
      </div>
    </>
  );
}
