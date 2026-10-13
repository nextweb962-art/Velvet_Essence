"use client";

import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser Supabase client. A single instance is memoised so that the
 * `onAuthStateChange` listener and the session storage stay coherent across
 * every component that asks for it.
 */
export function createClient() {
  assertSupabaseConfigured();
  if (!cached) {
    cached = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}

export function getSupabaseBrowserClient() {
  return cached;
}
