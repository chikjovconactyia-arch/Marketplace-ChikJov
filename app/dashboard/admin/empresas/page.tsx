import {
  UserCheck, TrendingUp, RefreshCw, CheckCircle2,
  Building2, Star, Package
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/admin/Topbar";
import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "./LeadsTable";
import { EmpresasTable } from "./EmpresasTable";
import { TabsClient } from "./TabsClient";

export const metadata = { title: "Empresas — Admin ChikJov" };
export const revalidate = 0;

export default async function AdminEmpresasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const admin = createAdminClient();

  // Fetch em paralelo: leads + empresas + empresarios + ofertas + vouchers
  const [
    { data: leads },
    { data: empresasRaw },
    { data: empresarios },
    { data: ofertas },
    { data: vouchers },
  ] = await Promise.all([
    admin.from("leads_empresas").select("*").order("created_at", { ascending: false }),
    admin.from("empresas").select("*").order("created_at", { ascending: false }),
    admin.from("empresarios").select("id, full_name, email"),
    admin.from("ofertas").select("empresa_id"),
    admin.from("vouchers").select("company_id"),
  ]);

  const leads_ = leads ?? [];
  const empresas_ = empresasRaw ?? [];
  const empresarios_ = empresarios ?? [];
  const ofertas_ = ofertas ?? [];
  const vouchers_ = vouchers ?? [];

  // Enriquece empresas com dados do empresário + contagens
  const empresasEnriquecidas = empresas_.map((emp) => {
    const emp_ = empresarios_.find((e) => e.id === emp.empresario_id);
    return {
      ...emp,
      empresario_nome: emp_?.full_name ?? null,
      empresario_email: emp_?.email ?? null,
      total_ofertas: ofertas_.filter((o) => o.empresa_id === emp.id).length,
      total_vouchers: vouchers_.filter((v) => v.company_id === emp.id).length,
    };
  });

  // KPIs — Leads
  const totalLeads = leads_.length;
  const novosLeads = leads_.filter((l) => l.status === "novo" || l.status === null).length;
  const emContato = leads_.filter((l) => l.status === "em_contato").length;
  const convertidos = leads_.filter((l) => l.status === "convertido").length;

  // KPIs — Empresas cadastradas
  const totalEmpresas = empresas_.length;
  const ativas = empresas_.filter((e) => e.active && e.subscription_active).length;
  const pendentes = empresas_.filter((e) => !e.active).length;
  const emDestaque = empresas_.filter((e) => e.is_featured).length;

  return (
    <>
      <Topbar
        title="Empresas"
        breadcrumbs={[{ label: "Empresas" }]}
        adminName={profile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Empresas</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gerencie leads e empresas cadastradas no ChikJov
          </p>
        </div>

        <TabsClient
          leadsContent={
            <>
              {/* KPIs Leads */}
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Total de leads", value: totalLeads, icon: UserCheck, bg: "bg-brand-100", color: "text-brand-700" },
                  { label: "Novos leads", value: novosLeads, icon: TrendingUp, bg: "bg-blue-100", color: "text-blue-700" },
                  { label: "Em contato", value: emContato, icon: RefreshCw, bg: "bg-amber-100", color: "text-amber-700" },
                  { label: "Convertidos", value: convertidos, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
                ].map((c) => (
                  <div key={c.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
                    <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${c.bg}`}>
                      <c.icon className={`h-5 w-5 ${c.color}`} />
                    </div>
                    <p className="font-display text-3xl font-bold text-ink">{c.value}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{c.label}</p>
                  </div>
                ))}
              </div>
              <LeadsTable leads={leads_} />
            </>
          }
          empresasContent={
            <>
              {/* KPIs Empresas */}
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Total cadastradas", value: totalEmpresas, icon: Building2, bg: "bg-brand-100", color: "text-brand-700" },
                  { label: "Ativas com plano", value: ativas, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
                  { label: "Pendentes aprovação", value: pendentes, icon: RefreshCw, bg: "bg-amber-100", color: "text-amber-700" },
                  { label: "Em destaque", value: emDestaque, icon: Star, bg: "bg-accent-100", color: "text-accent-700" },
                ].map((c) => (
                  <div key={c.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
                    <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${c.bg}`}>
                      <c.icon className={`h-5 w-5 ${c.color}`} />
                    </div>
                    <p className="font-display text-3xl font-bold text-ink">{c.value}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{c.label}</p>
                  </div>
                ))}
              </div>
              <EmpresasTable empresas={empresasEnriquecidas} />
            </>
          }
          leadsCount={totalLeads}
          empresasCount={totalEmpresas}
        />
      </div>
    </>
  );
}
