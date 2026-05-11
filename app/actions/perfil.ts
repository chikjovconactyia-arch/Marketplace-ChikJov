"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface UpdatePerfilPessoalInput {
  full_name: string;
  phone: string;
  city: string;
}

export interface UpdateEmpresaInput {
  name: string;
  category: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  description: string;
  cnpj: string;
  instagram?: string;
}

export interface PerfilResult {
  ok: boolean;
  message: string;
}

export async function updatePerfilPessoalAction(
  data: UpdatePerfilPessoalInput
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
    console.error("[updatePerfilPessoal] profiles:", error);
    return { ok: false, message: "Erro ao salvar. Tente novamente." };
  }

  // Atualiza empresario vinculado (sem bloquear se não achar)
  await admin
    .from("empresarios")
    .update({ full_name: data.full_name, phone: data.phone || null })
    .eq("email", user.email ?? "");

  revalidatePath("/dashboard/empresa/perfil");
  return { ok: true, message: "Informações pessoais atualizadas!" };
}

export async function updateEmpresaAction(
  _empresaId: string,          // mantido por compatibilidade mas não confiamos no valor
  data: UpdateEmpresaInput
): Promise<PerfilResult> {
  if (!data.name) return { ok: false, message: "Nome da empresa é obrigatório." };

  // Autentica o usuário a partir dos cookies (server-side seguro)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const admin = createAdminClient();

  // Busca a empresa do usuário diretamente pelo email — não depende do ID enviado pelo client
  const { data: empresario, error: errEmpresario } = await admin
    .from("empresarios")
    .select("id")
    .eq("email", user.email ?? "")
    .maybeSingle();

  if (errEmpresario) {
    console.error("[updateEmpresaAction] empresarios query:", errEmpresario);
    return { ok: false, message: "Erro ao localizar empresário." };
  }

  if (!empresario) {
    // Pode ser que o empresario não exista ainda — tenta pelo ID passado pelo client como fallback
    if (_empresaId) {
      const { error } = await admin
        .from("empresas")
        .update({
          name: data.name,
          category: data.category || null,
          city: data.city || null,
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          address: data.address || null,
          description: data.description || null,
          cnpj: data.cnpj || null,
          instagram: data.instagram || null,
        })
        .eq("id", _empresaId);

      if (error) {
        console.error("[updateEmpresaAction] fallback update:", error);
        return { ok: false, message: "Erro ao salvar empresa." };
      }
      revalidatePath("/dashboard/empresa/perfil");
      return { ok: true, message: "Informações da empresa atualizadas!" };
    }
    return { ok: false, message: "Empresa não encontrada para este usuário." };
  }

  // Busca o id da empresa vinculada ao empresario
  const { data: empresa, error: errEmpresa } = await admin
    .from("empresas")
    .select("id")
    .eq("empresario_id", empresario.id)
    .maybeSingle();

  if (errEmpresa) {
    console.error("[updateEmpresaAction] empresas query:", errEmpresa);
    return { ok: false, message: "Erro ao localizar empresa." };
  }

  // Se não achar pela relação, usa o ID passado diretamente como último recurso
  const targetId = empresa?.id ?? _empresaId;

  if (!targetId) {
    return { ok: false, message: "Empresa não encontrada." };
  }

  const { error } = await admin
    .from("empresas")
    .update({
      name: data.name,
      category: data.category || null,
      city: data.city || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      description: data.description || null,
      cnpj: data.cnpj || null,
      instagram: data.instagram || null,
    })
    .eq("id", targetId);

  if (error) {
    console.error("[updateEmpresaAction] update:", error);
    return { ok: false, message: "Erro ao salvar empresa." };
  }

  revalidatePath("/dashboard/empresa/perfil");
  return { ok: true, message: "Informações da empresa atualizadas!" };
}
