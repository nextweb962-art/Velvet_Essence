import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except Next.js internals, static assets and image requests —
     * those never need a session refresh and should stay on the edge cache.
     */
    "/((?!_next/static|_next/image|favicon.ico|products/|collections/|hero.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
