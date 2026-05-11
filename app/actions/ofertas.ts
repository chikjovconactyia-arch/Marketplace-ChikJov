"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REVALIDATE = "/dashboard/empresa/ofertas";

export interface OfertaInput {
  title: string;
  description: string | null;
  type: string | null;
  price: number | null;           // valor original
  discount_percent: number | null;
  image_url: string | null;
  active: boolean;
}

export interface OfertaResult {
  ok: boolean;
  message: string;
  id?: string;
}

// Retorna o empresa_id do usuário logado (via empresario → empresa)
async function getEmpresaId(userEmail: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: empresario } = await admin
    .from("empresarios")
    .select("id")
    .eq("email", userEmail)
    .maybeSingle();
  if (!empresario) return null;

  const { data: empresa } = await admin
    .from("empresas")
    .select("id")
    .eq("empresario_id", empresario.id)
    .maybeSingle();
  return empresa?.id ?? null;
}

export async function createOfertaAction(data: OfertaInput): Promise<OfertaResult> {
  if (!data.title?.trim()) return { ok: false, message: "Título é obrigatório." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const empresaId = await getEmpresaId(user.email ?? "");
  if (!empresaId) return { ok: false, message: "Empresa não encontrada para este usuário." };

  const admin = createAdminClient();
  const { data: oferta, error } = await admin
    .from("ofertas")
    .insert({
      empresa_id: empresaId,
      title: data.title.trim(),
      description: data.description || null,
      type: data.type || null,
      price: data.price ?? null,
      discount_percent: data.discount_percent ?? null,
      image_url: data.image_url || null,
      active: data.active,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createOferta]", error);
    return { ok: false, message: "Erro ao criar oferta." };
  }

  revalidatePath(REVALIDATE);
  return { ok: true, message: "Oferta criada com sucesso!", id: oferta.id };
}

export async function updateOfertaAction(id: string, data: OfertaInput): Promise<OfertaResult> {
  if (!data.title?.trim()) return { ok: false, message: "Título é obrigatório." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const empresaId = await getEmpresaId(user.email ?? "");
  if (!empresaId) return { ok: false, message: "Empresa não encontrada." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("ofertas")
    .update({
      title: data.title.trim(),
      description: data.description || null,
      type: data.type || null,
      price: data.price ?? null,
      discount_percent: data.discount_percent ?? null,
      image_url: data.image_url || null,
      active: data.active,
    })
    .eq("id", id)
    .eq("empresa_id", empresaId); // garante que só edita a própria empresa

  if (error) {
    console.error("[updateOferta]", error);
    return { ok: false, message: "Erro ao atualizar oferta." };
  }

  revalidatePath(REVALIDATE);
  return { ok: true, message: "Oferta atualizada!" };
}

export async function toggleOfertaAction(id: string, active: boolean): Promise<OfertaResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const empresaId = await getEmpresaId(user.email ?? "");
  if (!empresaId) return { ok: false, message: "Empresa não encontrada." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("ofertas")
    .update({ active })
    .eq("id", id)
    .eq("empresa_id", empresaId);

  if (error) return { ok: false, message: "Erro ao atualizar status." };

  revalidatePath(REVALIDATE);
  return { ok: true, message: active ? "Oferta ativada!" : "Oferta pausada!" };
}

export async function duplicateOfertaAction(id: string): Promise<OfertaResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const empresaId = await getEmpresaId(user.email ?? "");
  if (!empresaId) return { ok: false, message: "Empresa não encontrada." };

  const admin = createAdminClient();
  const { data: original } = await admin
    .from("ofertas")
    .select("*")
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();

  if (!original) return { ok: false, message: "Oferta não encontrada." };

  const { data: nova, error } = await admin
    .from("ofertas")
    .insert({
      empresa_id: empresaId,
      title: `${original.title} (cópia)`,
      description: original.description,
      type: original.type,
      price: original.price,
      discount_percent: original.discount_percent,
      image_url: original.image_url,
      active: false,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: "Erro ao duplicar." };

  revalidatePath(REVALIDATE);
  return { ok: true, message: "Oferta duplicada!", id: nova.id };
}

export async function deleteOfertaAction(id: string): Promise<OfertaResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Não autenticado." };

  const empresaId = await getEmpresaId(user.email ?? "");
  if (!empresaId) return { ok: false, message: "Empresa não encontrada." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("ofertas")
    .delete()
    .eq("id", id)
    .eq("empresa_id", empresaId);

  if (error) return { ok: false, message: "Erro ao excluir." };

  revalidatePath(REVALIDATE);
  return { ok: true, message: "Oferta excluída." };
}
