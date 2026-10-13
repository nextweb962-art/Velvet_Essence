import Image from "next/image";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { ProductGrid } from "@/components/product/product-grid";
import {
  ActiveFilterChips,
  FilterSidebar,
  MobileFilterBar,
  SearchField,
  SortSelect,
} from "@/components/shop/filter-controls";
import { Pagination } from "@/components/shop/pagination";
import { buttonClasses } from "@/components/ui/button";
import { Divider, EmptyState } from "@/components/ui/primitives";
import { fetchWishlistIds } from "@/lib/account";
import { SORT_OPTIONS } from "@/lib/constants";
import { countOf } from "@/lib/format";
import { fetchFacetCounts, fetchPriceBounds, fetchProducts } from "@/lib/products";
import { getSessionUser } from "@/lib/supabase/server";
import { productQuerySchema } from "@/lib/validation";
import { CATEGORIES } from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parsed = productQuerySchema.safeParse(params);

  const selected = parsed.success ? parsed.data.category : [];
  const single = selected.length === 1 ? selected[0] : null;
  const label = single
    ? CATEGORIES.find((category) => category.id === single)?.label
    : "المتجر";

  const term = parsed.success ? parsed.data.q : "";

  return {
    title: term ? `«${term}»` : (label ?? "المتجر"),
    description: single
      ? CATEGORIES.find((category) => category.id === single)?.blurb
      : "تصفّحي كل أحمر شفاه وباليت وبلاشر وعطر وسيروم في متجر فيلفت إسنس.",
    alternates: { canonical: "/shop" },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parsed = productQuerySchema.safeParse(params);
  const query = parsed.success ? parsed.data : productQuerySchema.parse({});

  const [result, counts, bounds, wishlist, user] = await Promise.all([
    fetchProducts(query),
    fetchFacetCounts(),
    fetchPriceBounds(),
    fetchWishlistIds(),
    getSessionUser(),
  ]);

  const single =
    query.category.length === 1
      ? CATEGORIES.find((category) => category.id === query.category[0])
      : null;

  const activeSort = SORT_OPTIONS.find((option) => option.id === query.sort);
  const signedIn = Boolean(user);

  return (
    <div className="container-x pt-10 pb-20 sm:pt-14">
      {/* Header */}
      <header className="relative overflow-hidden rounded-[2.25rem] ring-1 ring-blush-200/70">
        <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-blush-100 to-rose-100" />
        {single ? (
          <Image
            src={`/collections/${
              single.id === "blush" || single.id === "eyeshadow" ? "makeup" : single.id
            }.svg`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top opacity-45"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_120%_at_12%_-10%,rgba(255,255,255,0.85),transparent_60%)]"
        />

        <div className="relative px-7 py-12 sm:px-12 sm:py-16 lg:max-w-3xl">
          <nav aria-label="مسار التنقل" className="mb-4">
            <ol className="flex items-center gap-2 text-[0.74rem] text-plum-500">
              <li>
                <Link href="/" className="transition-colors hover:text-plum-800">
                  الرئيسية
                </Link>
              </li>
              <li aria-hidden className="text-blush-400">
                /
              </li>
              <li className="text-plum-700">{single ? single.label : "المتجر"}</li>
            </ol>
          </nav>

          <h1 className="text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.15]">
            {query.q ? (
              <>
                نتائج البحث عن <span className="text-rose-700">«{query.q}»</span>
              </>
            ) : single ? (
              <>{single.label}</>
            ) : (
              <>
                كل ما هو <span className="text-rose-700">جميل</span>
              </>
            )}
          </h1>

          <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-plum-600">
            {single
              ? `${single.blurb}. فلتری حسب السعر، أو ابحثي في الكاونتر بالدرجة أو النغمة أو المكوّن.`
              : "أربع وعشرون تركيبة، وخمس عائلات، ومعيار واحد. فلتری حسب السعر أو ابحثي بالدرجة أو النغمة أو المكوّن."}
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchField className="w-full lg:max-w-md" />
        <div className="flex flex-wrap items-center gap-3">
          <MobileFilterBar counts={counts} bounds={bounds} />
          <SortSelect />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.8rem] text-plum-500" aria-live="polite">
          {result.total === 0
            ? "لا توجد قطع مطابقة"
            : countOf(result.total, "piece")}
          {activeSort && query.sort !== "featured" ? ` · ${activeSort.label}` : ""}
        </p>
      </div>

      <ActiveFilterChips />

      <Divider className="my-8" />

      {/* Results */}
      <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <FilterSidebar counts={counts} bounds={bounds} />

        <div>
          {result.products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="size-6" aria-hidden />}
              title="لا شيء هنا — بعد"
              copy="لا توجد قطع تطابق هذا المزيج. جرّبي توسيع نطاق السعر أو إزالة أحد الفلاتر."
              action={
                <Link href="/shop" className={buttonClasses("gold", "md")}>
                  أعيدي ضبط المتجر
                </Link>
              }
            />
          ) : (
            <>
              <ProductGrid
                products={result.products}
                wishlist={wishlist}
                signedIn={signedIn}
                columns={3}
                priorityCount={4}
              />
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                params={params}
              />
            </>
          )}
        </div>
      </div>

      {result.demo ? (
        <p className="mt-12 text-center text-[0.75rem] text-plum-400">
          يُعرض الكتالوج التجريبي المدمج — اربطي Supabase لعرض منتجات قاعدة البيانات.
        </p>
      ) : null}
    </div>
  );
}
