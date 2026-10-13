"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState } from "react";

import {
  initialProfileState,
  updateProfile,
  type ProfileActionState,
} from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function ProfileForm({
  defaults,
}: {
  defaults: { fullName: string; phone: string; email: string };
}) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    initialProfileState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="البريد الإلكتروني"
        htmlFor="profile-email"
        hint="للتغيير تواصلي معنا"
      >
        <Input
          id="profile-email"
          name="email"
          type="email"
          dir="ltr"
          defaultValue={defaults.email}
          disabled
          readOnly
          className="text-start"
        />
      </Field>

      <Field label="الاسم الكامل" htmlFor="fullName" error={state.errors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={defaults.fullName}
          aria-invalid={Boolean(state.errors?.fullName)}
          placeholder="أمل الزعبي"
          required
        />
      </Field>

      <Field
        label="رقم الجوال"
        htmlFor="phone"
        optional
        error={state.errors?.phone}
        hint="مثال: 0791234567"
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          dir="ltr"
          defaultValue={defaults.phone}
          aria-invalid={Boolean(state.errors?.phone)}
          placeholder="0791234567"
          className="text-start"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" loading={pending}>
          {pending ? "جارٍ الحفظ…" : "حفظ البيانات"}
        </Button>

        {state.message ? (
          <p
            role="status"
            className={
              state.ok
                ? "flex items-center gap-2 text-[0.8rem] text-sage-600"
                : "text-[0.8rem] text-rose-800"
            }
          >
            {state.ok ? <CheckCircle2 className="size-4" aria-hidden /> : null}
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
