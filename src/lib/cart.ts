import { COMMERCE } from "@/lib/constants";
import { clamp } from "@/lib/utils";
import type { CartLine, Product, VariantGroup, VariantOption } from "@/types";

/* -------------------------------------------------------------------------- */
/* Line identity + pricing                                                    */
/* -------------------------------------------------------------------------- */

/** A cart line is unique per product *and* chosen variant. */
export function cartLineKey(productId: string, optionId?: string | null) {
  return optionId ? `${productId}::${optionId}` : productId;
}

export function resolveOption(
  product: Product,
  groupId?: string | null,
  optionId?: string | null,
): { group: VariantGroup | null; option: VariantOption | null } {
  if (!groupId) return { group: null, option: null };

  const group = product.variant_groups.find((g) => g.id === groupId) ?? null;
  if (!group) return { group: null, option: null };

  const option = group.options.find((o) => o.id === optionId) ?? null;
  return { group, option };
}

export function lineUnitPrice(product: Product, option: VariantOption | null) {
  return Math.round((product.price + (option?.priceDelta ?? 0)) * 100) / 100;
}

export function lineMaxQuantity(product: Product, option: VariantOption | null) {
  const available =
    typeof option?.stock === "number" ? option.stock : product.stock;
  return clamp(available, 0, COMMERCE.maxQuantityPerLine);
}

/** The single place a `CartLine` is ever constructed. */
export function buildCartLine(
  product: Product,
  group: VariantGroup | null,
  option: VariantOption | null,
  quantity = 1,
): CartLine {
  const max = lineMaxQuantity(product, option);
  const image =
    option?.image ??
    product.images[0] ??
    "/hero.svg";

  return {
    key: cartLineKey(product.id, option?.id),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image,
    category: product.category,
    groupId: group?.id ?? null,
    groupLabel: group?.label ?? null,
    optionId: option?.id ?? null,
    optionName: option?.name ?? null,
    optionHex: option?.hex ?? null,
    unitPrice: lineUnitPrice(product, option),
    quantity: clamp(Math.round(quantity), 1, Math.max(1, max)),
    maxQuantity: Math.max(1, max),
  };
}

/* -------------------------------------------------------------------------- */
/* Totals                                                                     */
/* -------------------------------------------------------------------------- */

export type CartTotals = {
  subtotal: number;
  discountTotal: number;
  discountCode: string | null;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  freeShippingGap: number;
  qualifiesForFreeShipping: boolean;
};

export function computeTotals(
  lines: CartLine[],
  options: {
    shippingMethod?: "standard" | "express";
    discount?: { code: string; amount: number } | null;
  } = {},
): CartTotals {
  const { shippingMethod = "standard", discount = null } = options;
  const round = (n: number) => Math.round(n * 100) / 100;

  const subtotal = round(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const discountTotal = round(Math.min(Math.max(discount?.amount ?? 0, 0), subtotal));
  const discountedSubtotal = round(subtotal - discountTotal);

  const qualifiesForFreeShipping = discountedSubtotal >= COMMERCE.freeShippingThreshold;

  let shipping = 0;
  if (itemCount > 0) {
    if (shippingMethod === "express") {
      shipping = COMMERCE.expressShippingRate;
    } else if (!qualifiesForFreeShipping) {
      shipping = COMMERCE.flatShippingRate;
    }
  }

  // Tax is charged on the discounted merchandise value, never on shipping.
  const tax = round(discountedSubtotal * COMMERCE.taxRate);
  const total = round(discountedSubtotal + shipping + tax);

  return {
    subtotal,
    discountTotal,
    discountCode: discount?.code ?? null,
    shipping: round(shipping),
    tax,
    total,
    itemCount,
    freeShippingGap: round(Math.max(0, COMMERCE.freeShippingThreshold - discountedSubtotal)),
    qualifiesForFreeShipping,
  };
}

/* -------------------------------------------------------------------------- */
/* Persistence shape                                                          */
/* -------------------------------------------------------------------------- */

export const CART_STORAGE_KEY = "velvet-essence.cart.v1";
export const CART_DRAWER_KEY = "velvet-essence.cart.open";

/** Narrows anything read out of localStorage into a trustworthy `CartLine[]`. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry): CartLine[] => {
      if (!entry || typeof entry !== "object") return [];
      const line = entry as Record<string, unknown>;

      if (
        typeof line.productId !== "string" ||
        typeof line.slug !== "string" ||
        typeof line.name !== "string" ||
        typeof line.unitPrice !== "number"
      ) {
        return [];
      }

      return [
        {
          key:
            typeof line.key === "string"
              ? line.key
              : cartLineKey(
                  line.productId,
                  typeof line.optionId === "string" ? line.optionId : null,
                ),
          productId: line.productId,
          slug: line.slug,
          name: line.name,
          image: typeof line.image === "string" ? line.image : "/hero.svg",
          category: (typeof line.category === "string"
            ? line.category
            : "skincare") as CartLine["category"],
          groupId: typeof line.groupId === "string" ? line.groupId : null,
          groupLabel: typeof line.groupLabel === "string" ? line.groupLabel : null,
          optionId: typeof line.optionId === "string" ? line.optionId : null,
          optionName: typeof line.optionName === "string" ? line.optionName : null,
          optionHex: typeof line.optionHex === "string" ? line.optionHex : null,
          unitPrice: line.unitPrice,
          quantity: clamp(Math.round(Number(line.quantity) || 1), 1, 99),
          maxQuantity: clamp(Math.round(Number(line.maxQuantity) || 12), 1, 99),
        },
      ];
    });
  } catch {
    return [];
  }
}
