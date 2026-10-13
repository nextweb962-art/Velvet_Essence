"use client";

import { useCallback, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Client wrapper for the wishlist page.
 *
 * Un-saving a piece prunes it from the grid immediately, so the page always
 * reflects what is actually saved without a full round-trip.
 */
export function WishlistGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const handleChange = useCallback((productId: string, saved: boolean) => {
    setRemoved((current) => {
      const next = new Set(current);
      if (saved) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const visible = products.filter((product) => !removed.has(product.id));

  return (
    <ul
      className={cn(
        "grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {visible.map((product, index) => (
        <li
          key={product.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
        >
          <ProductCard
            product={product}
            wishlisted
            signedIn
            priority={index < 3}
            className="h-full"
            onWishlistChange={(saved) => handleChange(product.id, saved)}
          />
        </li>
      ))}
    </ul>
  );
}
