import { NextResponse } from "next/server";

import { isSupabaseConfigured, SITE_URL } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign-out is a POST so it cannot be triggered by a prefetch, a link preview or
 * an <img> tag — a GET endpoint here would let any third-party page log our
 * shoppers out.
 */
export async function POST() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(`${SITE_URL}/`, { status: 303 });
}
