"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button, buttonClasses } from "@/components/ui/button";
import { Badge, Divider, StarRating } from "@/components/ui/primitives";
import { COMMERCE } from "@/lib/constants";
import { cn, discountedPercent, formatNumber, formatPrice } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type Product,
  type VariantGroup,
  type VariantOption,
} from "@/types";

const ASSURANCES = [
  { icon: Truck, label: `توصيل مجاني على الطلبات فوق ${COMMERCE.freeShippingThreshold} د.أ` },
  { icon: Wallet, label: COMMERCE.paymentLabel },
  { icon: RefreshCcw, label: "إرجاع خلال ٣٠ يوماً بلا أسئلة" },
  { icon: ShieldCheck, label: "أصالة مضمونة" },
];

const HOW_TO: Record<Product["category"], string> = {
  fragrance:
    "رشّي العطر على نقاط النبض — الرسغان، والعنق، وخلف الأذنين — من مسافة ١٥ سم. تجنّبي الفرك: الاحتكاك يسحق الإفتتاحية ويقصّر من ثبات العطر.",
  skincare:
    "طبّقيه على بشرة نظيفة ورطبة قليلاً صباحاً ومساءً. اضغطي بلطف بدل الفرك، ثم اختمي بكريم بيوني. أدخليه تدريجياً إن كانت بشرتك حساسة.",
  lipstick:
    "اكتشفي الكمية بطبقات رقيقة ويد خفيفة. للحصول على لمسة موزّعة، طبّقي اللون بأطراف أصابعك؛ ولتغطية كاملة، اضغطي ودحرجي بالفرشاة.",
  eyeshadow:
    "ابدئي بدرجة وسطى على كامل الجفن المتحرك، ثم عمّقي الزاوية الخارجية بدرجة أغمق، واختمي بلمسة لامعة في وسط الجفن. بلّلي الفرشاة للمعدني.",
  blush:
    "ارسمي خطاً خفيفاً على أعلى الوجنة وادمجيه للأعلى نحو الصدغ. للون أكثر كثافة، طبّقي طبقة ثانية بعد أن تستقرّ الأولى.",
};

export function ProductDetail({
  product,
  wishlisted,
  signedIn,
}: {
  product: Product;
  wishlisted: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const primaryGroup: VariantGroup | null = product.variant_groups[0] ?? null;

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    if (!primaryGroup) return {};
    // Pre-select the most available option so the page is never in a dead end.
    const best =
      [...primaryGroup.options].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))[0] ??
      primaryGroup.options[0];
    return { [primaryGroup.id]: best.id };
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(wishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>("details");

  const selectedOption: VariantOption | null = useMemo(() => {
    if (!primaryGroup) return null;
    const id = selection[primaryGroup.id];
    return primaryGroup.options.find((option) => option.id === id) ?? null;
  }, [primaryGroup, selection]);

  const unitPrice = product.price + (selectedOption?.priceDelta ?? 0);
  const compareAt =
    product.compare_at_price !== null
      ? product.compare_at_price + (selectedOption?.priceDelta ?? 0)
      : null;
  const discount = discountedPercent(unitPrice, compareAt);

  const available =
    typeof selectedOption?.stock === "number" ? selectedOption.stock : product.stock;
  const soldOut = available <= 0;
  const maxQuantity = Math.max(1, Math.min(available, COMMERCE.maxQuantityPerLine));

  /* The gallery follows the chosen variant. */
  const gallery = useMemo(() => {
    const images = [...product.images];
    if (selectedOption?.image && !images.includes(selectedOption.image)) {
      images.unshift(selectedOption.image);
    } else if (selectedOption?.image) {
      const index = images.indexOf(selectedOption.image);
      if (index > 0) {
        images.splice(index, 1);
        images.unshift(selectedOption.image);
      }
    }
    return images;
  }, [product.images, selectedOption?.image]);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [selectedOption?.id]);

  useEffect(() => {
    if (quantity > maxQuantity) setQuantity(maxQuantity);
  }, [maxQuantity, quantity]);

  function handleAdd(goToCheckout = false) {
    if (soldOut) return;

    addItem({
      product,
      groupId: primaryGroup?.id ?? null,
      optionId: selectedOption?.id ?? null,
      quantity,
      silent: goToCheckout,
    });

    if (goToCheckout) router.push("/checkout");
  }

  async function toggleWishlist() {
    if (!signedIn) {
      toast({
        tone: "info",
        title: "سجّلي الدخول لحفظ المفضّلات",
        description: "قائمة أمنياتك تتبع حسابك.",
      });
      router.push(`/login?redirectTo=/product/${product.slug}`);
      return;
    }

    const next = !saved;
    setSavingWishlist(true);
    setSaved(next);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, saved: next }),
      });
      if (!response.ok) throw new Error(`فشل الطلب (${response.status})`);

      toast({
        title: next ? "حُفظت في قائمة الأمنيات" : "أُزيلت من قائمة الأمنيات",
        description: product.name,
      });
    } catch (error) {
      setSaved(!next);
      toast({
        tone: "error",
        title: "تعذّر تحديث قائمة الأمنيات",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSavingWishlist(false);
    }
  }

  const panels = [
    { id: "details", label: "التفاصيل", body: product.description },
    { id: "how-to", label: "طريقة الاستخدام", body: HOW_TO[product.category] },
    {
      id: "ingredients",
      label: "المكوّنات والعناية",
      body: `${
        product.tags.length > 0 ? `أبرز ما فيها: ${product.tags.join("، ")}. ` : ""
      }خالية من التلك والبارابين والزيوت المعدنية واللدائن الدقيقة. غير مختبرة على الحيوانات مطلقاً. احفظيها بعيداً عن أشعة الشمس المباشرة والحرارة.`,
    },
    {
      id: "shipping",
      label: "الشحن والإرجاع",
      body: `يُجهَّز الطلب خلال يوم عمل واحد من الأتيليه. التوصيل مجاني على الطلبات فوق ${formatPrice(
        COMMERCE.freeShippingThreshold,
        { compact: true },
      )}، وإلا ${formatPrice(COMMERCE.flatShippingRate)}. التوصيل السريع متاح عند الدفع. يمكنك إرجاع أي منتج غير مفتوح خلال ٣٠ يوماً.`,
    },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-4/5 overflow-hidden rounded-[2.25rem] bg-cream-200 ring-1 ring-blush-200/80">
          {gallery.map((image, index) => (
            <Image
              key={`${image}-${index}`}
              src={image}
              alt={`${product.name}${selectedOption ? ` بدرجة ${selectedOption.name}` : ""} — صورة ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 92vw, 46vw"
              className={cn(
                "object-cover transition-opacity duration-700 ease-[var(--ease-silk)]",
                index === activeImage ? "opacity-100" : "opacity-0",
              )}
            />
          ))}

          <div className="pointer-events-none absolute top-5 start-5 flex flex-col items-start gap-2">
            {product.badge ? <Badge tone="gold">{product.badge}</Badge> : null}
            {discount ? <Badge tone="rose">خصم {discount}%</Badge> : null}
          </div>
        </div>

        {gallery.length > 1 ? (
          <ul className="mt-4 flex gap-3 overflow-x-auto hide-scrollbar">
            {gallery.map((image, index) => (
              <li key={`${image}-thumb`}>
                <button
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`عرض الصورة ${index + 1}`}
                  aria-current={index === activeImage}
                  className={cn(
                    "relative size-20 shrink-0 overflow-hidden rounded-2xl ring-1 transition-all duration-300",
                    index === activeImage
                      ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-cream-100"
                      : "ring-blush-200 hover:ring-blush-300",
                  )}
                >
                  <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Purchase panel */}
      <div>
        <p className="eyebrow text-rose-600">
          <Link
            href={`/shop?category=${product.category}`}
            className="transition-colors hover:text-rose-800"
          >
            {CATEGORY_LABELS[product.category]}
          </Link>
          {product.collection ? ` · ${product.collection}` : ""}
        </p>

        <h1 className="mt-3 text-[clamp(1.9rem,4.2vw,2.9rem)] leading-[1.2]">
          {product.name}
        </h1>

        {product.tagline ? (
          <p className="mt-2.5 text-[0.95rem] text-plum-500">{product.tagline}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <StarRating rating={product.rating} count={product.review_count} />
          <span className="text-[0.75rem] text-plum-400">
            {formatNumber(product.review_count)} مراجعة موثّقة
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-[2.1rem] leading-none text-plum-900">
            {formatPrice(unitPrice)}
          </span>
          {compareAt ? (
            <span className="text-[0.95rem] text-plum-400 line-through">
              {formatPrice(compareAt)}
            </span>
          ) : null}
          {discount ? (
            <span className="text-[0.78rem] font-medium text-rose-700">
              وفّري {formatPrice(compareAt! - unitPrice)}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 text-[0.72rem] text-plum-400">
          {COMMERCE.taxLabel} تُحتسب عند إتمام الطلب
        </p>

        <Divider className="my-7" />

        {/* Variant selectors */}
        {product.variant_groups.map((group) => {
          const chosen = group.options.find(
            (option) => option.id === selection[group.id],
          );
          return (
            <fieldset key={group.id} className="mb-7">
              <legend className="mb-3.5 flex w-full items-baseline justify-between gap-4">
                <span className="eyebrow text-plum-600">
                  {group.label}
                  <span className="ms-2.5 text-[0.75rem] text-plum-500">
                    {chosen?.name}
                    {chosen?.caption ? ` · ${chosen.caption}` : ""}
                  </span>
                </span>
              </legend>

              {group.display === "swatch" ? (
                <ul className="flex flex-wrap gap-3">
                  {group.options.map((option) => {
                    const isChosen = option.id === selection[group.id];
                    const optionOut = (option.stock ?? 1) <= 0;
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelection((current) => ({
                              ...current,
                              [group.id]: option.id,
                            }))
                          }
                          disabled={optionOut}
                          aria-pressed={isChosen}
                          title={option.name}
                          className={cn(
                            "relative flex size-11 items-center justify-center rounded-full transition-all duration-300",
                            "ring-1 ring-blush-300 ring-offset-2 ring-offset-cream-100",
                            isChosen
                              ? "scale-105 ring-2 ring-rose-600"
                              : "hover:scale-105 hover:ring-blush-400",
                            optionOut && "cursor-not-allowed opacity-40",
                          )}
                        >
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `linear-gradient(140deg, ${option.hex ?? "#E5A3A8"}, #ffffff85)`,
                            }}
                          />
                          {isChosen ? (
                            <Check
                              className="relative size-4 text-white drop-shadow"
                              aria-hidden
                            />
                          ) : null}
                          <span className="sr-only">
                            {option.name}
                            {optionOut ? " (نفدت الكمية)" : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="grid gap-2.5 sm:grid-cols-3">
                  {group.options.map((option) => {
                    const isChosen = option.id === selection[group.id];
                    const optionOut = (option.stock ?? 1) <= 0;
                    const price = product.price + (option.priceDelta ?? 0);
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelection((current) => ({
                              ...current,
                              [group.id]: option.id,
                            }))
                          }
                          disabled={optionOut}
                          aria-pressed={isChosen}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 text-start transition-all duration-300",
                            isChosen
                              ? "border-rose-500 bg-white shadow-soft"
                              : "border-blush-200 bg-white/60 hover:border-blush-300 hover:bg-white",
                            optionOut && "cursor-not-allowed opacity-45",
                          )}
                        >
                          <span className="block text-[0.85rem] font-medium text-plum-800">
                            {option.name}
                          </span>
                          <span className="mt-0.5 block text-[0.7rem] text-plum-400">
                            {formatPrice(price)}
                            {option.caption ? ` · ${option.caption}` : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </fieldset>
          );
        })}

        {/* Quantity + actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-full border border-blush-200 bg-white/70">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="تقليل الكمية"
              className="flex size-11 items-center justify-center rounded-full text-plum-600 transition-colors hover:bg-blush-100 disabled:opacity-35"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span
              aria-live="polite"
              className="num min-w-9 text-center text-[0.95rem] text-plum-800"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              aria-label="زيادة الكمية"
              className="flex size-11 items-center justify-center rounded-full text-plum-600 transition-colors hover:bg-blush-100 disabled:opacity-35"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>

          <p className="text-[0.78rem] text-plum-500">
            {soldOut ? (
              <span className="text-rose-800">نفدت الكمية حالياً</span>
            ) : available <= 6 ? (
              <span className="text-rose-800">
                بقيت {formatNumber(available)} قطع فقط
              </span>
            ) : (
              <span className="text-sage-600">متوفرة وجاهزة للشحن</span>
            )}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="gold"
            size="lg"
            className="flex-1"
            disabled={soldOut}
            onClick={() => handleAdd(false)}
          >
            <ShoppingBag className="size-4" aria-hidden />
            أضيفي إلى السلة · {formatPrice(unitPrice * quantity)}
          </Button>

          <button
            type="button"
            onClick={toggleWishlist}
            disabled={savingWishlist}
            aria-pressed={saved}
            aria-label={saved ? "إزالة من قائمة الأمنيات" : "حفظ في قائمة الأمنيات"}
            className={cn(
              "flex size-13 shrink-0 items-center justify-center rounded-full transition-all duration-300",
              saved
                ? "bg-rose-600 text-white shadow-glow"
                : "border border-plum-800/25 text-plum-700 hover:border-rose-500 hover:text-rose-700",
            )}
          >
            <Heart className={cn("size-5", saved && "fill-current")} aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleAdd(true)}
          disabled={soldOut}
          className={buttonClasses("outline", "lg", "mt-3 w-full")}
        >
          اشتري الآن
        </button>

        <ul className="mt-7 space-y-2.5">
          {ASSURANCES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-[0.78rem] text-plum-500"
            >
              <Icon className="size-4 shrink-0 text-rose-500" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        {/* Accordion */}
        <div className="mt-9 border-t border-blush-200">
          {panels.map((panel) => {
            const open = openPanel === panel.id;
            return (
              <div key={panel.id} className="border-b border-blush-200">
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpenPanel(open ? null : panel.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-4 text-start"
                  >
                    <span className="text-[0.88rem] text-plum-800">{panel.label}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-plum-400 transition-transform duration-400 ease-[var(--ease-silk)]",
                        open && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                </h2>
                <div
                  className={cn(
                    "grid transition-all duration-500 ease-[var(--ease-silk)]",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-[0.85rem] leading-relaxed text-plum-500">
                      {panel.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
