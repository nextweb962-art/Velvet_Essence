import { NextResponse, type NextRequest } from "next/server";

import { DEMO_PRODUCTS } from "@/lib/catalog";
import { COMMERCE } from "@/lib/constants";
import { computeTotals } from "@/lib/cart";
import { resolveDiscount } from "@/lib/discounts";
import { isSupabaseConfigured } from "@/lib/env";
import { rowToProduct } from "@/lib/product-mapper";
import { createClient } from "@/lib/supabase/server";
import { orderNumber } from "@/lib/utils";
import { checkoutSchema, toFieldErrors } from "@/lib/validation";
import type { CartLine, Product, ShippingAddress } from "@/types";
import type { Database } from "@/types/database";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type OrderItemInsert = {
  product_id: string;
  product_name: string;
  product_slug: string;
  variant_label: string | null;
  image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

/**
 * Checkout.
 *
 * Trust boundary: every price, name and image written to the order is looked up
 * server-side from the catalogue. The client sends only product ids, variant ids
 * and quantities â€” anything it claims about money is discarded.
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "الرجاء مراجعة الحقول المظللة",
        errors: toFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const requestedIds = Array.from(new Set(input.items.map((item) => item.productId)));

  /* ---------------------------------------------------------------------- */
  /* Resolve credentials + catalogue                                        */
  /* ---------------------------------------------------------------------- */

  let supabase: SupabaseClient | null = null;
  let catalogue: Product[] = [];

  if (isSupabaseConfigured) {
    supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "سجّلي الدخول لإتمام الطلب", needsAuth: true },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", requestedIds)
      .eq("is_active", true);

    if (error) {
      console.error("[api/checkout] product lookup failed", error);
      return NextResponse.json(
        { error: "تعذّر التحقق من سلّتك. الرجاء المحاولة مرة أخرى." },
        { status: 500 },
      );
    }

    catalogue = (data ?? []).map(rowToProduct);
  } else {
    catalogue = DEMO_PRODUCTS.filter((product) => requestedIds.includes(product.id));
  }

  /* ---------------------------------------------------------------------- */
  /* Rebuild every line from authoritative data                             */
  /* ---------------------------------------------------------------------- */

  const byId = new Map(catalogue.map((product) => [product.id, product]));
  const lines: CartLine[] = [];
  const orderItems: OrderItemInsert[] = [];

  for (const item of input.items) {
    const product = byId.get(item.productId);

    if (!product) {
      return NextResponse.json(
        { error: "إحدى القطع في سلّتك لم تعد متوفرة." },
        { status: 409 },
      );
    }

    let variantLabel: string | null = null;
    let unitPrice = product.price;
    let image: string | null = product.images[0] ?? null;
    let available = product.stock;

    if (product.variant_groups.length > 0) {
      const group =
        product.variant_groups.find((g) => g.id === item.variantGroupId) ??
        product.variant_groups[0];
      const option =
        group?.options.find((o) => o.id === item.variantOptionId) ?? null;

      if (!group || !option) {
        return NextResponse.json(
          {
            error: `الرجاء اختيار ${group?.label ?? "الخيار"} لـ${product.name}.`,
          },
          { status: 409 },
        );
      }

      variantLabel = `${group.label}: ${option.name}`;
      unitPrice = Math.round((product.price + (option.priceDelta ?? 0)) * 100) / 100;
      image = option.image ?? image;
      if (typeof option.stock === "number") available = option.stock;
    }

    if (available <= 0) {
      return NextResponse.json(
        { error: `${product.name} نفدت كميته للتو.` },
        { status: 409 },
      );
    }

    const quantity = Math.min(item.quantity, available, COMMERCE.maxQuantityPerLine);
    const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      variant_label: variantLabel,
      image,
      unit_price: unitPrice,
      quantity,
      line_total: lineTotal,
    });

    lines.push({
      key: `${product.id}::${variantLabel ?? ""}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: image ?? "/hero.svg",
      category: product.category,
      groupId: item.variantGroupId ?? null,
      groupLabel: null,
      optionId: item.variantOptionId ?? null,
      optionName: variantLabel,
      optionHex: null,
      unitPrice,
      quantity,
      maxQuantity: available,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Totals â€” recomputed here, never taken from the request                 */
  /* ---------------------------------------------------------------------- */

  const subtotal =
    Math.round(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) * 100) /
    100;

  let discount: { code: string; amount: number } | null = null;
  if (input.discountCode) {
    const resolved = resolveDiscount(input.discountCode, subtotal);
    if (!resolved.ok) {
      return NextResponse.json(
        { error: resolved.reason, field: "discountCode" },
        { status: 400 },
      );
    }
    discount = { code: resolved.discount.code, amount: resolved.discount.amount };
  }

  const totals = computeTotals(lines, {
    shippingMethod: input.shippingMethod,
    discount,
  });

  /* ---------------------------------------------------------------------- */
  /* Persist                                                                */
  /* ---------------------------------------------------------------------- */

  if (!supabase) {
    // Demo mode: nothing to write, but the shopper still gets a confirmation.
    return NextResponse.json({ orderNumber: orderNumber(), demo: true, totals });
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_items: orderItems as unknown as Database["public"]["Functions"]["place_order"]["Args"]["p_items"],
    p_email: input.email,
    p_customer_name: input.shipping.fullName,
    p_shipping_address: input.shipping as unknown as ShippingAddress,
    p_notes: input.notes,
    p_shipping_method: input.shippingMethod,
    p_payment_method: input.paymentMethod,
    p_subtotal: totals.subtotal,
    p_discount_code: discount?.code ?? "",
    p_discount_total: totals.discountTotal,
    p_shipping_cost: totals.shipping,
    p_tax: totals.tax,
    p_total: totals.total,
  });

  if (error) {
    console.error("[api/checkout] place_order failed", error);
    const unauthorised = error.code === "42501";

    return NextResponse.json(
      {
        error: unauthorised
          ? "سجّلي الدخول لإتمام الطلب"
          : "We could not place your order. No payment was taken â€” please try again.",
        needsAuth: unauthorised,
      },
      { status: unauthorised ? 401 : 500 },
    );
  }

  return NextResponse.json({
    orderNumber: data.order_number,
    id: data.id,
    demo: false,
    totals,
  });
}
