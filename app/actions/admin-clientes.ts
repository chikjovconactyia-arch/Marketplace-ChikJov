"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const REVALIDATE = "/dashboard/admin/clientes";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
}

export interface AdminClienteResult { ok: boolean; message: string; }

export async function blockClienteAction(id: string, currentlyBanned: boolean): Promise<AdminClienteResult> {
  if (!await assertAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  
  // No Supabase, bloquear um usuário pode ser feito usando ban_duration
  // Se currentlyBanned é true, desbanimos (ban_duration = 'none')
  // Se false, banimos por muito tempo (100 anos)
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: currentlyBanned ? "none" : "876000h",
  });
  
  if (error) {
    console.error("Block Error:", error);
    return { ok: false, message: "Erro ao alterar status do cliente." };
  }
  revalidatePath(REVALIDATE);
  return { ok: true, message: currentlyBanned ? "Cliente desbloqueado!" : "Cliente bloqueado." };
}

export async function deleteClienteAction(id: string): Promise<AdminClienteResult> {
  if (!await assertAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  
  // Isso deleta da tabela auth.users. A tabela profiles será deletada em cascata 
  // caso haja ON DELETE CASCADE na foreign key. Por garantia, deletamos do profiles primeiro.
  await admin.from("profiles").delete().eq("id", id);
  const { error } = await admin.auth.admin.deleteUser(id);
  
  if (error) {
    console.error("Delete Error:", error);
    return { ok: false, message: "Erro ao excluir cliente." };
  }
  revalidatePath(REVALIDATE);
  return { ok: true, message: "Cliente excluído com sucesso!" };
}

export async function updateClienteAction(id: string, data: any): Promise<AdminClienteResult> {
  if (!await assertAdmin()) return { ok: false, message: "Sem permissão." };
  const admin = createAdminClient();
  
  const { error } = await admin.from("profiles").update(data).eq("id", id);
  
  if (error) {
    console.error("Update Error:", error);
    return { ok: false, message: "Erro ao atualizar cliente." };
  }
  revalidatePath(REVALIDATE);
  return { ok: true, message: "Cliente atualizado com sucesso!" };
}
