import type { Database } from "@/types/database";
import { isCategoryId, type Product, type VariantGroup, type VariantOption } from "@/types";

/**
 * Pure Postgres-row → domain-object mapping.
 *
 * Deliberately free of `server-only` imports: the browser cart needs to rebuild
 * a `Product` from an embedded `cart_items → products` join, and duplicating the
 * coercion rules would invite drift.
 */

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

function coerceVariantOption(raw: unknown): VariantOption | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.name !== "string") return null;

  return {
    id: o.id,
    name: o.name,
    hex: typeof o.hex === "string" ? o.hex : undefined,
    priceDelta: Number.isFinite(Number(o.priceDelta)) ? Number(o.priceDelta) : undefined,
    stock: Number.isFinite(Number(o.stock)) ? Number(o.stock) : undefined,
    image: typeof o.image === "string" ? o.image : undefined,
    caption: typeof o.caption === "string" ? o.caption : undefined,
  };
}

function coerceVariantGroup(raw: unknown): VariantGroup | null {
  if (!raw || typeof raw !== "object") return null;
  const g = raw as Record<string, unknown>;
  if (typeof g.id !== "string" || typeof g.label !== "string") return null;

  const options = Array.isArray(g.options)
    ? g.options.map(coerceVariantOption).filter((o): o is VariantOption => o !== null)
    : [];

  if (options.length === 0) return null;

  return {
    id: g.id,
    label: g.label,
    display: g.display === "swatch" ? "swatch" : "chip",
    options,
  };
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    category: isCategoryId(row.category) ? row.category : "skincare",
    collection: row.collection,
    // PostgREST normally serialises `numeric` as a JSON number; coerce anyway so
    // a string can never reach price arithmetic.
    price: Number(row.price) || 0,
    compare_at_price:
      row.compare_at_price === null ? null : Number(row.compare_at_price) || 0,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    variant_groups: Array.isArray(row.variant_groups)
      ? (row.variant_groups as unknown[])
          .map(coerceVariantGroup)
          .filter((g): g is VariantGroup => g !== null)
      : [],
    badge: row.badge,
    rating: Number(row.rating) || 0,
    review_count: Number(row.review_count) || 0,
    stock: Number(row.stock) || 0,
    is_active: row.is_active,
    is_featured: row.is_featured,
    tags: Array.isArray(row.tags) ? row.tags : [],
    created_at: row.created_at,
  };
}
