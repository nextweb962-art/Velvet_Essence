"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  orderStatusUpdateSchema,
  productInputSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";

export type ProductActionState = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
};

export const initialProductState: ProductActionState = { ok: false };

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** FormData gives us strings; empty means "absent", not zero. */
function optionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? undefined : text;
}

function jsonArray(value: FormDataEntryValue | null): unknown[] {
  if (typeof value !== "string" || value.trim() === "") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Defence in depth: middleware already redirects non-admins away from /admin,
 * but every mutation re-checks. RLS would reject the write anyway — this just
 * fails faster and with a clearer message.
 */
async function requireAdmin() {
  if (!isSupabaseConfigured) {
    return { ok: false as const, message: "أدوات الإدارة تحتاج مشروع Supabase." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, message: "انتهت صلاحية الجلسة — سجّلي الدخول مرة أخرى." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false as const, message: "صلاحية مشرفة مطلوبة لهذا الإجراء." };
  }

  return { ok: true as const, supabase };
}

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveProduct(
  _previous: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const name = String(formData.get("name") ?? "").trim();
  const id = optionalText(formData.get("id"));

  const candidate = {
    slug: optionalText(formData.get("slug")) ?? slugify(name),
    name,
    tagline: optionalText(formData.get("tagline")) ?? null,
    description: String(formData.get("description") ?? "").trim(),
    category: formData.get("category"),
    collection: optionalText(formData.get("collection")) ?? null,
    price: formData.get("price"),
    compare_at_price: optionalText(formData.get("compare_at_price")),
    images: jsonArray(formData.get("images")),
    variant_groups: jsonArray(formData.get("variant_groups")),
    badge: optionalText(formData.get("badge")) ?? null,
    rating: optionalText(formData.get("rating")) ?? 0,
    review_count: optionalText(formData.get("review_count")) ?? 0,
    stock: optionalText(formData.get("stock")) ?? 0,
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };

  const parsed = productInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      message: "الرجاء تصحيح الحقول المظللة.",
      errors: toFieldErrors(parsed.error),
    };
  }

  // Deliberately un-annotated: the inferred shape is assignable to both the
  // `Insert` and `Update` row types, and it never carries an `id`.
  const values = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    tagline: parsed.data.tagline ?? null,
    description: parsed.data.description,
    category: parsed.data.category,
    collection: parsed.data.collection ?? null,
    price: parsed.data.price,
    compare_at_price: parsed.data.compare_at_price ?? null,
    images: parsed.data.images,
    variant_groups: parsed.data.variant_groups,
    badge: parsed.data.badge ?? null,
    rating: parsed.data.rating,
    review_count: parsed.data.review_count,
    stock: parsed.data.stock,
    is_active: parsed.data.is_active,
    is_featured: parsed.data.is_featured,
    tags: parsed.data.tags,
  };

  try {
    if (id) {
      const { error } = await auth.supabase.from("products").update(values).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await auth.supabase.from("products").insert(values);
      if (error) throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error("[admin] saveProduct failed", error);

    return {
      ok: false,
      message: /duplicate key|unique/i.test(message)
        ? "هذا المعرّف النصي مستخدم بالفعل — اختاري غيره."
        : "تعذّر حفظ المنتج. الرجاء المحاولة مرة أخرى.",
    };
  }

  // Product data appears on many cached surfaces.
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/product/${parsed.data.slug}`);
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const id = optionalText(formData.get("id"));
  if (!id) return;

  const { error } = await auth.supabase.from("products").delete().eq("id", id);
  if (error) console.error("[admin] deleteProduct failed", error);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function toggleProductActive(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const id = optionalText(formData.get("id"));
  const next = formData.get("active") === "true";
  if (!id) return;

  const { error } = await auth.supabase
    .from("products")
    .update({ is_active: next })
    .eq("id", id);

  if (error) console.error("[admin] toggleProductActive failed", error);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Plain form action (not a `useActionState` reducer) so it can be handed
 * straight to `<form action={...}>` from a Client Component.
 */
export async function setOrderStatus(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = orderStatusUpdateSchema.safeParse({
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  const id = optionalText(formData.get("orderId"));
  if (!id) return;

  const { error } = await auth.supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    console.error("[admin] setOrderStatus failed", error);
    return;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account/orders");
}
