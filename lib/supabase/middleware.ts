import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

const PUBLIC_PATHS = ["/", "/landpage", "/auth/login", "/auth/register", "/auth/callback", "/auth/reset-password"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/empresa/")) return true; // página pública da empresa
  if (pathname.startsWith("/marketplace")) return true; // marketplace público
  if (pathname.startsWith("/voucher/validar/")) return true; // validação por QR Code
  if (pathname.startsWith("/ref/")) return true; // link de indicação
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api/public")) return true;
  if (pathname === "/api/stripe/webhook") return true; // Webhook do Stripe (comunicação externa segura)
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANTE: chamar getUser() (não getSession) para validar JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Já logado tentando acessar login/register → manda pro dashboard apropriado
  if (user && AUTH_PAGES.includes(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const target =
      profile?.role === "admin"
        ? "/dashboard/admin"
        : profile?.role === "empresa"
          ? "/dashboard/empresa"
          : "/dashboard/cliente";

    return NextResponse.redirect(new URL(target, request.url));
  }

  // Não logado tentando acessar rota privada → manda pro login
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
