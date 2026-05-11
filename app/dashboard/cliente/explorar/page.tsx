import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/cliente/Topbar";
import { ExplorarClient } from "./ExplorarClient";

export const metadata = { title: "Explorar Empresas — ChikJov" };
export const revalidate = 300;

export default async function ExplorarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/cliente/explorar");

  const admin = createAdminClient();

  // Empresas com ofertas ativas (parte das ofertas pra incluir empresas pendentes mas com promo)
  const { data: ofertas } = await admin
    .from("ofertas")
    .select("id, empresa_id, title, discount_percent, image_url")
    .eq("active", true)
    .not("empresa_id", "is", null)
    .order("discount_percent", { ascending: false })
    .limit(100);

  const empresaIds = [...new Set((ofertas ?? []).map((o) => o.empresa_id as string))];

  const { data: empresas } = empresaIds.length
    ? await admin
        .from("empresas")
        .select("id, name, category, city, description, logo_url, is_featured")
        .in("id", empresaIds)
    : { data: [] };

  const empresasEnriquecidas = (empresas ?? []).map((emp) => {
    const empOfertas = (ofertas ?? []).filter((o) => o.empresa_id === emp.id);
    const best = empOfertas.sort((a, b) =>
      (b.discount_percent ?? 0) - (a.discount_percent ?? 0)
    )[0];
    return {
      id: emp.id,
      name: emp.name,
      category: emp.category ?? null,
      city: emp.city ?? null,
      description: emp.description ?? null,
      logo_url: emp.logo_url ?? null,
      is_featured: emp.is_featured ?? false,
      total_ofertas: empOfertas.length,
      melhor_desconto: best?.discount_percent ?? null,
      melhor_imagem: best?.image_url ?? null,
    };
  });

  // Lista de cidades e categorias únicas pra filtros
  const cidades = [...new Set(empresasEnriquecidas.map((e) => e.city).filter(Boolean) as string[])].sort();
  const categorias = [...new Set(empresasEnriquecidas.map((e) => e.category).filter(Boolean) as string[])].sort();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <Topbar
        title="Explorar"
        breadcrumbs={[{ label: "Explorar empresas" }]}
        userName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Explorar Empresas</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              {empresasEnriquecidas.length} {empresasEnriquecidas.length === 1 ? "empresa" : "empresas"} parceira{empresasEnriquecidas.length !== 1 ? "s" : ""} com ofertas ativas
            </p>
          </div>
        </div>

        <ExplorarClient
          empresas={empresasEnriquecidas}
          cidades={cidades}
          categorias={categorias}
        />
      </div>
    </>
  );
}
