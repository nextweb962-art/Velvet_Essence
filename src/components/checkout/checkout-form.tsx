"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Info, ShoppingBag, Tag, Wallet, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { Button, buttonClasses } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge, Divider, EmptyState } from "@/components/ui/primitives";
import { computeTotals } from "@/lib/cart";
import { COMMERCE, GOVERNORATES, SHIPPING_OPTIONS, SITE } from "@/lib/constants";
import { resolveDiscount } from "@/lib/discounts";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

type Defaults = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export function CheckoutForm({ defaults }: { defaults: Defaults }) {
  const router = useRouter();
  const { lines, clear, hydrated } = useCart();

  const [form, setForm] = useState<Defaults>(defaults);
  const [notes, setNotes] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Discount preview — the authoritative calculation happens server-side. */
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<{ code: string; amount: number } | null>(
    null,
  );
  const [codeError, setCodeError] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      Math.round(
        lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) * 100,
      ) / 100,
    [lines],
  );

  const totals = useMemo(
    () => computeTotals(lines, { shippingMethod, discount: appliedCode }),
    [lines, shippingMethod, appliedCode],
  );

  function update<K extends keyof Defaults>(key: K, value: Defaults[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[`shipping.${key}`]) return current;
      const next = { ...current };
      delete next[`shipping.${key}`];
      return next;
    });
  }

  function applyCode() {
    const result = resolveDiscount(codeInput, subtotal);
    if (!result.ok) {
      setAppliedCode(null);
      setCodeError(result.reason);
      return;
    }
    setCodeError(null);
    setAppliedCode({ code: result.discount.code, amount: result.discount.amount });
    setCodeInput("");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (lines.length === 0) {
      setFormError("سلّتك فارغة.");
      return;
    }

    /* Client-side pass for instant feedback. The server validates again. */
    const candidate = {
      email: form.email,
      shipping: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: "الأردن" as const,
      },
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        variantGroupId: line.groupId,
        variantOptionId: line.optionId,
      })),
      notes,
      shippingMethod,
      paymentMethod: COMMERCE.paymentMethod,
      discountCode: appliedCode?.code ?? "",
    };

    const parsed = checkoutSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error);
      setErrors(fieldErrors);
      setFormError("الرجاء مراجعة الحقول المظللة.");
      document
        .querySelector<HTMLElement>("[aria-invalid='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            orderNumber?: string;
            error?: string;
            errors?: FieldErrors;
            needsAuth?: boolean;
          }
        | null;

      if (response.status === 401 || payload?.needsAuth) {
        router.push("/login?redirectTo=/checkout&reason=auth");
        return;
      }

      if (!response.ok || !payload?.orderNumber) {
        if (payload?.errors) setErrors(payload.errors);
        throw new Error(payload?.error ?? "تعذّر إتمام طلبك.");
      }

      if (marketingOptIn) {
        // Fire and forget — a failed signup must never block an order.
        void fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, source: "landing" }),
        });
      }

      clear();
      router.push(`/checkout/success?order=${encodeURIComponent(payload.orderNumber)}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "حدث خطأ غير متوقع.");
    } finally {
      setSubmitting(false);
    }
  }

  if (hydrated && lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" aria-hidden />}
        title="سلّتك فارغة"
        copy="أضيفي أحمر شفاه أو عطراً وسيظهر ملخّص طلبك هنا."
        action={
          <Link href="/shop" className={buttonClasses("gold", "md")}>
            تصفّحي المتجر
          </Link>
        }
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-10 lg:grid-cols-[1fr_23rem] lg:gap-14"
    >
      <div className="space-y-9">
        {formError ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50/80 px-4 py-3.5"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-700" aria-hidden />
            <p className="text-[0.85rem] text-rose-900">{formError}</p>
          </div>
        ) : null}

        {/* Contact */}
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-xl">
            1 · بيانات التواصل
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="البريد الإلكتروني"
              htmlFor="email"
              error={errors.email}
              className="sm:col-span-2"
              hint="لإرسال تأكيد الطلب"
            >
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
              label="الاسم الكامل"
              htmlFor="fullName"
              error={errors["shipping.fullName"]}
            >
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                aria-invalid={Boolean(errors["shipping.fullName"])}
                placeholder="أمل الزعبي"
              />
            </Field>
            <Field
              label="رقم الجوال"
              htmlFor="phone"
              error={errors["shipping.phone"]}
              hint="مثال: 0791234567"
            >
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                dir="ltr"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                aria-invalid={Boolean(errors["shipping.phone"])}
                placeholder="0791234567"
                className="text-start"
              />
            </Field>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={marketingOptIn}
              onChange={(event) => setMarketingOptIn(event.target.checked)}
              className="mt-0.5"
            />
            <span className="text-[0.8rem] leading-relaxed text-plum-600">
              أرسلوا لي رسائل عن الإصدارات الجديدة والمحدودة. يمكنك إلغاء الاشتراك في أي
              وقت، ولن يؤثّر ذلك على طلبك.
            </span>
          </label>
        </section>

        <Divider />

        {/* Shipping address */}
        <section aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="text-xl">
            2 · عنوان التوصيل
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="الشارع ورقم المبنى"
              htmlFor="addressLine1"
              error={errors["shipping.addressLine1"]}
              className="sm:col-span-2"
            >
              <Input
                id="addressLine1"
                name="addressLine1"
                autoComplete="address-line1"
                value={form.addressLine1}
                onChange={(event) => update("addressLine1", event.target.value)}
                aria-invalid={Boolean(errors["shipping.addressLine1"])}
                placeholder="شارع المدينة المنورة، مبنى 18"
              />
            </Field>
            <Field
              label="الطابق أو الشقة"
              htmlFor="addressLine2"
              optional
              className="sm:col-span-2"
            >
              <Input
                id="addressLine2"
                name="addressLine2"
                autoComplete="address-line2"
                value={form.addressLine2}
                onChange={(event) => update("addressLine2", event.target.value)}
                placeholder="الطابق الثالث، شقة 4"
              />
            </Field>
            <Field label="المدينة أو المنطقة" htmlFor="city" error={errors["shipping.city"]}>
              <Input
                id="city"
                name="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                aria-invalid={Boolean(errors["shipping.city"])}
                placeholder="عبدون"
              />
            </Field>
            <Field
              label="المحافظة"
              htmlFor="state"
              error={errors["shipping.state"]}
            >
              <Select
                id="state"
                name="state"
                autoComplete="address-level1"
                value={form.state}
                onChange={(event) => update("state", event.target.value)}
                aria-invalid={Boolean(errors["shipping.state"])}
              >
                <option value="">اختاري المحافظة</option>
                {GOVERNORATES.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="الرمز البريدي"
              htmlFor="postalCode"
              error={errors["shipping.postalCode"]}
              hint="5 أرقام"
            >
              <Input
                id="postalCode"
                name="postalCode"
                autoComplete="postal-code"
                inputMode="numeric"
                dir="ltr"
                value={form.postalCode}
                onChange={(event) => update("postalCode", event.target.value)}
                aria-invalid={Boolean(errors["shipping.postalCode"])}
                placeholder="11185"
                className="text-start"
              />
            </Field>
            <Field label="الدولة" htmlFor="country">
              <Input id="country" name="country" value="الأردن" disabled readOnly />
            </Field>
          </div>
        </section>

        <Divider />

        {/* Delivery */}
        <section aria-labelledby="delivery-heading">
          <h2 id="delivery-heading" className="text-xl">
            3 · التوصيل
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {SHIPPING_OPTIONS.map((option) => {
              const price =
                option.id === "express"
                  ? COMMERCE.expressShippingRate
                  : subtotal >= COMMERCE.freeShippingThreshold
                    ? 0
                    : COMMERCE.flatShippingRate;

              return (
                <li key={option.id}>
                  <label
                    className={
                      shippingMethod === option.id
                        ? "flex cursor-pointer items-start gap-3 rounded-2xl border border-rose-500 bg-white p-4 shadow-soft transition-all duration-300"
                        : "flex cursor-pointer items-start gap-3 rounded-2xl border border-blush-200 bg-white/60 p-4 transition-all duration-300 hover:border-blush-300 hover:bg-white"
                    }
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={option.id}
                      checked={shippingMethod === option.id}
                      onChange={() => setShippingMethod(option.id)}
                      className="mt-1 size-4 accent-[var(--color-rose-600)]"
                    />
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-[0.88rem] font-medium text-plum-800">
                          {option.label}
                        </span>
                        <span className="num text-[0.85rem] text-plum-700">
                          {price === 0 ? "مجاني" : formatPrice(price)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[0.75rem] text-plum-400">
                        {option.copy}
                      </span>
                      <span className="mt-0.5 block text-[0.7rem] text-plum-400">
                        {option.note}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <Field
            label="ملاحظات للمندوب"
            htmlFor="notes"
            optional
            hint="أرقام الدخول، أو رسالة هدية"
            className="mt-5"
          >
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="اتركوا الطلب عند الاستقبال، مع الشكر."
            />
          </Field>
        </section>

        <Divider />

        {/* Payment — cash on delivery, no card step */}
        <section aria-labelledby="payment-heading">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="payment-heading" className="text-xl">
              4 · طريقة الدفع
            </h2>
            <Badge tone="sage">
              <Check className="size-3" aria-hidden />
              بدون بطاقة
            </Badge>
          </div>

          <div className="mt-5 rounded-2xl border border-sage-400/45 bg-sage-400/10 p-5">
            <div className="flex items-start gap-3">
              <Wallet className="mt-0.5 size-5 shrink-0 text-sage-600" aria-hidden />
              <div>
                <p className="text-[0.95rem] font-medium text-plum-800">
                  {COMMERCE.paymentLabel}
                </p>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-plum-600">
                  ادفعي نقداً لمندوب التوصيل عند وصول الطلب إلى بابك. لا نطلب أي بيانات
                  بطاقة، ولا يُخصم أي مبلغ قبل التسليم.
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-sage-400/30 pt-4">
              {[
                "افحصي الطلب قبل الدفع — ولديك حق الإرجاع خلال ٣٠ يوماً",
                "إيصال رسمي مرفق مع كل طلب",
                "متاح في جميع محافظات المملكة",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[0.78rem] text-plum-600"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0 text-sage-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 flex items-start gap-2.5 text-[0.75rem] text-plum-400">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            هذه نسخة عرض: لا تتم أي عملية دفع فعلية، والطلب يُسجَّل مباشرة في قاعدة
            البيانات بحالة «قيد التأكيد».
          </p>
        </section>

        <div className="rounded-2xl border border-blush-200 bg-white/60 px-4 py-3.5">
          <p className="text-[0.78rem] leading-relaxed text-plum-500">
            بتأكيد الطلب فإنك توافقين على{" "}
            <Link
              href="/about#terms"
              className="text-rose-700 underline decoration-rose-300 underline-offset-4"
            >
              شروط البيع
            </Link>{" "}
            وتقرّرين بأنك اطّلعت على{" "}
            <Link
              href="/about#privacy"
              className="text-rose-700 underline decoration-rose-300 underline-offset-4"
            >
              سياسة الخصوصية
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Summary */}
      <aside aria-labelledby="summary-heading" className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-4xl p-6">
          <h2 id="summary-heading" className="text-lg">
            ملخّص الطلب
          </h2>

          <ul className="mt-5 space-y-4">
            {!hydrated
              ? Array.from({ length: 2 }).map((_, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="size-16 shrink-0 animate-shimmer rounded-xl bg-blush-100" />
                    <span className="flex-1 space-y-2 py-1">
                      <span className="block h-3 w-2/3 animate-shimmer rounded-full bg-blush-100" />
                      <span className="block h-3 w-1/3 animate-shimmer rounded-full bg-blush-100" />
                    </span>
                  </li>
                ))
              : lines.map((line) => (
                  <li key={line.key} className="flex gap-3.5">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cream-200 ring-1 ring-blush-200">
                      <Image
                        src={line.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <span className="num absolute end-0 bottom-0 flex size-5 items-center justify-center rounded-ss-lg bg-plum-800 text-[0.6rem] text-cream-100">
                        {line.quantity}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.82rem] font-medium text-plum-800">
                        {line.name}
                      </span>
                      {line.optionName ? (
                        <span className="block truncate text-[0.7rem] text-plum-400">
                          {line.optionName}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[0.78rem] text-plum-600">
                        {formatPrice(line.unitPrice * line.quantity)}
                      </span>
                    </span>
                  </li>
                ))}
          </ul>

          <Divider className="my-5" />

          {/* Discount */}
          {appliedCode ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-sage-400/15 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[0.78rem] text-sage-600">
                <Tag className="size-3.5" aria-hidden />
                <span className="latin">{appliedCode.code}</span> مُطبَّق
              </span>
              <span className="flex items-center gap-2">
                <span className="num text-[0.78rem] text-sage-600">
                  −{formatPrice(appliedCode.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCode(null)}
                  aria-label="إزالة رمز الخصم"
                  className="rounded-full p-1 text-sage-600 transition-colors hover:bg-sage-400/25"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={codeInput}
                  onChange={(event) => {
                    setCodeInput(event.target.value.toUpperCase());
                    setCodeError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyCode();
                    }
                  }}
                  placeholder="رمز الخصم"
                  aria-label="رمز الخصم"
                  aria-invalid={Boolean(codeError)}
                  dir="ltr"
                  className="latin h-10 text-[0.82rem]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyCode}
                  className="shrink-0"
                >
                  تطبيق
                </Button>
              </div>
              {codeError ? (
                <p role="alert" className="text-[0.72rem] text-rose-800">
                  {codeError}
                </p>
              ) : (
                <p className="text-[0.7rem] text-plum-400">
                  جرّبي{" "}
                  <span className="latin font-medium text-plum-500">WELCOME10</span>{" "}
                  لخصم ١٠٪ على طلبك الأول.
                </p>
              )}
            </div>
          )}

          <dl className="mt-4 space-y-2 text-[0.83rem]">
            <div className="flex justify-between">
              <dt className="text-plum-500">المجموع الفرعي</dt>
              <dd className="num text-plum-800">{formatPrice(totals.subtotal)}</dd>
            </div>
            {totals.discountTotal > 0 ? (
              <div className="flex justify-between">
                <dt className="text-sage-600">الخصم</dt>
                <dd className="num text-sage-600">
                  −{formatPrice(totals.discountTotal)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-plum-500">التوصيل</dt>
              <dd className="num text-plum-800">
                {totals.shipping === 0 ? (
                  <span className="text-sage-600">مجاني</span>
                ) : (
                  formatPrice(totals.shipping)
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-plum-500">{COMMERCE.taxLabel}</dt>
              <dd className="num text-plum-800">{formatPrice(totals.tax)}</dd>
            </div>
          </dl>

          <Divider className="my-4" />

          <div className="flex items-baseline justify-between">
            <span className="text-[0.82rem] text-plum-600">الإجمالي</span>
            <span className="font-display text-2xl text-plum-900">
              {formatPrice(totals.total)}
            </span>
          </div>

          <p className="mt-2 flex items-center gap-2 rounded-lg bg-plum-50 px-3 py-2 text-[0.72rem] text-plum-600">
            <Wallet className="size-3.5 shrink-0 text-sage-600" aria-hidden />
            يُدفع {formatPrice(totals.total)} نقداً عند التسليم
          </p>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={submitting}
            className="mt-5 w-full"
            disabled={!hydrated || lines.length === 0}
          >
            {submitting
              ? "جارٍ تأكيد الطلب…"
              : `تأكيد الطلب · ${formatPrice(totals.total)}`}
          </Button>

          <p className="mt-3 text-center text-[0.7rem] text-plum-400">
            سنتصل بك لتأكيد العنوان قبل الخروج للتوصيل
          </p>

          <ul className="mt-5 space-y-2">
            {["عينتان مجانيتان مع الطلب", "تغليف من ورق معاد تدويره"].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-[0.72rem] text-plum-500"
              >
                <Check className="size-3.5 shrink-0 text-sage-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-[0.72rem] text-plum-400">
          تحتاجين مساعدة؟{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="latin text-rose-700 underline decoration-rose-300 underline-offset-4"
          >
            {SITE.email}
          </a>
        </p>
      </aside>
    </form>
  );
}
