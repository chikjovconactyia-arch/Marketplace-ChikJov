import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { Partners } from "@/components/landing/Partners";
import type { HeroSlide } from "@/components/landing/HeroCarousel";
import type { PartnerCard } from "@/components/landing/Partners";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceClient, type EmpresaCard } from "./MarketplaceClient";

export const metadata = {
  title: "Marketplace — ChikJov",
  description: "Explore todas as empresas e ofertas exclusivas do clube ChikJov.",
};

export const revalidate = 300;

async function fetchHeroSlides(userCity?: string | null): Promise<HeroSlide[]> {
  try {
    const admin = createAdminClient();
    let query = admin
      .from("hero_slides")
      .select("id, title, subtitle, badge, cta_text, cta_link, cta2_text, cta2_link, image_url, mobile_image_url, city, active, order, created_at, updated_at")
      .eq("active", true)
      .order("order", { ascending: true });

    if (userCity) {
      query = query.or(`city.is.null,city.eq.${userCity}`);
    } else {
      query = query.is("city", null);
    }

    const { data } = await query;
    return (data ?? []) as HeroSlide[];
  } catch { return []; }
}

async function fetchPartners(): Promise<PartnerCard[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("empresas")
      .select("id, name, logo_url, category, city, is_featured")
      .eq("active", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true })
      .limit(40);
    return (data ?? []).map((e) => ({
      id: e.id, name: e.name, logo_url: e.logo_url,
      category: e.category, city: e.city, is_featured: e.is_featured,
    }));
  } catch { return []; }
}

async function fetchEmpresasComOfertas(): Promise<EmpresaCard[]> {
  const admin = createAdminClient();

  // Empresas ativas
  const { data: empresas, error: empresasError } = await admin
    .from("empresas")
    .select("id, name, logo_url, category, city, description, is_featured")
    .eq("active", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .limit(60);

  if (empresasError) {
    console.error("Erro ao buscar empresas:", empresasError);
  }

  if (!empresas || empresas.length === 0) return [];

  // Busca ofertas ativas dessas empresas
  const empresaIds = empresas.map((e) => e.id);
  const { data: ofertas } = await admin
    .from("ofertas")
    .select("id, empresa_id, title, description, discount_percent, type, image_url")
    .eq("active", true)
    .in("empresa_id", empresaIds)
    .order("discount_percent", { ascending: false });

  const ofertas_ = ofertas ?? [];

  return empresas.map((emp) => {
    const empOfertas = ofertas_.filter((o) => o.empresa_id === emp.id);
    const best = empOfertas[0];
    return {
      id: emp.id,
      slug: null, // removido pois a coluna slug não existe na base de dados
      name: emp.name,
      category: emp.category ?? "Parceiro",
      city: emp.city ?? null,
      logo_url: emp.logo_url ?? null,
      description: emp.description ?? null,
      is_featured: !!emp.is_featured,
      total_ofertas: empOfertas.length,
      oferta_titulo: best?.title ?? null,
      oferta_descricao: best?.description ?? null,
      desconto_pct: best?.discount_percent ?? null,
    };
  });
}

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userCity: string | null = null;
  let voucherStats: { count: number; totalSaved: number } | undefined = undefined;

  if (user) {
    voucherStats = { count: 0, totalSaved: 0 };
    const admin = createAdminClient();
    const [profileRes, vouchersRes] = await Promise.all([
      admin.from("profiles").select("city").eq("id", user.id).maybeSingle(),
      admin.from("vouchers").select("economy_value").eq("user_id", user.id)
    ]);

    userCity = profileRes.data?.city ?? null;
    
    if (vouchersRes.data) {
      voucherStats.count = vouchersRes.data.length;
      voucherStats.totalSaved = vouchersRes.data.reduce((sum, v) => sum + Number(v.economy_value || 0), 0);
    }
  }

  const [heroSlides, partners, empresas] = await Promise.all([
    fetchHeroSlides(userCity),
    fetchPartners(),
    fetchEmpresasComOfertas(),
  ]);

  // Listas únicas para filtros
  const cidades = [...new Set(empresas.map((e) => e.city).filter(Boolean) as string[])].sort();
  const categorias = [...new Set(empresas.map((e) => e.category).filter(Boolean))].sort();

  return (
    <>
      <Header isMarketplace voucherStats={voucherStats} />
      <main>
        <HeroCarousel slides={heroSlides} />
        <Partners partners={partners} />
        <MarketplaceClient
          empresas={empresas}
          cidades={cidades}
          categorias={categorias}
          initialCity={userCity ?? ""}
        />
      </main>
      <Footer />
    </>
  );
}
