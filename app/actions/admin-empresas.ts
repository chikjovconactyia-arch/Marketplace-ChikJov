"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const REVALIDATE = "/dashboard/admin/empresas";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
}

export interface AdminEmpresaResult { ok: boolean; message: string; }

export async function toggleEmpresaStatusAction(id: string, active: boolean): Promise<AdminEmpresaResult> {
  if (!await assertAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  const { error } = await admin.from("empresas").update({ active }).eq("id", id);
  if (error) return { ok: false, message: "Erro ao atualizar status." };
  revalidatePath(REVALIDATE);
  return { ok: true, message: active ? "Empresa aprovada!" : "Empresa bloqueada." };
}

export async function toggleEmpresaFeaturedAction(id: string, featured: boolean): Promise<AdminEmpresaResult> {
  if (!await assertAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  const { error } = await admin.from("empresas").update({ is_featured: featured }).eq("id", id);
  if (error) return { ok: false, message: "Erro ao atualizar destaque." };
  revalidatePath(REVALIDATE);
  return { ok: true, message: featured ? "Empresa em destaque!" : "Destaque removido." };
}
export async function updateEmpresaAction(id: string, data: any): Promise<AdminEmpresaResult> {
  if (!await assertAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  const { error } = await admin.from("empresas").update(data).eq("id", id);
  if (error) {
    console.error("Update Error:", error);
    return { ok: false, message: "Erro ao atualizar empresa." };
  }
  revalidatePath(REVALIDATE);
  return { ok: true, message: "Empresa atualizada com sucesso!" };
}
