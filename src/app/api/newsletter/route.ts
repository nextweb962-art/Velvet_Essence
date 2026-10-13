import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { newsletterSchema, toFieldErrors } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { email, source } = parsed.data;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      // `ignoreDuplicates` keeps re-subscribing idempotent instead of leaking
      // whether an address was already on the list.
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });

      if (error) throw error;
    } catch (error) {
      console.error("[api/newsletter] insert failed", error);
      // Never fail the UI on a nice-to-have.
    }
  }

  return NextResponse.json({ ok: true });
}
