import { redirect } from "next/navigation";
import { Wallet, TrendingDown, Trophy, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/cliente/Topbar";
import { FinanceiroChart } from "./FinanceiroChart";

export const metadata = { title: "Financeiro — ChikJov" };
export const revalidate = 0;

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default async function FinanceiroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/cliente/financeiro");

  const admin = createAdminClient();

  const { data: vouchersUsados } = await admin
    .from("vouchers")
    .select("economy_value, validated_at, company_id, offer_id")
    .eq("user_id", user.id)
    .eq("status", "used")
    .not("validated_at", "is", null)
    .order("validated_at", { ascending: false });

  const vouchers_ = vouchersUsados ?? [];

  // Total economizado
  const totalEconomia = vouchers_.reduce((acc, v) => acc + (v.economy_value ?? 0), 0);

  // Mês atual
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const economiaMes = vouchers_
    .filter((v) => v.validated_at && new Date(v.validated_at) >= monthStart)
    .reduce((acc, v) => acc + (v.economy_value ?? 0), 0);

  // Média mensal (baseada nos meses com dados)
  const mediaMensal = vouchers_.length > 0
    ? totalEconomia / Math.max(1, new Set(vouchers_.map((v) => {
        const d = new Date(v.validated_at!);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })).size)
    : 0;

  // Histórico — últimos 6 meses
  const historico: { month: string; economia: number; vouchers: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const monthLabel = d.toLocaleString("pt-BR", { month: "short" });

    const vouchersDoMes = vouchers_.filter((v) => {
      const validatedAt = v.validated_at ? new Date(v.validated_at) : null;
      return validatedAt && validatedAt >= start && validatedAt <= end;
    });

    historico.push({
      month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace(".", ""),
      economia: vouchersDoMes.reduce((acc, v) => acc + (v.economy_value ?? 0), 0),
      vouchers: vouchersDoMes.length,
    });
  }

  // Top empresa
  const empresaCount: Record<string, number> = {};
  for (const v of vouchers_) {
    if (v.company_id) empresaCount[v.company_id] = (empresaCount[v.company_id] ?? 0) + 1;
  }
  const topEmpresaId = Object.entries(empresaCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const { data: topEmpresa } = topEmpresaId
    ? await admin.from("empresas").select("id, name, logo_url").eq("id", topEmpresaId).maybeSingle()
    : { data: null };

  // Top oferta (mais usada)
  const ofertaCount: Record<string, number> = {};
  for (const v of vouchers_) {
    if (v.offer_id) ofertaCount[v.offer_id] = (ofertaCount[v.offer_id] ?? 0) + 1;
  }
  const topOfertaId = Object.entries(ofertaCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const { data: topOferta } = topOfertaId
    ? await admin.from("ofertas").select("id, title").eq("id", topOfertaId).maybeSingle()
    : { data: null };

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const kpis = [
    { label: "Total economizado", value: formatBRL(totalEconomia), icon: TrendingDown, bg: "bg-emerald-100", color: "text-emerald-700" },
    { label: "Economia este mês", value: formatBRL(economiaMes), icon: Calendar, bg: "bg-brand-100", color: "text-brand-700" },
    { label: "Média mensal", value: formatBRL(mediaMensal), icon: Wallet, bg: "bg-accent-100", color: "text-accent-700" },
    { label: "Vouchers usados", value: vouchers_.length.toString(), icon: Trophy, bg: "bg-purple-100", color: "text-purple-700" },
  ];

  return (
    <>
      <Topbar
        title="Financeiro"
        breadcrumbs={[{ label: "Financeiro" }]}
        userName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Financeiro</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Acompanhe sua economia e estatísticas com o ChikJov
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <p className="font-display text-xl font-bold text-ink">{k.value}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className="mb-4">
              <h2 className="font-display text-base font-bold text-ink">Economia por mês</h2>
              <p className="text-xs text-ink-muted">Últimos 6 meses</p>
            </div>
            <FinanceiroChart data={historico} />
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle">Empresa favorita</p>
              {topEmpresa ? (
                <div className="mt-3 flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-100 text-brand-700">
                    {topEmpresa.logo_url ? (
                      <img src={topEmpresa.logo_url} alt={topEmpresa.name} className="h-full w-full object-cover" />
                    ) : (
                      <Trophy className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-ink">{topEmpresa.name}</p>
                    <p className="text-xs text-ink-muted">
                      {empresaCount[topEmpresa.id] ?? 0}× utilizada
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">Use seus vouchers pra descobrir!</p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle">Oferta mais usada</p>
              {topOferta ? (
                <>
                  <p className="mt-2 font-bold text-ink line-clamp-2">{topOferta.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {ofertaCount[topOferta.id] ?? 0} resgates
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">Nenhuma oferta usada ainda.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
