import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { rowToProduct } from "@/lib/product-mapper";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";
import type { Order, OrderItem, Product, ShippingAddress } from "@/types";

/**
 * Account-scoped reads. Every query here runs on the request-scoped client, so
 * Row Level Security — not application code — decides what comes back.
 *
 * Each helper returns an empty result in demo mode rather than throwing, so the
 * account and admin screens still render sensibly without a database.
 */

export async function fetchWishlistIds(): Promise<Set<string>> {
  if (!isSupabaseConfigured) return new Set();

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);

    if (error) throw error;
    return new Set((data ?? []).map((row) => row.product_id));
  } catch (error) {
    console.warn(
      "[account] wishlist ids unavailable:",
      error instanceof Error ? error.message : error,
    );
    return new Set();
  }
}

export async function fetchWishlistProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: saved, error } = await supabase
      .from("wishlists")
      .select("product_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!saved || saved.length === 0) return [];

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*")
      .in(
        "id",
        saved.map((row) => row.product_id),
      );

    if (productError) throw productError;

    // Preserve the "most recently saved first" order.
    const byId = new Map((products ?? []).map((row) => [row.id, row]));
    return saved.flatMap((row) => {
      const product = byId.get(row.product_id);
      return product ? [rowToProduct(product)] : [];
    });
  } catch (error) {
    console.warn(
      "[account] wishlist unavailable:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export type OrderWithItems = Order & { items: OrderItem[] };

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

/** jsonb comes back loosely typed; narrow it once, here. */
function toShippingAddress(value: Json): ShippingAddress {
  const record = (value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {}) as Record<string, Json | undefined>;

  const text = (key: string) => {
    const entry = record[key];
    return typeof entry === "string" ? entry : "";
  };

  return {
    fullName: text("fullName"),
    email: text("email"),
    phone: text("phone"),
    addressLine1: text("addressLine1"),
    addressLine2: text("addressLine2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postalCode"),
    country: text("country"),
  };
}

function rowToOrder(row: OrderRow, items: OrderItemRow[]): OrderWithItems {
  return {
    id: row.id,
    order_number: row.order_number,
    user_id: row.user_id,
    email: row.email,
    customer_name: row.customer_name,
    status: row.status,
    subtotal: Number(row.subtotal),
    discount_code: row.discount_code,
    discount_total: Number(row.discount_total),
    shipping_cost: Number(row.shipping_cost),
    tax: Number(row.tax),
    total: Number(row.total),
    shipping_method: row.shipping_method === "express" ? "express" : "standard",
    payment_method: "cash_on_delivery",
    shipping_address: toShippingAddress(row.shipping_address),
    notes: row.notes,
    created_at: row.created_at,
    items,
  };
}

export async function fetchOrders(options: { limit?: number; all?: boolean } = {}) {
  const { limit = 25, all = false } = options;
  if (!isSupabaseConfigured) return [] as OrderWithItems[];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [] as OrderWithItems[];

    let builder = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Admins may list every order; RLS allows it, but we never *ask* for other
    // people's orders unless the caller explicitly opts in.
    if (!all) builder = builder.eq("user_id", user.id);

    const { data: orders, error } = await builder;
    if (error) throw error;
    if (!orders || orders.length === 0) return [] as OrderWithItems[];

    const { data: items, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .in(
        "order_id",
        orders.map((order) => order.id),
      );

    if (itemError) throw itemError;

    const itemsByOrder = new Map<string, OrderItemRow[]>();
    for (const item of items ?? []) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    return orders.map((order) => rowToOrder(order, itemsByOrder.get(order.id) ?? []));
  } catch (error) {
    console.warn(
      "[account] orders unavailable:",
      error instanceof Error ? error.message : error,
    );
    return [] as OrderWithItems[];
  }
}

export async function fetchOrderByNumber(
  orderNumber: string,
): Promise<OrderWithItems | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = await createClient();

    // RLS guarantees this can only ever return the caller's own order (or any
    // order at all, if the caller is an admin).
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error) throw error;
    if (!order) return null;

    const { data: items, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemError) throw itemError;

    return rowToOrder(order, items ?? []);
  } catch (error) {
    console.warn(
      "[account] order lookup unavailable:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
