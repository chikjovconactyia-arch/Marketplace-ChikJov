import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Cliente com service_role — BYPASSA RLS.
// SOMENTE usar em Server Actions / API Routes confiáveis (admin, webhooks Stripe).
// NUNCA expor para o browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
