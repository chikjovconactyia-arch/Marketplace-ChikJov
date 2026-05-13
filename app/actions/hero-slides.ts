"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface HeroSlideInput {
  title: string;
  subtitle: string;
  badge: string;
  image_url: string;
  mobile_image_url: string;
  cta_text: string;
  cta_link: string;
  cta2_text: string;
  cta2_link: string;
  order: number;
  active: boolean;
}

export interface SlideResult {
  ok: boolean;
  message: string;
  id?: string;
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/dashboard/admin/hero-carousel");
}

export async function createHeroSlideAction(data: HeroSlideInput): Promise<SlideResult> {
  if (!data.title?.trim()) return { ok: false, message: "Título é obrigatório." };
  if (!data.image_url?.trim()) return { ok: false, message: "Imagem é obrigatória." };

  const admin = createAdminClient();
  const { data: slide, error } = await admin
    .from("hero_slides")
    .insert({
      title: data.title.trim(),
      subtitle: data.subtitle || null,
      badge: data.badge || null,
      image_url: data.image_url,
      mobile_image_url: data.mobile_image_url || null,
      cta_text: data.cta_text || null,
      cta_link: data.cta_link || null,
      cta2_text: data.cta2_text || null,
      cta2_link: data.cta2_link || null,
      order: data.order ?? 0,
      active: data.active ?? true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createHeroSlide]", error);
    return { ok: false, message: "Erro ao criar slide: " + error.message };
  }

  revalidate();
  return { ok: true, message: "Slide criado com sucesso!", id: slide.id };
}

export async function updateHeroSlideAction(id: string, data: HeroSlideInput): Promise<SlideResult> {
  if (!data.title?.trim()) return { ok: false, message: "Título é obrigatório." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("hero_slides")
    .update({
      title: data.title.trim(),
      subtitle: data.subtitle || null,
      badge: data.badge || null,
      image_url: data.image_url,
      mobile_image_url: data.mobile_image_url || null,
      cta_text: data.cta_text || null,
      cta_link: data.cta_link || null,
      cta2_text: data.cta2_text || null,
      cta2_link: data.cta2_link || null,
      order: data.order ?? 0,
      active: data.active ?? true,
    })
    .eq("id", id);

  if (error) return { ok: false, message: "Erro ao atualizar: " + error.message };

  revalidate();
  return { ok: true, message: "Slide atualizado!" };
}

export async function toggleHeroSlideAction(id: string, active: boolean): Promise<SlideResult> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("hero_slides")
    .update({ active })
    .eq("id", id);

  if (error) return { ok: false, message: "Erro ao alterar status." };
  revalidate();
  return { ok: true, message: active ? "Slide ativado!" : "Slide desativado!" };
}

export async function deleteHeroSlideAction(id: string): Promise<SlideResult> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("hero_slides")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, message: "Erro ao excluir." };
  revalidate();
  return { ok: true, message: "Slide excluído." };
}

export async function duplicateHeroSlideAction(id: string): Promise<SlideResult> {
  const admin = createAdminClient();
  const { data: original } = await admin
    .from("hero_slides")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) return { ok: false, message: "Slide não encontrado." };

  const { data: copy, error } = await admin
    .from("hero_slides")
    .insert({
      title: `${original.title} (cópia)`,
      subtitle: original.subtitle ?? null,
      badge: original.badge ?? null,
      image_url: original.image_url,
      mobile_image_url: original.mobile_image_url ?? null,
      cta_text: original.cta_text ?? null,
      cta_link: original.cta_link ?? null,
      cta2_text: original.cta2_text ?? null,
      cta2_link: original.cta2_link ?? null,
      active: false,
      order: (original.order ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: "Erro ao duplicar." };
  revalidate();
  return { ok: true, message: "Slide duplicado!", id: copy.id };
}

export async function reorderHeroSlidesAction(
  slides: { id: string; order: number }[]
): Promise<SlideResult> {
  const admin = createAdminClient();
  await Promise.all(
    slides.map((s) =>
      admin.from("hero_slides").update({ order: s.order }).eq("id", s.id)
    )
  );
  revalidate();
  return { ok: true, message: "Ordem salva!" };
}
