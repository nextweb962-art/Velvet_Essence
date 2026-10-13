/**
 * Environment access.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so this module is safe to
 * import from both the server and the browser. The service-role key is only
 * ever read inside `lib/supabase/admin.ts`, which refuses to run on the client.
 */

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const SUPABASE_URL = rawUrl;
export const SUPABASE_ANON_KEY = rawAnonKey;

/**
 * When false the storefront runs in **demo mode**: the curated catalogue in
 * `src/data/catalog.json` is served locally, auth is disabled and checkout
 * simulates an order. Nothing here ever throws, so a fresh clone boots.
 */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && /^https?:\/\//.test(SUPABASE_URL),
);

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export class MissingSupabaseEnvError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Copy .env.example to .env.local and set " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or keep " +
        "running in demo mode.",
    );
    this.name = "MissingSupabaseEnvError";
  }
}

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) throw new MissingSupabaseEnvError();
}
