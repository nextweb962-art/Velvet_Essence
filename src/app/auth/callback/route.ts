import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { isSupabaseConfigured, SITE_URL } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Only ever redirect to a path on this site. Anything absolute, protocol
 * relative or containing a backslash is discarded — this endpoint is the
 * classic open-redirect foot-gun in OAuth flows.
 */
function safeNext(value: string | null, fallback = "/account") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${SITE_URL}/login?error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${SITE_URL}/login?reason=demo`);
  }

  const supabase = await createClient();

  // PKCE flow — OAuth providers and modern confirmation emails.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${SITE_URL}${next}`);
    console.error("[auth/callback] exchangeCodeForSession failed", error);
  }

  // Email OTP flow — magic links and legacy confirmation templates.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${SITE_URL}${next}`);
    console.error("[auth/callback] verifyOtp failed", error);
  }

  return NextResponse.redirect(
    `${SITE_URL}/login?error=${encodeURIComponent(
      "That sign-in link has expired. Please try again.",
    )}`,
  );
}
