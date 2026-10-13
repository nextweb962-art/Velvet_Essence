"use server";

import { revalidatePath } from "next/cache";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type ProfileActionState = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
};

export const initialProfileState: ProfileActionState = { ok: false };

/**
 * Update the signed-in shopper's own profile.
 *
 * `role` is intentionally absent from the payload and from the Zod schema —
 * and the `guard_profile_role` trigger would reject an escalation even if it
 * were smuggled in.
 */
export async function updateProfile(
  _previous: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "الملف الشخصي يحتاج مشروع Supabase." };
  }

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "انتهت صلاحية الجلسة — سجّلي الدخول مرة أخرى." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
      })
      .eq("id", user.id);

    if (error) throw error;

    // Keep the JWT metadata in step so the navbar updates without a re-login.
    await supabase.auth.updateUser({ data: { full_name: parsed.data.fullName } });

    revalidatePath("/account");
    return { ok: true, message: "تم حفظ بياناتك." };
  } catch (error) {
    console.error("[account] profile update failed", error);
    return {
      ok: false,
      message: "تعذّر حفظ بياناتك. الرجاء المحاولة مرة أخرى.",
    };
  }
}
