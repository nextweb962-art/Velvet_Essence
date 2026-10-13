/**
 * Promotional codes.
 *
 * Kept server-side only for the authoritative calculation; the client may show a
 * preview, but the amount charged is always recomputed in /api/checkout.
 */

export type DiscountKind = "percent" | "fixed";

type DiscountRule = {
  code: string;
  kind: DiscountKind;
  value: number;
  minSubtotal: number;
  label: string;
};

const SYMBOL = "د.أ";

export const DISCOUNT_RULES: Record<string, DiscountRule> = {
  WELCOME10: {
    code: "WELCOME10",
    kind: "percent",
    value: 10,
    minSubtotal: 0,
    label: "خصم ١٠٪ على طلبك الأول",
  },
  VELVET20: {
    code: "VELVET20",
    kind: "percent",
    value: 20,
    minSubtotal: 100,
    label: `خصم ٢٠٪ على الطلبات فوق ١٠٠ ${SYMBOL}`,
  },
  BLOOM5: {
    code: "BLOOM5",
    kind: "fixed",
    value: 5,
    minSubtotal: 40,
    label: `خصم ٥ ${SYMBOL} على الطلبات فوق ٤٠ ${SYMBOL}`,
  },
};

export type AppliedDiscount = {
  code: string;
  label: string;
  amount: number;
};

export type DiscountResult =
  | { ok: true; discount: AppliedDiscount }
  | { ok: false; reason: string };

const round = (value: number) => Math.round(value * 100) / 100;

export function resolveDiscount(code: string, subtotal: number): DiscountResult {
  const normalised = code.trim().toUpperCase();
  if (!normalised) return { ok: false, reason: "أدخلي رمز الخصم" };

  const rule = DISCOUNT_RULES[normalised];
  if (!rule) return { ok: false, reason: "هذا الرمز غير معروف" };

  if (subtotal < rule.minSubtotal) {
    return {
      ok: false,
      reason: `صالح للطلبات فوق ${rule.minSubtotal} ${SYMBOL}`,
    };
  }

  const raw = rule.kind === "percent" ? (subtotal * rule.value) / 100 : rule.value;

  // Never let a code take an order below zero.
  return {
    ok: true,
    discount: {
      code: rule.code,
      label: rule.label,
      amount: round(Math.min(raw, subtotal)),
    },
  };
}

export const FEATURED_DISCOUNT_CODE = "WELCOME10";
