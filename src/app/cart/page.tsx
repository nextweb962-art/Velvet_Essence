"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { buttonClasses } from "@/components/ui/button";
import { Divider, EmptyState } from "@/components/ui/primitives";
import { COMMERCE } from "@/lib/constants";
import { countOf } from "@/lib/format";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { lines, totals, hydrated, setQuantity, removeItem, clear } = useCart();

  if (hydrated && lines.length === 0) {
    return (
      <div className="container-x pt-14 pb-20">
        <EmptyState
          icon={<ShoppingBag className="size-6" aria-hidden />}
          title="سلّتك فارغة"
          copy="لا شيء هنا بعد. ابدئي بأحمر شفاه مخملي أو بعطر الدار."
          action={
            <Link href="/shop" className={buttonClasses("gold", "md")}>
              تصفّحي المتجر
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-x pt-10 pb-20 sm:pt-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-rose-600">سلّتك</p>
          <h1 className="mt-3 text-[clamp(1.7rem,3.8vw,2.4rem)] leading-tight">
            {hydrated ? countOf(totals.itemCount, "piece") : "جارٍ التحميل…"}
          </h1>
        </div>
        {lines.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-[0.78rem] text-plum-500 underline decoration-blush-300 underline-offset-4 transition-colors hover:text-rose-800"
          >
            إفراغ السلة
          </button>
        ) : null}
      </header>

      <Divider className="my-8" />

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <ul className="space-y-6">
          {lines.map((line) => (
            <li
              key={line.key}
              className="glass flex flex-wrap gap-5 rounded-4xl p-5 sm:flex-nowrap"
            >
              <Link
                href={`/product/${line.slug}`}
                className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-cream-200 ring-1 ring-blush-200"
              >
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-48 flex-1 flex-col">
                <Link
                  href={`/product/${line.slug}`}
                  className="text-[0.95rem] font-medium text-plum-800 transition-colors hover:text-rose-700"
                >
                  {line.name}
                </Link>
                {line.optionName ? (
                  <p className="mt-1 flex items-center gap-2 text-[0.75rem] text-plum-400">
                    {line.optionHex ? (
                      <span
                        aria-hidden
                        className="size-3 rounded-full ring-1 ring-black/10"
                        style={{ background: line.optionHex }}
                      />
                    ) : null}
                    {line.groupLabel}: {line.optionName}
                  </p>
                ) : null}
                <p className="mt-2 text-[0.82rem] text-plum-500">
                  {formatPrice(line.unitPrice)} للقطعة
                </p>

                <div className="mt-auto flex items-center gap-4 pt-4">
                  <div className="inline-flex items-center rounded-full border border-blush-200 bg-white/70">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.key, line.quantity - 1)}
                      aria-label={`تقليل كمية ${line.name}`}
                      className="flex size-9 items-center justify-center rounded-full text-plum-600 transition-colors hover:bg-blush-100"
                    >
                      <Minus className="size-3.5" aria-hidden />
                    </button>
                    <span className="num min-w-7 text-center text-[0.85rem] text-plum-800">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={line.quantity >= line.maxQuantity}
                      onClick={() => setQuantity(line.key, line.quantity + 1)}
                      aria-label={`زيادة كمية ${line.name}`}
                      className="flex size-9 items-center justify-center rounded-full text-plum-600 transition-colors hover:bg-blush-100 disabled:opacity-35"
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(line.key)}
                    className="flex items-center gap-1.5 text-[0.75rem] text-plum-400 transition-colors hover:text-rose-800"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    إزالة
                  </button>
                </div>
              </div>

              <p className="ms-auto shrink-0 font-display text-xl text-plum-900">
                {formatPrice(line.unitPrice * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass rounded-4xl p-6">
            <h2 className="text-lg">الملخّص</h2>

            {!totals.qualifiesForFreeShipping ? (
              <p className="mt-4 flex items-center gap-2.5 text-[0.78rem] text-plum-500">
                <Truck className="size-3.5 shrink-0 text-rose-500" aria-hidden />
                أضيفي {formatPrice(totals.freeShippingGap)} للتوصيل المجاني
              </p>
            ) : (
              <p className="mt-4 flex items-center gap-2.5 text-[0.78rem] text-sage-600">
                <Truck className="size-3.5 shrink-0" aria-hidden />
                التوصيل المجاني مُطبَّق
              </p>
            )}

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-blush-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-gold-500 transition-[width] duration-700"
                style={{
                  width: `${Math.min(100, Math.round((totals.subtotal / COMMERCE.freeShippingThreshold) * 100))}%`,
                }}
              />
            </div>

            <dl className="mt-6 space-y-2.5 text-[0.85rem]">
              <div className="flex justify-between">
                <dt className="text-plum-500">المجموع الفرعي</dt>
                <dd className="num text-plum-800">{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discountTotal > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-sage-600">الخصم</dt>
                  <dd className="num text-sage-600">
                    −{formatPrice(totals.discountTotal)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-plum-500">التوصيل</dt>
                <dd className="num text-plum-800">
                  {totals.shipping === 0 ? (
                    <span className="text-sage-600">مجاني</span>
                  ) : (
                    formatPrice(totals.shipping)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-plum-500">الضريبة التقديرية</dt>
                <dd className="num text-plum-800">{formatPrice(totals.tax)}</dd>
              </div>
            </dl>

            <Divider className="my-5" />

            <div className="flex items-baseline justify-between">
              <span className="text-[0.82rem] text-plum-600">الإجمالي</span>
              <span className="font-display text-2xl text-plum-900">
                {formatPrice(totals.total)}
              </span>
            </div>

            <Link href="/checkout" className={buttonClasses("gold", "lg", "mt-6 w-full")}>
              إتمام الطلب
            </Link>

            <Link
              href="/shop"
              className="mt-3 block w-full text-center text-[0.78rem] text-plum-500 underline decoration-blush-300 underline-offset-4 transition-colors hover:text-plum-800"
            >
              متابعة التسوّق
            </Link>

            <p className="mt-5 text-center text-[0.72rem] text-plum-400">
              {COMMERCE.paymentLabel} · تُطبَّق رموز الخصم عند الدفع
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
