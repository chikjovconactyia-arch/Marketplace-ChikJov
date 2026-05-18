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
  const redirectTo = String(formData.get("redirect") ?? "").trim();
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

  const admin = createAdminClient();

  // 1) Cria usuário no Supabase Auth com Admin Client para bypassar confirmação de e-mail/celular
  const { data: userCreated, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name: fullName, role, phone },
  });

  if (userError || !userCreated.user) {
    return { ok: false, message: traduzErroAuth(userError?.message ?? "Erro ao criar conta.") };
  }

  // 2) Garante que existe profile (idempotente — usa upsert via service_role)
  await admin.from("profiles").upsert(
    {
      id: userCreated.user.id,
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
    console.log("[register] Referral slug recebido:", referralSlug);

    // Busca o indicador pelo slug — query direta, sem RPC
    const { data: referrer, error: referrerError } = await admin
      .from("profiles")
      .select("id, full_name, referred_by_user_id")
      .eq("referral_slug", referralSlug)
      .maybeSingle();

    if (referrerError) {
      console.error("[register] Erro ao buscar indicador por slug:", referrerError);
    }

    if (!referrer) {
      console.warn(
        "[register] Slug de indicador não encontrado em profiles.referral_slug:",
        referralSlug
      );
    } else if (referrer.id === userCreated.user.id) {
      console.warn("[register] Auto-indicação bloqueada para:", referralSlug);
    } else {
      console.log("[register] Indicador encontrado:", {
        id: referrer.id,
        nome: referrer.full_name,
      });

      // Cria registro de referral nível 1 (R$ 20) — insert direto
      const { error: refN1Error } = await admin.from("referrals").insert({
        referrer_user_id: referrer.id,
        referred_user_id: userCreated.user.id,
        level: 1,
        commission_value: 20,
        commission_status: null, // deriva para "pending_signup"
      });
      if (refN1Error) {
        console.error("[register] Erro ao criar referral N1:", refN1Error);
      } else {
        console.log(
          "[register] Referral N1 criado (R$ 20):",
          referrer.id,
          "→",
          userCreated.user.id
        );
      }

      // Vincula profile.referred_by_user_id no indicado
      const { error: profileLinkError } = await admin
        .from("profiles")
        .update({ referred_by_user_id: referrer.id })
        .eq("id", userCreated.user.id);
      if (profileLinkError) {
        console.error(
          "[register] Erro ao vincular referred_by_user_id no indicado:",
          profileLinkError
        );
      } else {
        console.log("[register] profiles.referred_by_user_id vinculado:", referrer.id);
      }

      // Nível 2: se o indicador também foi indicado por alguém, esse alguém ganha R$ 5
      if (
        referrer.referred_by_user_id &&
        referrer.referred_by_user_id !== userCreated.user.id
      ) {
        const { error: refN2Error } = await admin.from("referrals").insert({
          referrer_user_id: referrer.referred_by_user_id,
          referred_user_id: userCreated.user.id,
          level: 2,
          commission_value: 5,
          commission_status: null,
        });
        if (refN2Error) {
          console.error("[register] Erro ao criar referral N2:", refN2Error);
        } else {
          console.log(
            "[register] Referral N2 criado (R$ 5):",
            referrer.referred_by_user_id,
            "→",
            userCreated.user.id
          );
        }
      }
    }

    // Limpa cookie após tentativa de registro
    cookieStore.delete("chikjov_ref");
  }

  // 5) Realiza o login automático do usuário recém-criado
  const supabase = await createClient();
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      ok: false,
      message: "Conta criada com sucesso! Porém, ocorreu um erro ao fazer o login automático. Por favor, vá para a tela de login.",
    };
  }

  const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/checkout";
  redirect(target);
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

  const admin = createAdminClient();

  // 1. Criar usuário confirmado no Supabase Auth usando o Admin Client
  const { data: userCreated, error: userError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.senha,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name: data.nome, role: "empresa", phone: data.whatsapp },
  });

  if (userError || !userCreated.user) {
    return { ok: false, message: traduzErroAuth(userError?.message ?? "Erro ao criar conta.") };
  }

  const userId = userCreated.user.id;

  // 2. Garantir profile com role=empresa
  await admin.from("profiles").upsert(
    {
      id: userId,
      role: "empresa",
      full_name: data.nome,
      phone: data.whatsapp,
      city: data.cidade || null,
      subscription_status: "inactive",
    },
    { onConflict: "id" }
  );

  // 3. Registrar no banco via RPC (Cria Empresário, Empresa e Lead de uma vez)
  const { data: rpcResult, error: rpcError } = await admin.rpc("submit_empresa_lead", {
    p_nome: data.nome,
    p_email: data.email,
    p_phone: data.whatsapp,
    p_empresa_name: data.empresa,
    p_instagram: data.instagram || "",
  });

  if (rpcError) {
    console.error("Erro no RPC submit_empresa_lead:", rpcError);
    if (rpcError.message.includes("já está cadastrado")) {
      return { ok: false, message: rpcError.message };
    }
  }

  // 4. Realizar o login automático do usuário recém-criado
  const supabase = await createClient();
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.senha,
  });

  if (signInError) {
    return {
      ok: false,
      message: "Cadastro realizado com sucesso! Porém, ocorreu um erro ao fazer o login automático. Por favor, faça o login manualmente.",
    };
  }

  return { ok: true, message: "Conta criada!", redirectTo: "/dashboard/empresa" };
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
