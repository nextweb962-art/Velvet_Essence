import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  productId: z.string().uuid("منتج غير معروف"),
  saved: z.boolean(),
});

/**
 * Toggle a product in the signed-in shopper's wishlist.
 *
 * RLS is the real gate — both the delete and the insert are scoped to
 * `auth.uid()` by policy, so a forged product id can at worst fail.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "قائمة الأمنيات تحتاج مشروع Supabase. استخدمي سلّة الوضع التجريبي المحلية في الوقت الحالي.",
      },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "طلب غير صحيح" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "سجّلي الدخول أولاً" }, { status: 401 });
  }

  const { productId, saved } = parsed.data;

  const { error } = saved
    ? await supabase
        .from("wishlists")
        .upsert(
          { user_id: user.id, product_id: productId },
          { onConflict: "user_id,product_id", ignoreDuplicates: true },
        )
    : await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

  if (error) {
    console.error("[api/wishlist] write failed", error);
    return NextResponse.json(
      { error: "تعذّر تحديث قائمة الأمنيات" },
      { status: 500 },
    );
  }

  return NextResponse.json({ saved });
}
