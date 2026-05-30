import { Grid3x3, LayoutGrid, CheckCircle2, EyeOff } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/admin/Topbar";
import { createClient } from "@/lib/supabase/server";
import { HomeCardsClient } from "./HomeCardsClient";

export const metadata = { title: "Cards da Home — Admin ChikJov" };
export const revalidate = 0;

export default async function HomeCardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const admin = createAdminClient();
  const { data: cards } = await admin
    .from("home_cards")
    .select("id, title, description, tag_value, cta_link, icon_left_name, icon_left_bg, icon_right_name, icon_right_color, active, order, created_at, updated_at")
    .order("order", { ascending: true });

  const cards_ = cards ?? [];
  const totalAtivos = cards_.filter((c) => c.active).length;
  const totalInativos = cards_.filter((c) => !c.active).length;

  const kpis = [
    { label: "Total de cards", value: cards_.length, icon: LayoutGrid, bg: "bg-brand-100", color: "text-brand-700" },
    { label: "Cards ativos", value: totalAtivos, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
    { label: "Cards inativos", value: totalInativos, icon: EyeOff, bg: "bg-amber-100", color: "text-amber-700" },
  ];

  return (
    <>
      <Topbar
        title="Card-Home"
        breadcrumbs={[{ label: "Conteúdo" }, { label: "Card-Home" }]}
        adminName={profile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Cards da Home (Recursos Exclusivos)</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Gerencie os cards exibidos na seção "Recursos Exclusivos Chik Jov" da landing page
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

        {/* Nota sobre banco de dados */}
        <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-800">
          💡 Os cards ativos aparecem automaticamente na landing page da home em ordem crescente de posição. Arraste os cards ou use a visualização de lista para ordená-los. Você pode cadastrar um link real em cada card.
        </div>

        <HomeCardsClient cards={cards_ as any} />
      </div>
    </>
  );
}
