import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client bound to the incoming request's cookies.
 *
 * Use inside Server Components, Server Actions and Route Handlers. Cookies can
 * only be written from a Server Action or Route Handler — during a plain Server
 * Component render `setAll` throws, and we deliberately swallow that because
 * `middleware.ts` already refreshed the session for this request.
 */
export async function createClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToWrite) {
        try {
          for (const { name, value, options } of cookiesToWrite) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — middleware owns the refresh.
        }
      },
    },
  });
}

/** Returns the signed-in user, or null. Never throws in demo mode. */
export async function getSessionUser() {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Signed-in user's profile row (including `role`), or null. */
export async function getCurrentProfile() {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data;

  // The trigger normally creates this row; if it has not landed yet (or the
  // policy denied the read) fall back to the JWT claims rather than failing.
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    phone: null,
    role: "customer" as const,
    created_at: user.created_at,
    updated_at: user.created_at,
  };
}

export async function isCurrentUserAdmin() {
  if (!isSupabaseConfigured) return false;
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
