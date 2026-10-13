import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Service-role client. **Bypasses Row Level Security.**
 *
 * This is the only place the service-role key is read, and the module is
 * marked `server-only` so a stray import from a Client Component fails the
 * build rather than leaking the key into the browser bundle.
 *
 * Use it exclusively for trusted, server-originated work that RLS is not
 * designed to express — background jobs, cron, seed scripts. Regular request
 * paths must use `lib/supabase/server.ts` so the user's own policies apply.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key || !SUPABASE_URL) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Privileged server operations are " +
        "unavailable; use the request-scoped client instead.",
    );
  }

  return createSupabaseClient<Database>(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminClientAvailable() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() && SUPABASE_URL);
}
