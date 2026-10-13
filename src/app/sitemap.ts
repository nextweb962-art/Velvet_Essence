import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";
import { CATEGORIES } from "@/types";
import { fetchAllProductSlugs } from "@/lib/products";

/**
 * Product URLs come from the live catalogue when Supabase is configured, and
 * from the bundled catalogue otherwise — so the sitemap is never empty.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchAllProductSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE.url}/shop?category=${category.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE.url}/product/${product.slug}`,
    lastModified: new Date(product.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
