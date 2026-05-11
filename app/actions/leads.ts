"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";
type LeadStatus = Database["public"]["Enums"]["lead_status"];

export interface UpdateLeadInput {
  id: string;
  nome_responsavel: string;
  telefone: string;
  email: string;
  nome_empresa: string;
  origem: string | null;
  status: LeadStatus | null;
  instagram?: string | null;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function updateLeadAction(data: UpdateLeadInput): Promise<ActionResult> {
  if (!data.id) return { ok: false, message: "ID inválido." };
  if (!data.nome_responsavel || !data.email || !data.nome_empresa) {
    return { ok: false, message: "Preencha os campos obrigatórios." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, message: "Email inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("leads_empresas")
    .update({
      nome_responsavel: data.nome_responsavel,
      telefone: data.telefone,
      email: data.email,
      nome_empresa: data.nome_empresa,
      origem: data.origem,
      status: data.status,
      instagram: data.instagram || null,
    })
    .eq("id", data.id);

  if (error) {
    console.error("[updateLead]", error);
    return { ok: false, message: "Erro ao atualizar. Tente novamente." };
  }

  revalidatePath("/dashboard/admin/empresas");
  return { ok: true, message: "Empresa atualizada com sucesso!" };
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("leads_empresas").delete().eq("id", id);
  if (error) return { ok: false, message: "Erro ao remover." };
  revalidatePath("/dashboard/admin/empresas");
  return { ok: true, message: "Lead removido." };
}
