import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Runs on every matched request to (a) refresh the Supabase session cookie and
 * (b) gate the authenticated areas of the site.
 *
 * The rule that matters: never run logic between creating the Supabase client
 * and calling `getUser()`. Doing so risks returning a response that does not
 * carry the refreshed cookie, which desynchronises the browser session.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Demo mode: auth is unavailable, so only rate-limit-free passthrough.
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToWrite) {
        for (const { name, value } of cookiesToWrite) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToWrite) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const needsAuth = pathname === "/checkout" || pathname.startsWith("/account");
  const needsAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if ((needsAuth || needsAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirectTo", `${pathname}${search}`);
    url.searchParams.set("reason", "auth");
    return NextResponse.redirect(url);
  }

  if (needsAdmin) {
    // `role` lives in profiles; the middleware client can read it because the
    // "profiles: read own or admin" policy allows self-reads.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      url.search = "";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  // A signed-in shopper has no use for the auth screens.
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
