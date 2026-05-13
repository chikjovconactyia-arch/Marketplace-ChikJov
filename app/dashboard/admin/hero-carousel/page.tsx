import { Layers, ImageIcon, CheckCircle2, EyeOff } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/admin/Topbar";
import { createClient } from "@/lib/supabase/server";
import { HeroSlidesClient } from "./HeroSlidesClient";

export const metadata = { title: "Hero Carousel — Admin ChikJov" };
export const revalidate = 0;

export default async function HeroCarouselPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const admin = createAdminClient();
  const { data: slides } = await admin
    .from("hero_slides")
    .select("id, title, subtitle, badge, cta_text, cta_link, image_url, mobile_image_url, active, order, created_at, updated_at")
    .order("order", { ascending: true });

  const slides_ = slides ?? [];
  const totalAtivos = slides_.filter((s) => s.active).length;
  const totalInativos = slides_.filter((s) => !s.active).length;

  const kpis = [
    { label: "Total de slides", value: slides_.length, icon: Layers, bg: "bg-brand-100", color: "text-brand-700" },
    { label: "Slides ativos", value: totalAtivos, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
    { label: "Slides inativos", value: totalInativos, icon: EyeOff, bg: "bg-amber-100", color: "text-amber-700" },
  ];

  return (
    <>
      <Topbar
        title="Hero Carousel"
        breadcrumbs={[{ label: "Conteúdo" }, { label: "Hero Carousel" }]}
        adminName={profile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Hero Carousel</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Gerencie os slides do banner principal da landing page
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
          💡 Os slides ativos aparecem automaticamente na landing page em ordem crescente de posição. Arraste ou use as setas ↑↓ para reordenar. Imagens recomendadas: <strong>1600×750px</strong>.
        </div>

        <HeroSlidesClient slides={slides_ as any} />
      </div>
    </>
  );
}
