import "server-only";

import { DEMO_PRODUCTS } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/env";
import { rowToProduct } from "@/lib/product-mapper";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, isCategoryId, type Product } from "@/types";
import type { ProductQuery } from "@/lib/validation";

export { rowToProduct };

/* -------------------------------------------------------------------------- */
/* In-memory engine (demo mode)                                               */
/* -------------------------------------------------------------------------- */

function matchesQuery(product: Product, query: ProductQuery) {
  if (!product.is_active) return false;

  if (query.category.length > 0 && !query.category.includes(product.category)) {
    return false;
  }
  if (typeof query.min === "number" && product.price < query.min) return false;
  if (typeof query.max === "number" && product.price > query.max) return false;

  const term = query.q.trim().toLowerCase();
  if (!term) return true;

  const haystack = [
    product.name,
    product.tagline ?? "",
    product.description,
    product.collection ?? "",
    product.category,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();

  return term
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function sortProducts(products: Product[], sort: ProductQuery["sort"]) {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort(
        (a, b) => b.rating - a.rating || b.review_count - a.review_count,
      );
    case "newest":
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "featured":
    default:
      return list.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          b.rating - a.rating ||
          b.review_count - a.review_count,
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Public API — identical shape in demo and live mode                         */
/* -------------------------------------------------------------------------- */

export type ProductPage = {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  /** True when served from the bundled catalogue rather than the database. */
  demo: boolean;
};

export async function fetchProducts(query: ProductQuery): Promise<ProductPage> {
  const from = (query.page - 1) * query.perPage;
  const to = from + query.perPage - 1;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let builder = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      if (query.category.length > 0) {
        builder = builder.in("category", query.category);
      }
      if (typeof query.min === "number") builder = builder.gte("price", query.min);
      if (typeof query.max === "number") builder = builder.lte("price", query.max);

      const term = query.q.trim();
      if (term) {
        // `websearch` is injection-safe: it never raises on arbitrary input.
        builder = builder.textSearch("search_vector", term, {
          type: "websearch",
          config: "english",
        });
      }

      switch (query.sort) {
        case "price-asc":
          builder = builder.order("price", { ascending: true });
          break;
        case "price-desc":
          builder = builder.order("price", { ascending: false });
          break;
        case "rating":
          builder = builder
            .order("rating", { ascending: false })
            .order("review_count", { ascending: false });
          break;
        case "newest":
          builder = builder.order("created_at", { ascending: false });
          break;
        default:
          builder = builder
            .order("is_featured", { ascending: false })
            .order("rating", { ascending: false })
            .order("review_count", { ascending: false });
      }

      const { data, error, count } = await builder.range(from, to);

      if (error) throw error;

      const total = count ?? 0;
      return {
        products: (data ?? []).map(rowToProduct),
        total,
        page: query.page,
        perPage: query.perPage,
        pageCount: Math.max(1, Math.ceil(total / query.perPage)),
        demo: false,
      };
    } catch (error) {
      console.warn(
        "[products] falling back to the bundled catalogue:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  const filtered = sortProducts(
    DEMO_PRODUCTS.filter((p) => matchesQuery(p, query)),
    query.sort,
  );

  return {
    products: filtered.slice(from, to + 1),
    total: filtered.length,
    page: query.page,
    perPage: query.perPage,
    pageCount: Math.max(1, Math.ceil(filtered.length / query.perPage)),
    demo: true,
  };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (data) return rowToProduct(data);
    } catch (error) {
      console.warn(
        "[products] slug lookup failed, trying the bundled catalogue:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return DEMO_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("rating", { ascending: false })
        .limit(limit);
      if (error) throw error;
      if (data && data.length > 0) return data.map(rowToProduct);
    } catch (error) {
      console.warn(
        "[products] featured query failed, using the bundled catalogue:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return sortProducts(
    DEMO_PRODUCTS.filter((p) => p.is_featured),
    "featured",
  ).slice(0, limit);
}

/** "Trending" = the best-rated, most-reviewed pieces on the floor. */
export async function fetchTrendingProducts(limit = 4): Promise<Product[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("review_count", { ascending: false })
        .order("rating", { ascending: false })
        .limit(limit);
      if (error) throw error;
      if (data && data.length > 0) return data.map(rowToProduct);
    } catch (error) {
      console.warn(
        "[products] trending query failed, using the bundled catalogue:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return [...DEMO_PRODUCTS]
    .filter((p) => p.is_active)
    .sort((a, b) => b.review_count - a.review_count || b.rating - a.rating)
    .slice(0, limit);
}

export async function fetchNewArrivals(limit = 4): Promise<Product[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      if (data && data.length > 0) return data.map(rowToProduct);
    } catch {
      // fall through to demo data
    }
  }

  return sortProducts(DEMO_PRODUCTS.filter((p) => p.is_active), "newest").slice(0, limit);
}

export async function fetchRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category", product.category)
        .neq("id", product.id)
        .order("rating", { ascending: false })
        .limit(limit);
      if (error) throw error;
      if (data && data.length > 0) return data.map(rowToProduct);
    } catch {
      // fall through to demo data
    }
  }

  return DEMO_PRODUCTS.filter(
    (p) => p.is_active && p.category === product.category && p.id !== product.id,
  )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export async function fetchPriceBounds(): Promise<{ min: number; max: number }> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("price")
        .eq("is_active", true)
        .order("price", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return {
          min: Math.floor(Number(data[0].price)),
          max: Math.ceil(Number(data[data.length - 1].price)),
        };
      }
    } catch {
      // fall through to demo data
    }
  }

  const prices = DEMO_PRODUCTS.filter((p) => p.is_active).map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices, 0)),
    max: Math.ceil(Math.max(...prices, 200)),
  };
}

export async function fetchFacetCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, 0]),
  );

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true);
      if (error) throw error;
      if (data) {
        for (const row of data) {
          if (isCategoryId(row.category)) {
            counts[row.category] = (counts[row.category] ?? 0) + 1;
          }
        }
        return counts;
      }
    } catch {
      // fall through to demo data
    }
  }

  for (const product of DEMO_PRODUCTS) {
    if (product.is_active) counts[product.category] = (counts[product.category] ?? 0) + 1;
  }
  return counts;
}

export type ProductSuggestion = {
  slug: string;
  name: string;
  tagline: string | null;
  price: number;
  compareAtPrice: number | null;
  image: string;
  category: string;
};

/** Lightweight projection used by the instant-search typeahead. */
export async function fetchProductSuggestions(
  term: string,
  limit = 6,
): Promise<ProductSuggestion[]> {
  if (!term.trim()) return [];

  const page = await fetchProducts({
    q: term,
    category: [],
    sort: "featured",
    page: 1,
    perPage: limit,
  });

  return page.products.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price: p.price,
    compareAtPrice: p.compare_at_price,
    image: p.images[0] ?? "/hero.svg",
    category: p.category,
  }));
}

export async function fetchAllProductSlugs(): Promise<
  { slug: string; created_at: string }[]
> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("slug, created_at")
        .eq("is_active", true);
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch {
      // fall through to demo data
    }
  }

  return DEMO_PRODUCTS.filter((p) => p.is_active).map((p) => ({
    slug: p.slug,
    created_at: p.created_at,
  }));
}
