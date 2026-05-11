import { Globe, Star, Building2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/admin/Topbar";
import { ParceirosClient } from "./ParceirosClient";

export const metadata = { title: "Parceiros — Admin ChikJov" };
export const revalidate = 0;

export default async function ParceirosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const admin = createAdminClient();

  // Busca todas as empresas que poderiam aparecer no carrossel
  const { data: empresas } = await admin
    .from("empresas")
    .select("id, name, category, city, logo_url, active, subscription_active, is_featured, created_at")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  const empresas_ = empresas ?? [];
  const total = empresas_.length;
  const noCarrossel = empresas_.filter((e) => e.is_featured && e.active).length;
  const ativas = empresas_.filter((e) => e.active).length;
  const semLogo = empresas_.filter((e) => !e.logo_url).length;

  const kpis = [
    { label: "Total de empresas", value: total, icon: Building2, bg: "bg-brand-100", color: "text-brand-700" },
    { label: "No carrossel", value: noCarrossel, icon: Star, bg: "bg-accent-100", color: "text-accent-700" },
    { label: "Ativas", value: ativas, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
    { label: "Sem logo", value: semLogo, icon: Building2, bg: "bg-amber-100", color: "text-amber-700" },
  ];

  return (
    <>
      <Topbar
        title="Parceiros"
        breadcrumbs={[{ label: "Conteúdo" }, { label: "Parceiros" }]}
        adminName={profile?.full_name}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Parceiros</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Controle quais empresas aparecem no carrossel "Empresas que confiam no ChikJov"
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

        {/* Info banner */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Star className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div>
            <strong>Como funciona:</strong> Apenas empresas <strong>ativas</strong> e marcadas com <strong>destaque</strong> ⭐ aparecem no carrossel da landing page.
            A ordem é: empresas em destaque primeiro, depois alfabética.
          </div>
        </div>

        <ParceirosClient empresas={empresas_} />
      </div>
    </>
  );
}
