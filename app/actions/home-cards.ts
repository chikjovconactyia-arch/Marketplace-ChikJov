"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface HomeCardInput {
  title: string;
  description: string;
  tag_value: string;
  cta_link: string;
  icon_left_name: string;
  icon_left_bg: string;
  icon_right_name: string;
  icon_right_color: string;
  order: number;
  active: boolean;
}

export interface CardActionResult {
  ok: boolean;
  message: string;
  id?: string;
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/dashboard/admin/card-home");
}

export async function createHomeCardAction(data: HomeCardInput): Promise<CardActionResult> {
  if (!data.title?.trim()) return { ok: false, message: "Título é obrigatório." };
  if (!data.description?.trim()) return { ok: false, message: "Descrição é obrigatória." };

  const admin = createAdminClient();
  const { data: card, error } = await admin
    .from("home_cards")
    .insert({
      title: data.title.trim(),
      description: data.description.trim(),
      tag_value: data.tag_value || "0.0",
      cta_link: data.cta_link || null,
      icon_left_name: data.icon_left_name || "FolderGit2",
      icon_left_bg: data.icon_left_bg || "bg-[#EEF2F6] text-[#6B21D9]",
      icon_right_name: data.icon_right_name || "BarChart3",
      icon_right_color: data.icon_right_color || "text-[#8B5CF6]",
      order: data.order ?? 0,
      active: data.active ?? true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createHomeCard]", error);
    return { ok: false, message: "Erro ao criar card: " + error.message };
  }

  revalidate();
  return { ok: true, message: "Card criado com sucesso!", id: card.id };
}

export async function updateHomeCardAction(id: string, data: HomeCardInput): Promise<CardActionResult> {
  if (!data.title?.trim()) return { ok: false, message: "Título é obrigatório." };
  if (!data.description?.trim()) return { ok: false, message: "Descrição é obrigatória." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("home_cards")
    .update({
      title: data.title.trim(),
      description: data.description.trim(),
      tag_value: data.tag_value || "0.0",
      cta_link: data.cta_link || null,
      icon_left_name: data.icon_left_name || "FolderGit2",
      icon_left_bg: data.icon_left_bg || "bg-[#EEF2F6] text-[#6B21D9]",
      icon_right_name: data.icon_right_name || "BarChart3",
      icon_right_color: data.icon_right_color || "text-[#8B5CF6]",
      order: data.order ?? 0,
      active: data.active ?? true,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateHomeCard]", error);
    return { ok: false, message: "Erro ao atualizar card: " + error.message };
  }

  revalidate();
  return { ok: true, message: "Card atualizado com sucesso!" };
}

export async function toggleHomeCardAction(id: string, active: boolean): Promise<CardActionResult> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("home_cards")
    .update({ active })
    .eq("id", id);

  if (error) {
    console.error("[toggleHomeCard]", error);
    return { ok: false, message: "Erro ao alterar status." };
  }

  revalidate();
  return { ok: true, message: active ? "Card ativado!" : "Card desativado!" };
}

export async function deleteHomeCardAction(id: string): Promise<CardActionResult> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("home_cards")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteHomeCard]", error);
    return { ok: false, message: "Erro ao excluir." };
  }

  revalidate();
  return { ok: true, message: "Card excluído com sucesso." };
}

export async function duplicateHomeCardAction(id: string): Promise<CardActionResult> {
  const admin = createAdminClient();
  const { data: original } = await admin
    .from("home_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) return { ok: false, message: "Card original não encontrado." };

  const { data: copy, error } = await admin
    .from("home_cards")
    .insert({
      title: `${original.title} (cópia)`,
      description: original.description,
      tag_value: original.tag_value,
      cta_link: original.cta_link ?? null,
      icon_left_name: original.icon_left_name,
      icon_left_bg: original.icon_left_bg,
      icon_right_name: original.icon_right_name,
      icon_right_color: original.icon_right_color,
      active: false,
      order: (original.order ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[duplicateHomeCard]", error);
    return { ok: false, message: "Erro ao duplicar card." };
  }

  revalidate();
  return { ok: true, message: "Card duplicado com sucesso!", id: copy.id };
}

export async function reorderHomeCardsAction(
  cards: { id: string; order: number }[]
): Promise<CardActionResult> {
  const admin = createAdminClient();
  try {
    await Promise.all(
      cards.map((c) =>
        admin.from("home_cards").update({ order: c.order }).eq("id", c.id)
      )
    );
    revalidate();
    return { ok: true, message: "Ordem dos cards salva com sucesso!" };
  } catch (error) {
    console.error("[reorderHomeCards]", error);
    return { ok: false, message: "Erro ao salvar a nova ordenação." };
  }
}
