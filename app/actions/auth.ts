"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";
type UserRole = Database["public"]["Enums"]["user_role"];

export interface AuthResult {
  ok: boolean;
  message?: string;
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Preencha email e senha." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, message: traduzErroAuth(error.message) };
  }

  // Decide destino pelo role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const target =
    redirectTo && redirectTo.startsWith("/")
      ? redirectTo
      : profile?.role === "admin"
        ? "/dashboard/admin"
        : profile?.role === "empresa"
          ? "/dashboard/empresa"
          : "/dashboard/cliente";

  revalidatePath("/", "layout");
  redirect(target);
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  empresaName?: string;
  referralSlug?: string;
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("role") ?? "cliente") as UserRole;
  const empresaName = String(formData.get("empresaName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const cookieStore = await cookies();
  const referralSlug =
    String(formData.get("ref") ?? "").trim() ||
    cookieStore.get("chikjov_ref")?.value ||
    "";

  // Validações
  if (!email || !password || !fullName) {
    return { ok: false, message: "Preencha todos os campos obrigatórios." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Senha deve ter ao menos 8 caracteres." };
  }
  if (role === "empresa" && !empresaName) {
    return { ok: false, message: "Informe o nome da empresa." };
  }
  if (role !== "cliente" && role !== "empresa") {
    return { ok: false, message: "Tipo de cadastro inválido." };
  }

  const supabase = await createClient();

  // 1) Cria usuário no Supabase Auth — metadata vai ser usada pelo trigger handle_new_user
  // (caso exista) para popular profiles. Se não houver, fallback abaixo via admin.
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, phone },
    },
  });

  if (signUpError || !signUp.user) {
    return { ok: false, message: traduzErroAuth(signUpError?.message ?? "Erro ao criar conta.") };
  }

  // 2) Garante que existe profile (idempotente — usa upsert via service_role)
  const admin = createAdminClient();
  await admin.from("profiles").upsert(
    {
      id: signUp.user.id,
      role,
      full_name: fullName,
      phone: phone || null,
      city: city && city !== "Todas as cidades" ? city : null,
      subscription_status: "inactive",
    },
    { onConflict: "id" }
  );

  // 3) Se for empresa, cria registro em empresarios + empresas
  if (role === "empresa") {
    const { data: empresario } = await admin
      .from("empresarios")
      .insert({ full_name: fullName, email, phone: phone || null })
      .select("id")
      .single();

    if (empresario) {
      await admin.from("empresas").insert({
        empresario_id: empresario.id,
        name: empresaName,
        email,
        phone: phone || null,
        active: false, // aguarda aprovação admin + plano
        subscription_active: false,
      });
    }
  }

  // 4) Se veio com ref, registra indicação (1º nível, comissão R$ 20)
  if (referralSlug) {
    const { data: referrerId } = await admin.rpc("get_referrer_by_slug", {
      p_slug: referralSlug,
    });
    if (referrerId && typeof referrerId === "string" && referrerId !== signUp.user.id) {
      await admin.rpc("register_referral", {
        p_referrer_id: referrerId,
        p_referred_id: signUp.user.id,
        p_level: 1,
        p_commission: 20,
      });
      // Vincular profile.referred_by_user_id
      await admin.from("profiles").update({ referred_by_user_id: referrerId }).eq("id", signUp.user.id);

      // Comissão nível 2 — se o referrer também foi indicado por alguém
      const { data: referrerProfile } = await admin
        .from("profiles")
        .select("referred_by_user_id")
        .eq("id", referrerId)
        .maybeSingle();

      if (referrerProfile?.referred_by_user_id && referrerProfile.referred_by_user_id !== signUp.user.id) {
        await admin.rpc("register_referral", {
          p_referrer_id: referrerProfile.referred_by_user_id,
          p_referred_id: signUp.user.id,
          p_level: 2,
          p_commission: 5,
        });
      }
    }
    // Limpa cookie após registrar
    cookieStore.delete("chikjov_ref");
  }

  // Se a confirmação de email estiver desligada, o usuário já está logado.
  if (signUp.session) {
    redirect("/checkout");
  }

  return {
    ok: true,
    message: "Conta criada! Verifique seu email para confirmar o cadastro.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export interface RegisterEmpresaLandingInput {
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  instagram: string;
  cidade: string;
  categoria: string;
  senha: string;
}

export interface RegisterEmpresaResult {
  ok: boolean;
  message: string;
  redirectTo?: string;
}

export async function registerEmpresaLandingAction(
  data: RegisterEmpresaLandingInput
): Promise<RegisterEmpresaResult> {
  // Validações
  if (!data.nome || !data.email || !data.whatsapp || !data.empresa || !data.senha) {
    return { ok: false, message: "Preencha todos os campos obrigatórios." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, message: "Email inválido." };
  }
  if (data.senha.length < 8) {
    return { ok: false, message: "A senha deve ter ao menos 8 caracteres." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  // 1. Criar usuário no Supabase Auth
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.senha,
    options: {
      data: { full_name: data.nome, role: "empresa", phone: data.whatsapp },
    },
  });

  if (signUpError || !signUp.user) {
    return { ok: false, message: traduzErroAuth(signUpError?.message ?? "Erro ao criar conta.") };
  }

  // 2. Garantir profile com role=empresa
  await admin.from("profiles").upsert(
    {
      id: signUp.user.id,
      role: "empresa",
      full_name: data.nome,
      phone: data.whatsapp,
      city: data.cidade || null,
      subscription_status: "inactive",
    },
    { onConflict: "id" }
  );

  // 3. Registrar no banco via RPC (Cria Empresário, Empresa e Lead de uma vez)
  // A função SQL foi atualizada para salvar o instagram na coluna correta.
  const { data: rpcResult, error: rpcError } = await admin.rpc("submit_empresa_lead", {
    p_nome: data.nome,
    p_email: data.email,
    p_phone: data.whatsapp,
    p_empresa_name: data.empresa,
    p_instagram: data.instagram || "",
  });

  if (rpcError) {
    console.error("Erro no RPC submit_empresa_lead:", rpcError);
    // Mesmo se o RPC der erro (ex: duplicidade), o usuário Auth e o Profile já foram criados.
    // Mas vamos retornar o erro para o usuário se for algo crítico.
    if (rpcError.message.includes("já está cadastrado")) {
      return { ok: false, message: rpcError.message };
    }
  }

  // 6. Se confirmação de email desligada, sessão já ativa → redireciona
  if (signUp.session) {
    return { ok: true, message: "Conta criada!", redirectTo: "/dashboard/empresa" };
  }

  // Email de confirmação foi enviado
  return {
    ok: true,
    message:
      "Cadastro enviado com sucesso! Verifique seu email para ativar a conta e depois acesse o dashboard.",
  };
}

function traduzErroAuth(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Já existe uma conta com este email. Faça login ou use outro email.";
  if (m.includes("email not confirmed"))
    return "Confirme seu email antes de entrar.";
  if (m.includes("password")) return "Senha inválida.";
  return msg;
}
