"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Heart, Plus } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, StarRating } from "@/components/ui/primitives";
import { cn, discountedPercent, formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS, type Product } from "@/types";

type Props = {
  product: Product;
  wishlisted?: boolean;
  signedIn?: boolean;
  priority?: boolean;
  className?: string;
  /** Lets a parent react to the toggle — the wishlist page prunes the card. */
  onWishlistChange?: (saved: boolean) => void;
};

export function ProductCard({
  product,
  wishlisted = false,
  signedIn = false,
  priority = false,
  className,
  onWishlistChange,
}: Props) {
  const { addItem, hasProduct } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [saved, setSaved] = useState(wishlisted);
  const [saving, setSaving] = useState(false);

  const discount = discountedPercent(product.price, product.compare_at_price);
  const inBag = hasProduct(product.id);
  const needsVariant = product.variant_groups.length > 0;
  const soldOut = product.stock <= 0;
  const secondImage = product.images[1] ?? product.images[0];

  async function toggleWishlist() {
    if (!signedIn) {
      toast({
        tone: "info",
        title: "سجّلي الدخول لحفظ المفضّلات",
        description: "قائمة أمنياتك مرتبطة بحسابك.",
      });
      return;
    }

    setSaving(true);
    const next = !saved;
    setSaved(next); // optimistic

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, saved: next }),
      });

      if (!response.ok) throw new Error(`فشل الطلب (${response.status})`);

      onWishlistChange?.(next);
      toast({
        title: next ? "حُفظت في قائمة الأمنيات" : "أُزيلت من قائمة الأمنيات",
        description: product.name,
      });
    } catch (error) {
      setSaved(!next); // roll back
      toast({
        tone: "error",
        title: "تعذّر تحديث قائمة الأمنيات",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-4xl bg-white/70",
        "ring-1 ring-blush-200/80 backdrop-blur-sm",
        "transition-all duration-500 ease-[var(--ease-silk)]",
        "hover:-translate-y-1 hover:bg-white hover:shadow-lift hover:ring-blush-300",
        className,
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-4/5 overflow-hidden bg-cream-200"
        aria-label={product.name}
      >
        <Image
          src={product.images[0] ?? "/hero.svg"}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
          className={cn(
            "object-cover transition-all duration-700 ease-[var(--ease-silk)]",
            "group-hover:scale-[1.04] group-hover:opacity-0",
          )}
        />
        <Image
          src={secondImage}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
          className="object-cover opacity-0 transition-all duration-700 ease-[var(--ease-silk)] group-hover:scale-[1.04] group-hover:opacity-100"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
          <span className="flex flex-col items-start gap-1.5">
            {product.badge ? (
              <Badge tone={product.badge === "إصدار محدود" ? "plum" : "gold"}>
                {product.badge}
              </Badge>
            ) : null}
            {discount ? <Badge tone="rose">خصم {discount}%</Badge> : null}
            {soldOut ? <Badge tone="plum">نفدت الكمية</Badge> : null}
          </span>
        </div>

        {product.variant_groups[0]?.display === "swatch" ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-3.5">
            {product.variant_groups[0].options.slice(0, 6).map((option) => (
              <span
                key={option.id}
                title={option.name}
                aria-hidden
                className="size-3.5 rounded-full ring-1 ring-white/90 ring-offset-1 ring-offset-black/5"
                style={{ background: option.hex ?? "#E5A3A8" }}
              />
            ))}
            {product.variant_groups[0].options.length > 6 ? (
              <span className="text-[0.6rem] text-plum-600">
                +{product.variant_groups[0].options.length - 6}
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>

      {/* Floating actions */}
      <div className="absolute top-3.5 end-3.5 flex flex-col gap-2">
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={saving}
          aria-label={
            saved
              ? `إزالة ${product.name} من قائمة الأمنيات`
              : `أضيفي ${product.name} إلى قائمة الأمنيات`
          }
          aria-pressed={saved}
          className={cn(
            "flex size-9 items-center justify-center rounded-full backdrop-blur transition-all duration-300",
            saved
              ? "bg-rose-600 text-white shadow-glow"
              : "bg-white/80 text-plum-600 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-rose-700 focus-visible:opacity-100 max-lg:opacity-100",
          )}
        >
          <Heart className={cn("size-4", saved && "fill-current")} aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="eyebrow text-[0.62rem] text-rose-600">
          {CATEGORY_LABELS[product.category]}
          {product.collection ? ` · ${product.collection}` : ""}
        </p>

        <h3 className="mt-2 text-[1.05rem] leading-snug">
          <Link
            href={`/product/${product.slug}`}
            className="transition-colors hover:text-rose-700"
          >
            {product.name}
          </Link>
        </h3>

        {product.tagline ? (
          <p className="mt-1 line-clamp-1 text-[0.75rem] text-plum-400">
            {product.tagline}
          </p>
        ) : null}

        <StarRating
          className="mt-2.5"
          rating={product.rating}
          count={product.review_count}
          size={12}
        />

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[1.02rem] font-medium text-plum-900">
              {formatPrice(product.price, { compact: true })}
            </span>
            {product.compare_at_price ? (
              <span className="text-[0.76rem] text-plum-400 line-through">
                {formatPrice(product.compare_at_price, { compact: true })}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              // Products with options need a choice first — send the shopper to
              // the detail page rather than guessing a shade.
              if (needsVariant) {
                router.push(`/product/${product.slug}`);
                return;
              }
              addItem({ product });
            }}
            className={cn(
              "relative flex size-9 items-center justify-center rounded-full transition-all duration-300",
              "disabled:cursor-not-allowed disabled:opacity-40",
              inBag
                ? "bg-sage-400/30 text-sage-600 ring-1 ring-sage-400/50"
                : "bg-plum-800 text-cream-100 hover:bg-rose-600 hover:shadow-glow",
            )}
            aria-label={
              needsVariant
                ? `اختاري الخيارات لـ${product.name}`
                : `أضيفي ${product.name} إلى السلة`
            }
          >
            {inBag ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
