"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useProductFilters } from "@/components/shop/use-product-filters";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { CATEGORIES } from "@/types";

export function SearchField({ className }: { className?: string }) {
  const { query, setQuery, isPending } = useProductFilters();
  const [value, setValue] = useState(query);

  /* Keep the field in step with back/forward navigation. */
  useEffect(() => setValue(query), [query]);

  /* Debounced commit so typing does not fire a request per keystroke. */
  useEffect(() => {
    if (value === query) return;
    const id = window.setTimeout(() => setQuery(value), 320);
    return () => window.clearTimeout(id);
  }, [value, query, setQuery]);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-plum-400"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="ابحثي في المتجر…"
        aria-label="البحث عن منتجات"
        className="ps-10"
      />
      {isPending ? (
        <span
          aria-hidden
          className="absolute top-1/2 end-3.5 size-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-blush-300 border-t-transparent"
        />
      ) : value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="مسح البحث"
          className="absolute top-1/2 end-3 -translate-y-1/2 rounded-full p-1 text-plum-400 transition-colors hover:bg-blush-100 hover:text-plum-700"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function SortSelect({ className }: { className?: string }) {
  const { sort, setSort } = useProductFilters();

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <label
        htmlFor="sort"
        className="hidden text-[0.75rem] text-plum-400 sm:block"
      >
        الترتيب
      </label>
      <Select
        id="sort"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        className="h-10 w-auto min-w-48 rounded-full text-[0.82rem]"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function PriceRange({ bounds }: { bounds: { min: number; max: number } }) {
  const { min, max, setPriceRange } = useProductFilters();
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  useEffect(() => setLocalMin(min), [min]);
  useEffect(() => setLocalMax(max), [max]);

  useEffect(() => {
    if (localMin === min && localMax === max) return;
    const id = window.setTimeout(() => setPriceRange(localMin, localMax), 420);
    return () => window.clearTimeout(id);
  }, [localMin, localMax, min, max, setPriceRange]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="من" htmlFor="filter-min">
          <Input
            id="filter-min"
            type="number"
            inputMode="numeric"
            min={0}
            dir="ltr"
            placeholder={String(bounds.min)}
            value={localMin}
            onChange={(event) => setLocalMin(event.target.value)}
            className="h-10 text-start text-[0.82rem]"
          />
        </Field>
        <Field label="إلى" htmlFor="filter-max">
          <Input
            id="filter-max"
            type="number"
            inputMode="numeric"
            min={0}
            dir="ltr"
            placeholder={String(bounds.max)}
            value={localMax}
            onChange={(event) => setLocalMax(event.target.value)}
            className="h-10 text-start text-[0.82rem]"
          />
        </Field>
      </div>
      <p className="text-[0.72rem] text-plum-400">
        أسعار الدار من {formatPrice(bounds.min, { compact: true })} إلى{" "}
        {formatPrice(bounds.max, { compact: true })}
      </p>
    </div>
  );
}

function FilterGroups({
  counts,
  bounds,
}: {
  counts: Record<string, number>;
  bounds: { min: number; max: number };
}) {
  const { selectedCategories, toggleCategory, clearAll, activeCount } =
    useProductFilters();

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="eyebrow text-plum-600">الفلاتر</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-[0.75rem] text-rose-700 underline decoration-rose-300 underline-offset-4 transition-colors hover:decoration-rose-700"
          >
            مسح الكل
          </button>
        ) : null}
      </div>

      <fieldset className="mt-6">
        <legend className="eyebrow mb-3.5 text-plum-400">الفئة</legend>
        <ul className="space-y-1">
          {CATEGORIES.map((category) => {
            const count = counts[category.id] ?? 0;
            const checked = selectedCategories.has(category.id);
            return (
              <li key={category.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors",
                    checked ? "bg-blush-100/90" : "hover:bg-blush-50",
                    count === 0 && "opacity-45",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span className="flex-1 text-[0.85rem] text-plum-700">
                    {category.label}
                  </span>
                  <span className="num text-[0.72rem] text-plum-400">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="hairline my-6" />

      <fieldset>
        <legend className="eyebrow mb-3.5 text-plum-400">السعر</legend>
        <PriceRange bounds={bounds} />
      </fieldset>
    </>
  );
}

export function FilterSidebar({
  counts,
  bounds,
  className,
}: {
  counts: Record<string, number>;
  bounds: { min: number; max: number };
  className?: string;
}) {
  return (
    <aside className={cn("hidden lg:block", className)} aria-label="فلاتر المنتجات">
      <div className="glass sticky top-24 rounded-4xl p-6">
        <FilterGroups counts={counts} bounds={bounds} />
      </div>
    </aside>
  );
}

/** Mobile equivalent — a slide-up sheet driven by a disclosure button. */
export function MobileFilterBar({
  counts,
  bounds,
}: {
  counts: Record<string, number>;
  bounds: { min: number; max: number };
}) {
  const [open, setOpen] = useState(false);
  const { activeCount, clearAll } = useProductFilters();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="flex items-center gap-2.5 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2"
          aria-expanded={open}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          الفلاتر
          {activeCount > 0 ? (
            <span className="num flex size-5 items-center justify-center rounded-full bg-rose-600 text-[0.6rem] text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-[0.78rem] text-rose-700 underline decoration-rose-300 underline-offset-4"
          >
            مسح
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[78] lg:hidden">
          <button
            type="button"
            aria-label="إغلاق الفلاتر"
            onClick={() => setOpen(false)}
            className="animate-fade-in absolute inset-0 cursor-default bg-plum-900/40 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-[2rem] bg-cream-100 p-6 shadow-lift">
            <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-blush-300" />
            <FilterGroups counts={counts} bounds={bounds} />
            <Button
              variant="primary"
              size="lg"
              className="mt-7 w-full"
              onClick={() => setOpen(false)}
            >
              عرض النتائج
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ActiveFilterChips() {
  const {
    selectedCategories,
    min,
    max,
    query,
    sort,
    toggleCategory,
    setQuery,
    setSort,
    setPriceRange,
  } = useProductFilters();

  const chips: { key: string; label: string; onRemove(): void }[] = [];

  if (query) {
    chips.push({ key: "q", label: `«${query}»`, onRemove: () => setQuery("") });
  }
  for (const id of selectedCategories) {
    const category = CATEGORIES.find((c) => c.id === id);
    if (!category) continue;
    chips.push({
      key: `category-${id}`,
      label: category.label,
      onRemove: () => toggleCategory(id),
    });
  }
  if (min || max) {
    chips.push({
      key: "price",
      label: `${min ? formatPrice(Number(min), { compact: true }) : "أي سعر"} – ${
        max ? formatPrice(Number(max), { compact: true }) : "أي سعر"
      }`,
      onRemove: () => setPriceRange("", ""),
    });
  }
  if (sort !== "featured") {
    const option = SORT_OPTIONS.find((o) => o.id === sort);
    if (option) {
      chips.push({ key: "sort", label: option.label, onRemove: () => setSort("featured") });
    }
  }

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.onRemove}
            className="group inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[0.78rem] text-plum-600 ring-1 ring-blush-200 transition-all hover:bg-white hover:text-plum-900 hover:ring-rose-300"
          >
            {chip.label}
            <X
              className="size-3 text-plum-400 transition-colors group-hover:text-rose-700"
              aria-hidden
            />
            <span className="sr-only">إزالة الفلتر</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
