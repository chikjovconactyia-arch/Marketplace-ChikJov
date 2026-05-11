"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface LeadInput {
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  instagram: string;
  origem: string;
}

export interface LeadResponse {
  ok: boolean;
  message: string;
}

export async function submitLead(data: LeadInput): Promise<LeadResponse> {
  if (!data.nome || !data.email || !data.whatsapp || !data.empresa) {
    return { ok: false, message: "Preencha todos os campos obrigatórios." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, message: "Email inválido." };
  }

  // Usa a RPC oficial submit_empresa_lead — service_role para bypass de RLS,
  // já que esta é a única forma do form público inserir leads com segurança.
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("submit_empresa_lead", {
    p_nome: data.nome,
    p_phone: data.whatsapp,
    p_email: data.email,
    p_empresa_name: data.empresa,
    p_instagram: data.instagram || "",
  });

  if (error) {
    console.error("[submit_empresa_lead]", error);
    return {
      ok: false,
      message:
        "Não conseguimos registrar seu cadastro agora. Tente novamente em instantes.",
    };
  }

  return {
    ok: true,
    message: "Recebemos seus dados! Em breve nossa equipe entra em contato.",
  };
}
