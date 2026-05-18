import type { NextRequest } from "next/server";

/**
 * Resolve a URL base da aplicação SEM request (em actions, jobs, etc).
 *
 * Ordem de prioridade:
 * 1. window.location.origin (browser)
 * 2. NEXT_PUBLIC_APP_URL
 * 3. NEXT_PUBLIC_SITE_URL (legacy)
 * 4. VERCEL_URL
 * 5. http://localhost:3000
 */
export function getAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

/**
 * Resolve o origin público REAL a partir de uma NextRequest.
 *
 * IMPORTANTE: Em hospedagens com proxy reverso (Hostinger LiteSpeed, nginx,
 * Apache, etc), `req.nextUrl.origin` retorna o endereço interno do Node.js
 * (ex: http://localhost:3000), não o domínio público que o usuário acessou.
 *
 * Esta função respeita os headers padrão do proxy:
 *   - x-forwarded-host  → domínio público (ex: clube.chikjov.com.br)
 *   - x-forwarded-proto → https/http
 *
 * Ordem de prioridade:
 * 1. x-forwarded-host (header do proxy reverso)
 * 2. host header (acesso direto sem proxy, ignora localhost)
 * 3. NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL
 * 4. req.nextUrl.origin (último recurso)
 */
export function getRequestOrigin(req: NextRequest): string {
  // 1. Headers do proxy reverso (Hostinger, nginx, etc)
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  // 2. Host header (não-localhost)
  const host = req.headers.get("host");
  if (host && !host.startsWith("localhost") && !host.startsWith("127.")) {
    // Em produção sem proxy, assume https
    return `https://${host}`;
  }

  // 3. Env vars
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // 4. req.nextUrl como último recurso (dev local)
  return req.nextUrl.origin;
}
