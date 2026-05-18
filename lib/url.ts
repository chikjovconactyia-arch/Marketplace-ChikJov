/**
 * Resolve a URL base da aplicação em qualquer contexto.
 *
 * Ordem de prioridade:
 * 1. window.location.origin (browser) → sempre o domínio que o usuário acessou
 * 2. NEXT_PUBLIC_APP_URL (env var preferencial)
 * 3. NEXT_PUBLIC_SITE_URL (env var legada)
 * 4. VERCEL_URL (auto-setada pela Vercel em deploys)
 * 5. http://localhost:3000 (último recurso para dev)
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
