import { z } from "zod";

import { GOVERNORATES } from "@/lib/constants";
import {
  CATEGORIES,
  ORDER_STATUSES,
  type CategoryId,
  type OrderStatus,
} from "@/types";

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

const trimmed = (max: number) => z.string().trim().max(max);

/** Jordanian mobile (07X XXX XXXX) or landline (0X XXX XXXX), with or without +962. */
const JO_PHONE = /^(?:\+?962|0)(?:7[789]\d{7}|[2-6]\d{7})$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "الرجاء إدخال البريد الإلكتروني")
  .max(254, "البريد الإلكتروني طويل جداً")
  .email("الرجاء إدخال بريد إلكتروني صحيح")
  .transform((value) => value.toLowerCase());

/**
 * Length is the only thing that reliably buys entropy, so we ask for 8+
 * characters with a letter and a number rather than a maze of symbols.
 */
export const passwordSchema = z
  .string()
  .min(8, "استخدمي ٨ أحرف على الأقل")
  .max(72, "كلمة المرور محدودة بـ٧٢ حرفاً")
  .regex(/[A-Za-z]/, "أضيفي حرفاً واحداً على الأقل")
  .regex(/[0-9]/, "أضيفي رقماً واحداً على الأقل");

export const fullNameSchema = trimmed(80)
  .min(2, "الرجاء إدخال الاسم الكامل")
  .regex(/^[\p{L}\p{M}'’.\- ]+$/u, "الحروف والمسافات والشرطة فقط");

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s\-()]/g, ""))
  .refine((value) => JO_PHONE.test(value), {
    message: "أدخلي رقم هاتف أردني صحيح، مثال: 0791234567",
  });

export const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, "الرمز البريدي في الأردن من ٥ أرقام");

export const governorateSchema = z.enum(
  GOVERNORATES as unknown as [string, ...string[]],
  { errorMap: () => ({ message: "اختاري المحافظة" }) },
);

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "الرجاء إدخال كلمة المرور").max(72),
});

export const signupSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "الرجاء الموافقة على الشروط للمتابعة" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const profileUpdateSchema = z.object({
  fullName: fullNameSchema,
  phone: z.union([phoneSchema, z.literal("")]).optional(),
});

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

const categoryIds = CATEGORIES.map((category) => category.id) as [
  CategoryId,
  ...CategoryId[],
];

/**
 * Catalogue query string. Every field is `.catch()`-guarded: a hand-edited or
 * stale URL degrades to a sensible default instead of throwing a 500.
 */
export const productQuerySchema = z.object({
  q: trimmed(80).optional().default("").catch(""),
  category: z
    .union([z.enum(categoryIds), z.array(z.enum(categoryIds))])
    .optional()
    .catch(undefined)
    .transform((value) =>
      value === undefined ? [] : Array.isArray(value) ? value : [value],
    ),
  min: z.coerce.number().min(0).max(100000).optional().catch(undefined),
  max: z.coerce.number().min(0).max(100000).optional().catch(undefined),
  sort: z
    .enum(["featured", "newest", "price-asc", "price-desc", "rating"])
    .optional()
    .default("featured")
    .catch("featured"),
  page: z.coerce.number().int().min(1).max(500).optional().default(1).catch(1),
  perPage: z.coerce.number().int().min(4).max(48).optional().default(12).catch(12),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

const variantOptionSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "لكل خيار معرّف مطلوب")
    .max(40)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  name: trimmed(40).min(1, "لكل خيار اسم مطلوب"),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "لون العيّنة يجب أن يكون بصيغة ‎#RRGGBB")
    .optional(),
  priceDelta: z.coerce.number().min(-10000).max(10000).optional(),
  stock: z.coerce.number().int().min(0).max(100000).optional(),
  image: z.string().trim().max(500).optional(),
  caption: trimmed(40).optional(),
});

const variantGroupSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  label: trimmed(40).min(1, "أدخلي عنوان المجموعة"),
  display: z.enum(["swatch", "chip"]),
  options: z.array(variantOptionSchema).min(1, "أضيفي خياراً واحداً على الأقل").max(24),
});

export const productInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "المعرّف النصي مطلوب")
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "أحرف إنجليزية صغيرة وأرقام وشرطات مفردة فقط",
    ),
  name: trimmed(120).min(2, "أدخلي اسم المنتج"),
  tagline: trimmed(160).optional().nullable(),
  description: trimmed(4000).min(10, "اكتبي سطراً أو سطرين على الأقل"),
  category: z.enum(categoryIds),
  collection: trimmed(60).optional().nullable(),
  price: z.coerce
    .number()
    .min(0.5, "السعر لا يقل عن ٠٫٥٠ د.أ")
    .max(100000),
  compare_at_price: z.coerce.number().min(0).max(100000).optional().nullable(),
  images: z
    .array(z.string().trim().min(1).max(500))
    .min(1, "أضيفي صورة واحدة على الأقل")
    .max(8, "ثماني صور تكفي"),
  variant_groups: z.array(variantGroupSchema).max(4).default([]),
  badge: trimmed(24).optional().nullable(),
  rating: z.coerce.number().min(0).max(5).default(0),
  review_count: z.coerce.number().int().min(0).max(1000000).default(0),
  stock: z.coerce.number().int().min(0).max(1000000).default(0),
  // Real booleans, never coerced from strings — `coerce.boolean()` would treat
  // the string "false" as true.
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  tags: z.array(trimmed(30)).max(14).default([]),
});

export type ProductInputValues = z.infer<typeof productInputSchema>;

/* -------------------------------------------------------------------------- */
/* Cart                                                                       */
/* -------------------------------------------------------------------------- */

export const cartLineSchema = z.object({
  productId: z.string().uuid("منتج غير معروف"),
  quantity: z.coerce.number().int().min(1).max(12),
  variantGroupId: z.string().trim().max(40).nullable().optional(),
  variantOptionId: z.string().trim().max(40).nullable().optional(),
});

export const cartSyncSchema = z.object({
  items: z.array(cartLineSchema).max(50),
});

/* -------------------------------------------------------------------------- */
/* Checkout — domestic, cash on delivery                                      */
/* -------------------------------------------------------------------------- */

export const shippingAddressSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  addressLine1: trimmed(120).min(4, "أدخلي اسم الشارع ورقم المبنى"),
  addressLine2: trimmed(120).optional().default(""),
  city: trimmed(60).min(2, "أدخلي المدينة أو المنطقة"),
  /** Governorate — kept as `state` so stored orders stay portable. */
  state: governorateSchema,
  postalCode: postalCodeSchema,
  /** Delivery is national, so the country is fixed rather than chosen. */
  country: z.literal("الأردن").default("الأردن"),
});

export const PAYMENT_METHODS = ["cash_on_delivery"] as const;

export const checkoutSchema = z.object({
  email: emailSchema,
  shipping: shippingAddressSchema,
  items: z
    .array(
      z.object({
        productId: z.string().uuid("منتج غير معروف"),
        quantity: z.coerce.number().int().min(1).max(12),
        variantGroupId: z.string().trim().max(40).nullable().optional(),
        variantOptionId: z.string().trim().max(40).nullable().optional(),
      }),
    )
    .min(1, "سلّتك فارغة")
    .max(50),
  notes: trimmed(500).optional().default(""),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cash_on_delivery"),
  discountCode: trimmed(24).optional().default(""),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export const orderStatusSchema = z.enum(
  ORDER_STATUSES as unknown as [OrderStatus, ...OrderStatus[]],
);

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
});

export const newsletterSchema = z.object({
  email: emailSchema,
  source: z.enum(["footer", "landing", "popup"]).default("footer"),
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export type FieldErrors = Record<string, string>;

/** Flattens a ZodError into `{ field: "first message" }` for form rendering. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** Safe parse that returns a discriminated union instead of throwing. */
export function parseSafe<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return { ok: true as const, data: parsed.data as z.infer<T> };
  }
  return { ok: false as const, errors: toFieldErrors(parsed.error) };
}
