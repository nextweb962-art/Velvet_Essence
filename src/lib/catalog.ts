import "server-only";

import catalogJson from "@/data/catalog.json";
import { isCategoryId, type Product, type VariantGroup, type VariantOption } from "@/types";

/**
 * Demo-mode catalogue.
 *
 * `src/data/catalog.json` is the single source of truth — the same file is
 * compiled into `supabase/seed.sql` by `scripts/generate-seed.mjs`, so demo mode
 * and a seeded database serve identical products.
 *
 * The mapper below validates every field defensively: a malformed row is
 * dropped rather than crashing a page.
 */

function toVariantOption(raw: unknown): VariantOption | null {
  if (!raw || typeof raw !== "object") return null;
  const option = raw as Record<string, unknown>;
  if (typeof option.id !== "string" || typeof option.name !== "string") return null;

  return {
    id: option.id,
    name: option.name,
    hex: typeof option.hex === "string" ? option.hex : undefined,
    priceDelta: typeof option.priceDelta === "number" ? option.priceDelta : undefined,
    stock: typeof option.stock === "number" ? option.stock : undefined,
    image: typeof option.image === "string" ? option.image : undefined,
    caption: typeof option.caption === "string" ? option.caption : undefined,
  };
}

function toVariantGroup(raw: unknown): VariantGroup | null {
  if (!raw || typeof raw !== "object") return null;
  const group = raw as Record<string, unknown>;
  if (typeof group.id !== "string" || typeof group.label !== "string") return null;

  const options = Array.isArray(group.options)
    ? group.options.map(toVariantOption).filter((o): o is VariantOption => o !== null)
    : [];

  if (options.length === 0) return null;

  return {
    id: group.id,
    label: group.label,
    display: group.display === "swatch" ? "swatch" : "chip",
    options,
  };
}

export function normaliseProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;

  if (
    typeof p.id !== "string" ||
    typeof p.slug !== "string" ||
    typeof p.name !== "string" ||
    !isCategoryId(p.category) ||
    typeof p.price !== "number"
  ) {
    return null;
  }

  const images = Array.isArray(p.images)
    ? p.images.filter((i): i is string => typeof i === "string")
    : [];

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: typeof p.tagline === "string" ? p.tagline : null,
    description: typeof p.description === "string" ? p.description : "",
    category: p.category,
    collection: typeof p.collection === "string" ? p.collection : null,
    price: p.price,
    compare_at_price: typeof p.compare_at_price === "number" ? p.compare_at_price : null,
    images: images.length > 0 ? images : ["/hero.svg"],
    variant_groups: Array.isArray(p.variant_groups)
      ? p.variant_groups
          .map(toVariantGroup)
          .filter((g): g is VariantGroup => g !== null)
      : [],
    badge: typeof p.badge === "string" ? p.badge : null,
    rating: typeof p.rating === "number" ? p.rating : 0,
    review_count: typeof p.review_count === "number" ? p.review_count : 0,
    stock: typeof p.stock === "number" ? p.stock : 0,
    is_active: p.is_active !== false,
    is_featured: p.is_featured === true,
    tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === "string") : [],
    created_at: typeof p.created_at === "string" ? p.created_at : new Date(0).toISOString(),
  };
}

export const DEMO_PRODUCTS: Product[] = (catalogJson as unknown[])
  .map(normaliseProduct)
  .filter((p): p is Product => p !== null);

export const DEMO_COLLECTIONS: string[] = Array.from(
  new Set(DEMO_PRODUCTS.map((p) => p.collection).filter((c): c is string => Boolean(c))),
).sort();
