import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { Partners } from "@/components/landing/Partners";
import { CompanyCarousel } from "@/components/landing/CompanyCarousel";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Referral } from "@/components/landing/Referral";
import { Pricing } from "@/components/landing/Pricing";
import { Features } from "@/components/landing/Features";
import { BusinessCTA } from "@/components/landing/BusinessCTA";
import type { HeroSlide } from "@/components/landing/HeroCarousel";
import type { PartnerCard } from "@/components/landing/Partners";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 300; // revalida a cada 5 minutos

async function fetchCarouselCompanies() {
  try {
    const admin = createAdminClient();

    // Parte de OFERTAS ativas (não do status da empresa)
    // Assim toda empresa com oferta ativa aparece — independente de aprovação
    const { data: ofertas } = await admin
      .from("ofertas")
      .select("id, empresa_id, title, discount_percent, image_url")
      .eq("active", true)
      .not("empresa_id", "is", null)
      .order("discount_percent", { ascending: false })
      .limit(60);

    if (!ofertas || ofertas.length === 0) return null;

    // Ids únicos de empresas que têm oferta ativa
    const empresaIds = [...new Set(ofertas.map((o) => o.empresa_id as string))];

    // Busca dados das empresas
    const { data: empresas } = await admin
      .from("empresas")
      .select("id, name, category, logo_url, city, is_featured")
      .in("id", empresaIds);

    if (!empresas || empresas.length === 0) return null;

    // Ordena: destaques primeiro
    const empresasOrdenadas = [...empresas].sort((a, b) =>
      (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
    );

    // Constrói cards — usa a oferta de maior desconto de cada empresa
    const cards = empresasOrdenadas.map((emp) => {
      const empOfertas = ofertas.filter((o) => o.empresa_id === emp.id);
      const bestOferta = empOfertas[0]; // já ordenado por discount_percent desc

      return {
        id: emp.id,
        name: emp.name,
        category: emp.category ?? "Parceiro",
        image: bestOferta?.image_url ?? emp.logo_url ?? null,
        discount: bestOferta
          ? bestOferta.discount_percent
            ? `${Math.round(bestOferta.discount_percent)}% OFF`
            : bestOferta.title
          : null,
        city: emp.city ?? null,
      };
    });

    return cards.length > 0 ? cards : null;
  } catch (err) {
    console.error("[fetchCarouselCompanies]", err);
    return null;
  }
}

async function fetchPartners(): Promise<PartnerCard[]> {
  try {
    const admin = createAdminClient();

    // Primeira tentativa: ativas + marcadas no carrossel (is_featured=true)
    const { data: featured } = await admin
      .from("empresas")
      .select("id, name, logo_url, category, city, is_featured")
      .eq("active", true)
      .eq("is_featured", true)
      .order("name", { ascending: true })
      .limit(40);

    if (featured && featured.length > 0) {
      return featured.map((e) => ({
        id: e.id, name: e.name, logo_url: e.logo_url,
        category: e.category, city: e.city, is_featured: e.is_featured,
      }));
    }

    // Fallback: qualquer empresa ativa (para não ficar vazio no carrossel)
    const { data: allActive } = await admin
      .from("empresas")
      .select("id, name, logo_url, category, city, is_featured")
      .eq("active", true)
      .order("name", { ascending: true })
      .limit(20);

    return (allActive ?? []).map((e) => ({
      id: e.id, name: e.name, logo_url: e.logo_url,
      category: e.category, city: e.city, is_featured: e.is_featured,
    }));
  } catch (err) {
    console.error("[fetchPartners]", err);
    return [];
  }
}

async function fetchHeroSlides(userCity?: string | null): Promise<HeroSlide[]> {
  try {
    const admin = createAdminClient();
    let query = admin
      .from("hero_slides")
      .select("id, title, subtitle, badge, cta_text, cta_link, cta2_text, cta2_link, image_url, mobile_image_url, logo_image_url, city, active, order, created_at, updated_at, show_home, show_landpage")
      .eq("active", true)
      .eq("show_landpage", true)
      .order("order", { ascending: true });

    if (userCity) {
      query = query.or(`city.is.null,city.eq.${userCity}`);
    } else {
      query = query.is("city", null);
    }

    const { data } = await query;
    return (data ?? []) as HeroSlide[];
  } catch {
    return [];
  }
}

export default async function LandpagePage() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userCity: string | null = null;
  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("city").eq("id", user.id).maybeSingle();
    userCity = profile?.city ?? null;
  }

  const [heroSlides, realCompanies, partners] = await Promise.all([
    fetchHeroSlides(userCity),
    fetchCarouselCompanies(),
    fetchPartners(),
  ]);

  const landpageLinks = [
    { href: "#home", label: "Home" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#beneficios", label: "Vantagens" },
    { href: "#programa-indicacao", label: "Programa de indicação" },
    { href: "#empresas", label: "Para empresas" },
  ];

  return (
    <>
      <Header customLinks={landpageLinks} />
      <main id="home">
        <HeroCarousel slides={heroSlides} />
        <Partners partners={partners} />
        <HowItWorks />
        <CompanyCarousel companies={realCompanies} />
        <Benefits />
        <Referral />
        <Pricing />
        <Features />
        <BusinessCTA />
      </main>
      <Footer />
    </>
  );
}
