import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { fetchProductSuggestions } from "@/lib/products";

/**
 * Instant-search endpoint for the navbar typeahead.
 *
 * Returns a deliberately small projection (no description, no variants) so the
 * response stays cheap enough to fire on every keystroke.
 */
const querySchema = z.object({
  q: z.string().trim().max(80).optional().default(""),
  limit: z.coerce.number().int().min(1).max(10).optional().default(6),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? "",
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { results: [], error: "معاملات بحث غير صحيحة" },
      { status: 400 },
    );
  }

  const { q, limit } = parsed.data;

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await fetchProductSuggestions(q, limit);
    return NextResponse.json(
      { results },
      {
        headers: {
          // Personalisation-free, so a short shared cache is safe and cheap.
          "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("[api/products] search failed", error);
    return NextResponse.json(
      { results: [], error: "البحث غير متاح حالياً" },
      { status: 500 },
    );
  }
}
