"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/providers/cart-provider";
import { Button, buttonClasses } from "@/components/ui/button";
import { Divider } from "@/components/ui/primitives";
import { COMMERCE } from "@/lib/constants";
import { countOf } from "@/lib/format";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const {
    lines,
    totals,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    isSyncing,
    hydrated,
  } = useCart();

  const empty = lines.length === 0;
  const progress = Math.min(
    100,
    Math.round((totals.subtotal / COMMERCE.freeShippingThreshold) * 100),
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-[75]",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      {/* Scrim */}
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="إغلاق السلة"
        onClick={closeCart}
        className={cn(
          "absolute inset-0 cursor-default bg-plum-900/40 backdrop-blur-sm transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/*
        The panel is anchored to the inline end (the left edge in RTL) and slid
        out with a negative X translation — physical transforms do not mirror,
        so the direction is written for the RTL-only document.
      */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة التسوق"
        className={cn(
          "absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-cream-100 shadow-lift",
          "transition-transform duration-500 ease-[var(--ease-silk)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <header className="flex h-18 shrink-0 items-center justify-between border-b border-blush-200 px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-[1.1rem] text-rose-600" aria-hidden />
            <h2 className="text-lg">
              سلّتك
              {hydrated && totals.itemCount > 0 ? (
                <span className="ms-2 align-middle text-[0.72rem] text-plum-400">
                  {countOf(totals.itemCount, "piece")}
                </span>
              ) : null}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {isSyncing ? (
              <span
                title="جارٍ المزامنة مع حسابك"
                className="me-1 flex items-center gap-1.5 rounded-full bg-blush-100 px-2.5 py-1 text-[0.62rem] text-plum-500"
              >
                <Loader2 className="size-3 animate-spin" aria-hidden />
                مزامنة
              </span>
            ) : null}
            <button
              type="button"
              onClick={closeCart}
              aria-label="إغلاق السلة"
              className="rounded-full p-2 text-plum-600 transition-colors hover:bg-blush-100 hover:text-plum-900"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </header>

        {!empty ? (
          <div className="shrink-0 border-b border-blush-200 bg-white/50 px-5 py-3 sm:px-6">
            {totals.qualifiesForFreeShipping ? (
              <p className="flex items-center gap-2 text-[0.78rem] text-sage-600">
                <Truck className="size-3.5" aria-hidden />
                حصلتِ على التوصيل المجاني
              </p>
            ) : (
              <p className="flex items-center gap-2 text-[0.78rem] text-plum-500">
                <Truck className="size-3.5 shrink-0 text-rose-500" aria-hidden />
                <span>
                  أضيفي{" "}
                  <strong className="font-medium text-plum-700">
                    {formatPrice(totals.freeShippingGap)}
                  </strong>{" "}
                  لتحصلي على التوصيل المجاني
                </span>
              </p>
            )}
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-blush-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-gold-500 transition-[width] duration-700 ease-[var(--ease-silk)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          {!hydrated ? (
            <ul className="space-y-4">
              {[0, 1].map((i) => (
                <li key={i} className="flex gap-4">
                  <div className="size-24 shrink-0 animate-shimmer rounded-2xl bg-blush-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-2/3 animate-shimmer rounded-full bg-blush-100" />
                    <div className="h-3 w-1/3 animate-shimmer rounded-full bg-blush-100" />
                  </div>
                </li>
              ))}
            </ul>
          ) : empty ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-blush-100 text-rose-500">
                <ShoppingBag className="size-6" aria-hidden />
              </span>
              <div>
                <p className="font-display text-xl text-plum-800">سلّتك تنتظرك</p>
                <p className="mt-1.5 text-[0.82rem] text-plum-500">
                  املئيها بشيء جميل.
                </p>
              </div>
              <Button
                variant="gold"
                onClick={() => {
                  closeCart();
                  router.push("/shop");
                }}
              >
                تصفّحي المتجر
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => (
                <li key={line.key} className="animate-fade-in flex gap-4">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={closeCart}
                    className="group relative size-24 shrink-0 overflow-hidden rounded-2xl bg-cream-200 ring-1 ring-blush-200"
                  >
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-silk)] group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${line.slug}`}
                          onClick={closeCart}
                          className="block truncate text-[0.88rem] font-medium text-plum-800 transition-colors hover:text-rose-700"
                        >
                          {line.name}
                        </Link>
                        {line.optionName ? (
                          <p className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-plum-400">
                            {line.optionHex ? (
                              <span
                                aria-hidden
                                className="size-2.5 rounded-full ring-1 ring-black/10"
                                style={{ background: line.optionHex }}
                              />
                            ) : null}
                            {line.groupLabel}: {line.optionName}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.key)}
                        aria-label={`إزالة ${line.name}`}
                        className="rounded-full p-1.5 text-plum-400 transition-colors hover:bg-rose-100 hover:text-rose-800"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-full border border-blush-200 bg-white/70">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          aria-label={`تقليل كمية ${line.name}`}
                          className="flex size-8 items-center justify-center rounded-full text-plum-600 transition-colors hover:bg-blush-100 disabled:opacity-40"
                        >
                          <Minus className="size-3.5" aria-hidden />
                        </button>
                        <span
                          aria-live="polite"
                          className="num min-w-6 text-center text-[0.82rem] text-plum-800"
                        >
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={line.quantity >= line.maxQuantity}
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          aria-label={`زيادة كمية ${line.name}`}
                          className="flex size-8 items-center justify-center rounded-full text-plum-600 transition-colors hover:bg-blush-100 disabled:opacity-40"
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                      </div>

                      <p className="text-[0.88rem] font-medium text-plum-800">
                        {formatPrice(line.unitPrice * line.quantity)}
                      </p>
                    </div>

                    {line.quantity >= line.maxQuantity ? (
                      <p className="mt-2 text-[0.7rem] text-rose-700">
                        المتوفر {line.maxQuantity} فقط
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hydrated && !empty ? (
          <footer className="shrink-0 border-t border-blush-200 bg-white/60 px-5 py-5 sm:px-6">
            <dl className="space-y-2 text-[0.85rem]">
              <div className="flex justify-between">
                <dt className="text-plum-500">المجموع الفرعي</dt>
                <dd className="num text-plum-800">{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discountTotal > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-sage-600">
                    الخصم{totals.discountCode ? ` (${totals.discountCode})` : ""}
                  </dt>
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

            <Divider className="my-4" />

            <div className="flex items-baseline justify-between">
              <span className="text-[0.82rem] text-plum-600">الإجمالي</span>
              <span className="font-display text-2xl text-plum-900">
                {formatPrice(totals.total)}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className={buttonClasses("gold", "lg", "mt-5 w-full")}
            >
              إتمام الطلب
            </Link>

            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full text-center text-[0.78rem] text-plum-500 underline decoration-blush-300 underline-offset-4 transition-colors hover:text-plum-800"
            >
              متابعة التسوّق
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
