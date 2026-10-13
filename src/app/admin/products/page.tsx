import Image from "next/image";
import Link from "next/link";
import { Package, Plus } from "lucide-react";

import { ProductRowActions } from "@/components/admin/row-actions";
import { buttonClasses } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { fetchAdminProducts } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { formatNumber, formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";

export const metadata = {
  title: "المنتجات",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, products] = await Promise.all([
    searchParams,
    fetchAdminProducts(),
  ]);

  const live = products.filter((product) => product.is_active).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="text-xl">المنتجات</h2>
          <p className="mt-1.5 text-[0.85rem] text-plum-500">
            <span className="num">{formatNumber(products.length)}</span> في الكتالوج ·{" "}
            <span className="num">{formatNumber(live)}</span> منشورة ·{" "}
            <span className="num">{formatNumber(products.length - live)}</span> مسودة
          </p>
        </div>
        <Link href="/admin/products/new" className={buttonClasses("gold", "md")}>
          <Plus className="size-4" aria-hidden />
          إضافة منتج
        </Link>
      </header>

      {saved === "1" ? (
        <p
          role="status"
          className="rounded-2xl bg-sage-400/20 px-4 py-3 text-[0.85rem] text-sage-600"
        >
          تم حفظ المنتج.
        </p>
      ) : null}

      {!isSupabaseConfigured ? (
        <p className="rounded-2xl border border-gold-300 bg-gold-200/50 px-4 py-3 text-[0.85rem] text-plum-600">
          وضع تجريبي: تُعرض المنتجات من الكتالوج المدمج ولا يمكن تعديلها حتى يتم ربط
          Supabase.
        </p>
      ) : null}

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" aria-hidden />}
          title="لا توجد منتجات بعد"
          copy="أضيفي قطعتك الأولى، أو شغّلي supabase/seed.sql لتحميل كتالوج الدار."
          action={
            <Link href="/admin/products/new" className={buttonClasses("gold", "md")}>
              إضافة منتج
            </Link>
          }
        />
      ) : (
        <div className="glass overflow-hidden rounded-4xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-start">
              <caption className="sr-only">منتجات الكتالوج</caption>
              <thead>
                <tr className="border-b border-blush-200 text-[0.7rem] text-plum-400">
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    القطعة
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    الفئة
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    السعر
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    المخزون
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    الحالة
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-end font-medium">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush-200/60">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-white/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-cream-200 ring-1 ring-blush-200">
                          <Image
                            src={product.images[0] ?? "/hero.svg"}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0">
                          <Link
                            href={`/product/${product.slug}`}
                            className="block max-w-56 truncate text-[0.85rem] font-medium text-plum-800 transition-colors hover:text-rose-700"
                          >
                            {product.name}
                          </Link>
                          <span className="latin block max-w-56 truncate text-[0.7rem] text-plum-400">
                            /{product.slug}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[0.82rem] text-plum-600">
                      {CATEGORY_LABELS[product.category]}
                      {product.collection ? (
                        <span className="block text-[0.72rem] text-plum-400">
                          {product.collection}
                        </span>
                      ) : null}
                    </td>
                    <td className="num px-5 py-3.5 text-[0.82rem] text-plum-700">
                      {formatPrice(product.price, { compact: true })}
                      {product.compare_at_price ? (
                        <span className="num block text-[0.7rem] text-plum-400 line-through">
                          {formatPrice(product.compare_at_price, { compact: true })}
                        </span>
                      ) : null}
                    </td>
                    <td className="num px-5 py-3.5">
                      <span
                        className={
                          product.stock <= 0
                            ? "text-[0.82rem] text-rose-800"
                            : product.stock <= 10
                              ? "text-[0.82rem] text-gold-600"
                              : "text-[0.82rem] text-plum-700"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex flex-wrap gap-1.5">
                        <Badge tone={product.is_active ? "sage" : "cream"}>
                          {product.is_active ? "منشور" : "مسودة"}
                        </Badge>
                        {product.is_featured ? <Badge tone="gold">مميّز</Badge> : null}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ProductRowActions
                        id={product.id}
                        name={product.name}
                        isActive={product.is_active}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
