import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Presentational grid. Server-rendered so product data never crosses into the
 * client bundle — only the interactive card shell does.
 */
export function ProductGrid({
  products,
  wishlist,
  signedIn = false,
  columns = 4,
  priorityCount = 0,
  className,
}: {
  products: Product[];
  wishlist?: Set<string> | string[];
  signedIn?: boolean;
  columns?: 3 | 4;
  priorityCount?: number;
  className?: string;
}) {
  const saved = wishlist instanceof Set ? wishlist : new Set(wishlist ?? []);

  return (
    <ul
      className={cn(
        "grid gap-x-5 gap-y-8 sm:grid-cols-2",
        columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <li key={product.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
          <ProductCard
            product={product}
            wishlisted={saved.has(product.id)}
            signedIn={signedIn}
            priority={index < priorityCount}
            className="h-full"
          />
        </li>
      ))}
    </ul>
  );
}
