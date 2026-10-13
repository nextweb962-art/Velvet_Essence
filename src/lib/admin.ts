import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { fetchOrders, type OrderWithItems } from "@/lib/account";
import type { Product } from "@/types";
import { rowToProduct } from "@/lib/product-mapper";

export type AdminStats = {
  revenue: number;
  orderCount: number;
  pendingCount: number;
  productCount: number;
  draftCount: number;
  lowStock: number;
  customerCount: number;
  averageOrderValue: number;
};

const EMPTY_STATS: AdminStats = {
  revenue: 0,
  orderCount: 0,
  pendingCount: 0,
  productCount: 0,
  draftCount: 0,
  lowStock: 0,
  customerCount: 0,
  averageOrderValue: 0,
};

/**
 * Dashboard aggregates.
 *
 * Every read runs as the signed-in admin, so RLS is what grants the visibility;
 * there is no service-role bypass hiding in here.
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured) return EMPTY_STATS;

  try {
    const supabase = await createClient();

    const [orders, products, profiles] = await Promise.all([
      supabase.from("orders").select("total, status"),
      supabase.from("products").select("stock, is_active"),
      supabase.from("profiles").select("id"),
    ]);

    if (orders.error) throw orders.error;
    if (products.error) throw products.error;

    const orderRows = orders.data ?? [];
    const revenue = orderRows
      .filter((row) => row.status !== "cancelled")
      .reduce((sum, row) => sum + Number(row.total), 0);

    const productRows = products.data ?? [];
    const activeProducts = productRows.filter((row) => row.is_active);

    return {
      revenue: Math.round(revenue * 100) / 100,
      orderCount: orderRows.length,
      pendingCount: orderRows.filter((row) => row.status === "pending").length,
      productCount: activeProducts.length,
      draftCount: productRows.length - activeProducts.length,
      lowStock: activeProducts.filter((row) => Number(row.stock) <= 10).length,
      // A profiles read is admin-only by policy; a failure here is not fatal.
      customerCount: profiles.data?.length ?? 0,
      averageOrderValue:
        orderRows.length > 0 ? Math.round((revenue / orderRows.length) * 100) / 100 : 0,
    };
  } catch (error) {
    console.warn(
      "[admin] stats unavailable:",
      error instanceof Error ? error.message : error,
    );
    return EMPTY_STATS;
  }
}

export async function fetchAdminProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(rowToProduct);
  } catch (error) {
    console.warn(
      "[admin] product list unavailable:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function fetchAdminOrders(limit = 50): Promise<OrderWithItems[]> {
  return fetchOrders({ limit, all: true });
}
