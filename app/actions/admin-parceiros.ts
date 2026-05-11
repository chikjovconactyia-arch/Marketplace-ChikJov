"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const REVALIDATE_PATHS = ["/", "/dashboard/admin/parceiros"];

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
}

export interface ParceiroResult {
  ok: boolean;
  message: string;
}

// Toggle do flag is_featured (usado como "exibir no carrossel")
export async function togglePartnerCarouselAction(id: string, show: boolean): Promise<ParceiroResult> {
  if (!await isAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("empresas")
    .update({ is_featured: show })
    .eq("id", id);

  if (error) return { ok: false, message: "Erro ao atualizar: " + error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  return { ok: true, message: show ? "Empresa adicionada ao carrossel!" : "Empresa removida do carrossel." };
}

// Toggle status ativo
export async function togglePartnerActiveAction(id: string, active: boolean): Promise<ParceiroResult> {
  if (!await isAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("empresas")
    .update({ active })
    .eq("id", id);

  if (error) return { ok: false, message: "Erro: " + error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  return { ok: true, message: active ? "Empresa ativada!" : "Empresa desativada." };
}
