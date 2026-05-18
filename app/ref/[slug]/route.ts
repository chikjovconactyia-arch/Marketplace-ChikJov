import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/url";

// /ref/[slug] — captura código de indicação, salva em cookie e redireciona
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);

  // Resolve o domínio público REAL respeitando x-forwarded-host (Hostinger, nginx, etc).
  const origin = getRequestOrigin(req);
  const url = new URL(`${origin}/auth/register`);
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
