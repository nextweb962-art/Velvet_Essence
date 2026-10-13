"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import { CATEGORIES, type CategoryId } from "@/types";

type Updates = Record<string, string | string[] | null>;

/**
 * Filter state lives entirely in the URL.
 *
 * That keeps every filtered view shareable, back-button friendly, crawlable and
 * server-renderable — no duplicated client-side catalogue, no hydration drift.
 */
export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const push = useCallback(
    (updates: Updates, options: { keepPage?: boolean } = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        next.delete(key);
        if (Array.isArray(value)) {
          for (const entry of value) next.append(key, entry);
        } else if (value !== null && value !== "") {
          next.set(key, value);
        }
      }

      // Any change to the result set invalidates the current page number.
      if (!options.keepPage) next.delete("page");

      const query = next.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const selectedCategories = useMemo(() => {
    const raw = searchParams.getAll("category");
    const valid = raw.filter((value): value is CategoryId =>
      CATEGORIES.some((category) => category.id === value),
    );
    return new Set(valid);
  }, [searchParams]);

  const query = searchParams.get("q")?.trim() ?? "";
  const min = searchParams.get("min") ?? "";
  const max = searchParams.get("max") ?? "";
  const sort = searchParams.get("sort") ?? "featured";

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      const next = new Set(selectedCategories);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      push({ category: Array.from(next) });
    },
    [push, selectedCategories],
  );

  const setPriceRange = useCallback(
    (nextMin: string, nextMax: string) => {
      push({ min: nextMin || null, max: nextMax || null });
    },
    [push],
  );

  const setSort = useCallback((value: string) => push({ sort: value }), [push]);

  const setQuery = useCallback((value: string) => push({ q: value || null }), [push]);

  const clearAll = useCallback(() => {
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [pathname, router]);

  const activeCount =
    selectedCategories.size +
    (min ? 1 : 0) +
    (max ? 1 : 0) +
    (query ? 1 : 0) +
    (sort !== "featured" ? 1 : 0);

  return {
    isPending,
    query,
    min,
    max,
    sort,
    selectedCategories,
    activeCount,
    toggleCategory,
    setPriceRange,
    setSort,
    setQuery,
    clearAll,
    push,
  };
}
