import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Ticket, TrendingDown, Share2, Users, ArrowRight,
  Compass, Wallet, Sparkles, Building2
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/cliente/Topbar";
import { deriveReferralStatus } from "@/lib/referral-helpers";
import { SubscriptionBanner } from "./SubscriptionBanner";

export const metadata = { title: "Dashboard Cliente — ChikJov" };
export const revalidate = 0;

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default async function DashboardClientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/cliente");

  const admin = createAdminClient();

  // Profile
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, subscription_status, trial_ends_at, city")
    .eq("id", user.id)
    .maybeSingle();

  // Vouchers do usuário
  const { data: vouchers } = await admin
    .from("vouchers")
    .select("id, code, status, economy_value, generated_at, validated_at, expires_at, company_id, offer_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const vouchers_ = vouchers ?? [];
  const now = new Date();

  // Atualiza expirados localmente
  const vouchersWithStatus = vouchers_.map((v) => {
    if (v.status === "active" && v.expires_at && new Date(v.expires_at) < now) {
      return { ...v, status: "expired" };
    }
    return v;
  });

  const totalGerados = vouchersWithStatus.length;
  const totalUsados = vouchersWithStatus.filter((v) => v.status === "used").length;
  const economiaTotal = vouchersWithStatus
    .filter((v) => v.status === "used")
    .reduce((acc, v) => acc + (v.economy_value ?? 0), 0);

  // Referrals do usuário
  const { data: referrals } = await admin
    .from("referrals")
    .select("id, level, commission_value, commission_status, subscription_status, activated_at, paid_at, created_at, referred_user_id")
    .eq("referrer_user_id", user.id);

  const refs_ = referrals ?? [];
  let saldoIndique = 0;
  let indicacoesAtivas = 0;
  for (const r of refs_) {
    const status = deriveReferralStatus(r);
    if (status === "available" || status === "approved_pending_release") {
      saldoIndique += r.commission_value ?? 0;
    }
    if (status !== "cancelled" && status !== "pending_signup") indicacoesAtivas++;
  }

  // Vouchers ativos para o widget de "ativos"
  const vouchersAtivos = vouchersWithStatus
    .filter((v) => v.status === "active")
    .slice(0, 3);

  // Busca dados das empresas dos vouchers ativos
  const empresaIds = [...new Set(vouchersAtivos.map((v) => v.company_id).filter(Boolean) as string[])];
  const ofertaIds = [...new Set(vouchersAtivos.map((v) => v.offer_id).filter(Boolean) as string[])];

  const [{ data: empresas }, { data: ofertas }, { data: empresasSugeridas }] = await Promise.all([
    empresaIds.length
      ? admin.from("empresas").select("id, name, logo_url").in("id", empresaIds)
      : { data: [] },
    ofertaIds.length
      ? admin.from("ofertas").select("id, title, discount_percent").in("id", ofertaIds)
      : { data: [] },
    admin.from("empresas").select("id, name, category, logo_url, city").eq("active", true).limit(4),
  ]);

  const vouchersAtivosEnriquecidos = vouchersAtivos.map((v) => {
    const emp = empresas?.find((e) => e.id === v.company_id);
    const off = ofertas?.find((o) => o.id === v.offer_id);
    return {
      id: v.id,
      code: v.code,
      empresa_nome: emp?.name ?? "—",
      logo_url: emp?.logo_url ?? null,
      oferta_titulo: off?.title ?? "—",
      desconto: off?.discount_percent ? `${Math.round(off.discount_percent)}% OFF` : null,
    };
  });

  const firstName = (profile?.full_name ?? user.email ?? "").split(" ")[0];

  // Calcula dias restantes do trial
  let trialDays: number | null = null;
  if (profile?.trial_ends_at) {
    const ms = new Date(profile.trial_ends_at).getTime() - now.getTime();
    trialDays = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const kpis = [
    {
      label: "Total economizado",
      value: formatBRL(economiaTotal),
      icon: TrendingDown, bg: "bg-emerald-100", color: "text-emerald-700", isMoney: true,
    },
    {
      label: "Vouchers gerados",
      value: totalGerados.toString(),
      icon: Ticket, bg: "bg-brand-100", color: "text-brand-700",
    },
    {
      label: "Vouchers utilizados",
      value: totalUsados.toString(),
      icon: Sparkles, bg: "bg-accent-100", color: "text-accent-700",
    },
    {
      label: "Saldo Indique & Ganhe",
      value: formatBRL(saldoIndique),
      icon: Wallet, bg: "bg-blue-100", color: "text-blue-700", isMoney: true,
    },
    {
      label: "Indicações ativas",
      value: indicacoesAtivas.toString(),
      icon: Users, bg: "bg-purple-100", color: "text-purple-700",
    },
  ];

  return (
    <>
      <Topbar title="Visão Geral" userName={profile?.full_name ?? user.email} />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Olá, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Bem-vindo(a) de volta ao ChikJov
            {profile?.city ? ` em ${profile.city}` : ""}.
          </p>
        </div>

        {/* Subscription banners */}
        <SubscriptionBanner
          status={profile?.subscription_status ?? null}
          trialDays={trialDays}
        />

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] transition-all hover:-translate-y-0.5">
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <p className={`font-display font-bold text-ink ${k.isMoney ? "text-xl" : "text-3xl"}`}>
                {k.value}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Vouchers ativos */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-ink">Seus vouchers ativos</h2>
                <p className="text-xs text-ink-muted">Pronto pra usar nas empresas parceiras</p>
              </div>
              <Link
                href="/dashboard/cliente/meus-vouchers"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {vouchersAtivosEnriquecidos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50">
                  <Ticket className="h-6 w-6 text-brand-300" />
                </div>
                <p className="text-sm font-bold text-ink">Nenhum voucher ativo</p>
                <p className="mt-1 text-xs text-ink-muted">Explore as ofertas e gere seu primeiro voucher!</p>
                <Link
                  href="/dashboard/cliente/explorar"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 text-xs font-bold text-white shadow-cta hover:bg-accent-600"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Explorar empresas
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {vouchersAtivosEnriquecidos.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center gap-3 rounded-xl border border-[#F1ECF8] p-3 transition-colors hover:bg-surface-soft"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-100 text-brand-700">
                      {v.logo_url ? (
                        <img src={v.logo_url} alt={v.empresa_nome} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{v.empresa_nome}</p>
                      <p className="truncate text-xs text-ink-muted">{v.oferta_titulo}</p>
                    </div>
                    {v.desconto && (
                      <span className="rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold text-white">
                        {v.desconto}
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-ink-muted">{v.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Indique & Ganhe quick card */}
          <div className="rounded-2xl bg-brand-gradient p-6 text-white shadow-card relative overflow-hidden">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-500/30 blur-2xl" />
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-md">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">Indique & Ganhe</h3>
              <p className="mt-1 text-sm opacity-90">
                Ganhe R$ 20 por cada amigo que assinar via seu link!
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-xs opacity-80">Saldo:</span>
                <span className="font-display text-2xl font-bold">{formatBRL(saldoIndique)}</span>
              </div>
              <Link
                href="/dashboard/cliente/indicacoes"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-bold text-brand-700 transition-transform hover:scale-[1.02]"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar link
              </Link>
            </div>
          </div>
        </div>

        {/* Empresas sugeridas */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-ink">Empresas para você</h2>
              <p className="text-xs text-ink-muted">Descubra parceiros próximos com ofertas exclusivas</p>
            </div>
            <Link
              href="/dashboard/cliente/explorar"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
            >
              Ver mais <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {(empresasSugeridas ?? []).length === 0 ? (
            <p className="text-sm text-ink-muted">Em breve novas empresas serão adicionadas.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(empresasSugeridas ?? []).map((emp) => (
                <Link
                  key={emp.id}
                  href={`/empresa/${emp.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-[#F1ECF8] p-3 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:bg-surface-soft"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-100 text-brand-700">
                    {emp.logo_url ? (
                      <img src={emp.logo_url} alt={emp.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{emp.name}</p>
                    <p className="truncate text-xs text-ink-muted">{emp.category ?? "Parceiro"}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-subtle transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
