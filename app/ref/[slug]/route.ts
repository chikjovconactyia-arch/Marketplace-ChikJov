import { NextRequest, NextResponse } from "next/server";

// /ref/[slug] — captura código de indicação, salva em cookie e redireciona
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const url = new URL(`${siteUrl}/auth/register`);
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
