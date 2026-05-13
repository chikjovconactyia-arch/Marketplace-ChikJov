"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface UpdateClientePerfilInput {
  full_name: string;
  phone: string;
  city: string;
}

export interface PerfilResult {
  ok: boolean;
  message: string;
}

export async function updateClientePerfilAction(
  data: UpdateClientePerfilInput
): Promise<PerfilResult> {
  if (!data.full_name) return { ok: false, message: "Nome é obrigatório." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: data.full_name,
      phone: data.phone || null,
      city: data.city || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[updateClientePerfil]", error);
    return { ok: false, message: "Erro ao salvar." };
  }

  revalidatePath("/dashboard/cliente/perfil");
  return { ok: true, message: "Perfil atualizado com sucesso!" };
}


// Salva avatar_url no user_metadata do Supabase Auth — auto-save após upload
export async function saveAvatarAction(avatarUrl: string): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl || null },
  });

  if (error) {
    console.error("[saveAvatarAction]", error);
    return { ok: false, message: "Erro ao salvar foto." };
  }

  revalidatePath("/dashboard/cliente/perfil");
  revalidatePath("/dashboard/cliente", "layout");
  return { ok: true, message: "Foto de perfil atualizada!" };
}
