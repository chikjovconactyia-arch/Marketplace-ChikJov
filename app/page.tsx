import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { ServiceCards } from "@/components/landing/ServiceCards";
import type { HeroSlide } from "@/components/landing/HeroCarousel";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 300; // revalida a cada 5 minutos

async function fetchHeroSlides(userCity?: string | null): Promise<HeroSlide[]> {
  try {
    const admin = createAdminClient();
    let query = admin
      .from("hero_slides")
      .select("id, title, subtitle, badge, cta_text, cta_link, cta2_text, cta2_link, image_url, mobile_image_url, logo_image_url, city, active, order, created_at, updated_at, show_home, show_landpage")
      .eq("active", true)
      .eq("show_home", true)
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

async function fetchHomeCards(): Promise<any[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("home_cards")
      .select("id, title, description, tag_value, cta_link, icon_left_name, icon_left_bg, icon_right_name, icon_right_color")
      .eq("active", true)
      .order("order", { ascending: true });
    return data ?? [];
  } catch (err) {
    console.error("[fetchHomeCards]", err);
    return [];
  }
}

export default async function HomePage() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userCity: string | null = null;
  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("city").eq("id", user.id).maybeSingle();
    userCity = profile?.city ?? null;
  }

  const [heroSlides, homeCards] = await Promise.all([
    fetchHeroSlides(userCity),
    fetchHomeCards()
  ]);

  return (
    <>
      <Header />
      <main>
        <HeroCarousel slides={heroSlides} />
        <ServiceCards cards={homeCards} />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
