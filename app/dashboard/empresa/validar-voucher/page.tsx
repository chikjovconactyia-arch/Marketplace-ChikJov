import { redirect } from "next/navigation";
import { ScanLine, Ticket, CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/empresa/Topbar";
import { VoucherValidator } from "@/components/voucher/VoucherValidator";

export const metadata = { title: "Validar Voucher — ChikJov" };
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function ValidarVoucherPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/empresa/validar-voucher");

  const sp = await searchParams;
  const initialCode = sp.code?.toUpperCase() ?? "";

  const admin = createAdminClient();

  // Encontra empresa do usuário
  const { data: empresario } = await admin
    .from("empresarios")
    .select("id")
    .eq("email", user.email ?? "")
    .maybeSingle();
  const { data: empresa } = empresario
    ? await admin.from("empresas").select("id, name").eq("empresario_id", empresario.id).maybeSingle()
    : { data: null };

  // Histórico de vouchers da empresa (ativos + usados recentes)
  const [{ data: ativosCount }, { data: usadosCount }, { data: vouchersHist }] = await Promise.all([
    empresa
      ? admin.from("vouchers").select("id", { count: "exact", head: true }).eq("company_id", empresa.id).eq("status", "active")
      : Promise.resolve({ data: null, count: 0 }) as any,
    empresa
      ? admin.from("vouchers").select("id", { count: "exact", head: true }).eq("company_id", empresa.id).eq("status", "used")
      : Promise.resolve({ data: null, count: 0 }) as any,
    empresa
      ? admin
          .from("vouchers")
          .select("id, code, status, validated_at, generated_at, user_id, offer_id, economy_value")
          .eq("company_id", empresa.id)
          .order("validated_at", { ascending: false, nullsFirst: false })
          .limit(8)
      : { data: [] },
  ]);

  const totalAtivos = (ativosCount as any)?.count ?? 0;
  const totalUsados = (usadosCount as any)?.count ?? 0;

  // Enriquece histórico com nomes
  const userIds = (vouchersHist ?? []).map((v) => v.user_id).filter(Boolean) as string[];
  const ofertaIds = (vouchersHist ?? []).map((v) => v.offer_id).filter(Boolean) as string[];

  const [{ data: profilesData }, { data: ofertasData }] = await Promise.all([
    userIds.length
      ? admin.from("profiles").select("id, full_name").in("id", userIds)
      : { data: [] },
    ofertaIds.length
      ? admin.from("ofertas").select("id, title").in("id", ofertaIds)
      : { data: [] },
  ]);

  const historico = (vouchersHist ?? []).map((v) => ({
    ...v,
    cliente_nome: profilesData?.find((p) => p.id === v.user_id)?.full_name ?? "—",
    oferta_titulo: ofertasData?.find((o) => o.id === v.offer_id)?.title ?? "—",
  }));

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const kpis = [
    { label: "Vouchers ativos", value: totalAtivos, icon: Clock, bg: "bg-amber-100", color: "text-amber-700" },
    { label: "Já validados", value: totalUsados, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
    { label: "Total recebido", value: totalAtivos + totalUsados, icon: Ticket, bg: "bg-brand-100", color: "text-brand-700" },
  ];

  return (
    <>
      <Topbar
        title="Validar Voucher"
        breadcrumbs={[{ label: "Validar Voucher" }]}
        empresaName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <ScanLine className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Validar Voucher</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Escaneie o QR Code do cliente ou digite o código do voucher
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <p className="font-display text-3xl font-bold text-ink">{k.value}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Validador */}
          <div className="lg:col-span-2">
            <VoucherValidator initialCode={initialCode} />
          </div>

          {/* Histórico */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <h2 className="mb-4 font-display text-base font-bold text-ink">Histórico recente</h2>
            {historico.length === 0 ? (
              <p className="text-sm text-ink-muted">Nenhum voucher na sua empresa ainda.</p>
            ) : (
              <ul className="space-y-3">
                {historico.map((v) => (
                  <li key={v.id} className="flex items-start gap-3 rounded-xl border border-[#F1ECF8] p-3 transition-colors hover:bg-surface-soft">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      v.status === "used" ? "bg-emerald-100 text-emerald-700"
                      : v.status === "expired" ? "bg-amber-100 text-amber-700"
                      : "bg-brand-100 text-brand-700"
                    }`}>
                      <Ticket className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-bold text-ink">{v.code}</p>
                      <p className="truncate text-xs text-ink-muted">{v.cliente_nome} · {v.oferta_titulo}</p>
                      <p className="mt-0.5 text-[10px] text-ink-subtle">
                        {v.status === "used" && v.validated_at
                          ? `Validado em ${new Date(v.validated_at).toLocaleDateString("pt-BR")}`
                          : v.status === "active" ? "Aguardando validação"
                          : v.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
