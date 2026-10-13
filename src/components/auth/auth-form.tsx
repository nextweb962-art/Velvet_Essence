"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { Badge, Divider } from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import {
  loginSchema,
  signupSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";

type Mode = "login" | "signup";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.08 3.56-5.15 3.56-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export function AuthForm({
  mode,
  redirectTo: requestedRedirect = "/account",
  reason,
  urlError,
}: {
  mode: Mode;
  redirectTo?: string;
  reason?: string;
  urlError?: string;
}) {
  const router = useRouter();

  /** Only ever bounce back to a path on this site. */
  const redirectTo =
    requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/account";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(urlError ?? null);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function signInWithGoogle() {
    setFormError(null);
    setOauthPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      // The browser is now navigating to Google — leave the button spinning.
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "تسجيل الدخول بجوجل غير متاح حالياً.",
      );
      setOauthPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (mode === "login") {
      const parsed = loginSchema.safeParse({
        email: form.email,
        password: form.password,
      });
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
        return;
      }

      setPending(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;

        // The server layout re-reads the session and hydrates the cart.
        router.refresh();
        router.push(redirectTo);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        setFormError(
          /invalid login credentials/i.test(message)
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            : /email not confirmed/i.test(message)
              ? "الرجاء تأكيد بريدك الإلكتروني أولاً — تفقّدي صندوق الوارد."
              : message || "تعذّر تسجيل الدخول.",
        );
      } finally {
        setPending(false);
      }
      return;
    }

    const parsed = signupSchema.safeParse({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      acceptTerms,
    });

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;

      if (!data.session) {
        // Email confirmation is switched on for this project.
        setAwaitingEmail(true);
        return;
      }

      router.refresh();
      router.push(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setFormError(
        /already registered|already exists/i.test(message)
          ? "هذا البريد لديه حساب بالفعل. جرّبي تسجيل الدخول."
          : /password/i.test(message)
            ? "اختاري كلمة مرور أقوى من فضلك."
            : message || "تعذّر إنشاء حسابك.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="glass rounded-4xl p-8 text-center">
        <Badge tone="gold">وضع تجريبي</Badge>
        <h2 className="mt-5 text-xl">
          {mode === "login" ? "تسجيل الدخول متوقّف" : "إنشاء الحساب متوقّف"}
        </h2>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-plum-500">
          الحسابات تعمل عبر Supabase Auth، وهو غير مربوط في هذه البيئة. أضيفي{" "}
          <span className="latin text-plum-700">NEXT_PUBLIC_SUPABASE_URL</span> و
          <span className="latin text-plum-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> إلى
          ملف <span className="latin text-plum-700">.env.local</span> وأعيدي تشغيل الخادم.
        </p>
        <Divider className="my-6" />
        <p className="text-[0.8rem] text-plum-500">
          كل ما عدا ذلك يعمل: تصفّحي الكتالوج، وفلتري، واستخدمي سلّتك، وأكملي الطلب
          بالدفع عند الاستلام.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 text-[0.82rem] text-rose-700 underline decoration-rose-300 underline-offset-4"
        >
          تصفّحي المتجر
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  if (awaitingEmail) {
    return (
      <div className="glass rounded-4xl p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-blush-100 text-rose-600">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <h2 className="mt-5 text-xl">أكّدي بريدك الإلكتروني</h2>
        <p className="mt-2.5 text-[0.85rem] leading-relaxed text-plum-500">
          أرسلنا رابط تأكيد إلى <span className="latin text-plum-700">{form.email}</span>
          . افتحيه وستصلين مباشرة إلى حسابك.
        </p>
        <Divider className="my-6" />
        <p className="text-[0.78rem] text-plum-400">
          لم يصلك شيء؟ تفقّدي مجلّد الرسائل غير المرغوبة، أو{" "}
          <Link
            href="/login"
            className="text-rose-700 underline decoration-rose-300 underline-offset-4"
          >
            جرّبي تسجيل الدخول
          </Link>
          .
        </p>
      </div>
    );
  }

  const isLogin = mode === "login";

  return (
    <div className="glass rounded-4xl p-7 sm:p-8">
      {reason === "auth" ? (
        <p className="mb-5 rounded-2xl bg-blush-100/80 px-4 py-3 text-[0.8rem] text-plum-600">
          الرجاء تسجيل الدخول للمتابعة إلى تلك الصفحة.
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full bg-white/80"
        loading={oauthPending}
        onClick={signInWithGoogle}
      >
        {oauthPending ? null : <GoogleMark />}
        المتابعة بحساب Google
      </Button>

      <div className="my-6 flex items-center gap-4">
        <span className="hairline flex-1" />
        <span className="text-[0.68rem] text-plum-400">أو</span>
        <span className="hairline flex-1" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50/80 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-700" aria-hidden />
            <p className="text-[0.8rem] text-rose-900">{formError}</p>
          </div>
        ) : null}

        {!isLogin ? (
          <Field label="الاسم الكامل" htmlFor="fullName" error={errors.fullName}>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              aria-invalid={Boolean(errors.fullName)}
              placeholder="أمل الزعبي"
            />
          </Field>
        ) : null}

        <Field label="البريد الإلكتروني" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            placeholder="you@example.com"
            className="text-start"
          />
        </Field>

        <Field
          label="كلمة المرور"
          htmlFor="password"
          error={errors.password}
          hint={isLogin ? undefined : "٨ أحرف على الأقل، ورقم واحد"}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            aria-invalid={Boolean(errors.password)}
            placeholder="••••••••"
          />
        </Field>

        {!isLogin ? (
          <>
            <Field
              label="تأكيد كلمة المرور"
              htmlFor="confirmPassword"
              error={errors.confirmPassword}
            >
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => update("confirmPassword", event.target.value)}
                aria-invalid={Boolean(errors.confirmPassword)}
                placeholder="••••••••"
              />
            </Field>

            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  aria-invalid={Boolean(errors.acceptTerms)}
                  className="mt-0.5"
                />
                <span className="text-[0.8rem] leading-relaxed text-plum-600">
                  أوافق على{" "}
                  <Link
                    href="/about#terms"
                    className="text-rose-700 underline decoration-rose-300 underline-offset-4"
                  >
                    شروط البيع
                  </Link>{" "}
                  و
                  <Link
                    href="/about#privacy"
                    className="text-rose-700 underline decoration-rose-300 underline-offset-4"
                  >
                    سياسة الخصوصية
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms ? (
                <p role="alert" className="mt-2 text-[0.75rem] text-rose-800">
                  {errors.acceptTerms}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        <Button type="submit" variant="gold" size="lg" loading={pending} className="w-full">
          {pending ? (isLogin ? "جارٍ تسجيل الدخول…" : "جارٍ إنشاء الحساب…") : null}
          {pending ? null : (
            <>
              {isLogin ? "تسجيل الدخول" : "إنشاء حسابي"}
              <ArrowLeft className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[0.8rem] text-plum-500">
        {isLogin ? "جديدة على الدار؟ " : "لديك حساب بالفعل؟ "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="text-rose-700 underline decoration-rose-300 underline-offset-4 transition-colors hover:decoration-rose-700"
        >
          {isLogin ? "أنشئي حساباً" : "تسجيل الدخول"}
        </Link>
      </p>
    </div>
  );
}
