import { NextRequest, NextResponse } from "next/server";

// /ref/[slug] — captura código de indicação, salva em cookie e redireciona
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);

  // Usa o origin REAL da requisição — nunca depende de env var.
  // Isso garante que se o usuário acessou via https://clube.chikjov.com.br,
  // o redirect vai pro mesmo domínio — não pra localhost.
  const url = req.nextUrl.clone();
  url.pathname = "/auth/register";
  url.search = "";
  url.searchParams.set("ref", cleanSlug);

  const response = NextResponse.redirect(url);

  // Cookie persiste 30 dias — caso usuário não cadastre na hora
  response.cookies.set("chikjov_ref", cleanSlug, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    httpOnly: false, // JS pode ler para passar no register
    sameSite: "lax",
  });

  return response;
}
