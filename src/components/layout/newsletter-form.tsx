"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema, toFieldErrors } from "@/lib/validation";

export function NewsletterForm({
  source = "footer",
}: {
  source?: "footer" | "landing";
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = newsletterSchema.safeParse({ email, source });
    if (!parsed.success) {
      setError(toFieldErrors(parsed.error).email ?? "أدخلي بريداً إلكترونياً صحيحاً");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { errors?: Record<string, string> }
          | null;
        throw new Error(payload?.errors?.email ?? "حدث خطأ غير متوقع");
      }

      setDone(true);
      setEmail("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "حدث خطأ غير متوقع");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-2.5 text-[0.82rem] text-sage-600">
        <Check className="size-4 shrink-0" aria-hidden />
        أصبحتِ على القائمة. ترقّبي رسالة جميلة في بريدك.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2.5" noValidate>
      <div className="flex gap-2">
        <label htmlFor={`newsletter-${source}`} className="sr-only">
          البريد الإلكتروني
        </label>
        <Input
          id={`newsletter-${source}`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `newsletter-${source}-error` : undefined}
          className="border-white/15 bg-white/10 text-start text-cream-100 placeholder:text-cream-100/40 focus:bg-white/15"
        />
        <Button
          type="submit"
          variant="gold"
          loading={pending}
          className="shrink-0"
          aria-label="اشتراك في القائمة البريدية"
        >
          {pending ? null : <ArrowLeft className="size-4" aria-hidden />}
        </Button>
      </div>
      {error ? (
        <p
          id={`newsletter-${source}-error`}
          role="alert"
          className="text-[0.72rem] text-blush-300"
        >
          {error}
        </p>
      ) : (
        <p className="text-[0.68rem] text-cream-100/45">
          رسائل قليلة عن الإصدارات الجديدة، ويمكنك إلغاء الاشتراك في أي وقت.
        </p>
      )}
    </form>
  );
}
