import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Package, Sparkles, Wallet } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Badge, Divider } from "@/components/ui/primitives";
import { fetchOrderByNumber } from "@/lib/account";
import { COMMERCE, ORDER_STATUS_LABELS, SITE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "تم تأكيد الطلب",
  robots: { index: false, follow: false },
};

const TIMELINE = [
  { label: "استلمنا طلبك", copy: "سنتصل بك للتأكيد" },
  { label: "في الأتيليه", copy: "يُغلَّف ويُفحص" },
  { label: "في الطريق", copy: "يتواصل معك المندوب" },
  { label: "تم التسليم", copy: "والدفع نقداً عند الباب" },
];

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await fetchOrderByNumber(orderNumber) : null;

  // A real order number that RLS will not hand back is a different situation
  // from demo mode, and worth telling the shopper apart.
  const missing = Boolean(orderNumber) && isSupabaseConfigured && order === null;

  return (
    <div className="container-x pt-12 pb-20 sm:pt-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-sage-400/25 text-sage-600">
            <CheckCircle2 className="size-7" aria-hidden />
          </span>
          <p className="eyebrow mt-6 text-rose-600">شكراً لك</p>
          <h1 className="mt-4 text-[clamp(1.8rem,4.4vw,2.8rem)] leading-[1.2]">
            تم <span className="text-rose-700">تأكيد طلبك</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[0.92rem] leading-relaxed text-plum-500">
            وصلنا طلبك وسنتواصل معك على{" "}
            <span className="latin text-plum-700">{order?.email ?? "بريدك"}</span> لتأكيد
            العنوان قبل الخروج للتوصيل. كل طلب يغادر الأتيليه مغلّفاً بورق معاد تدويره
            ومعه عينتان مجانيتان.
          </p>

          {orderNumber ? (
            <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full bg-white/80 px-5 py-2.5 ring-1 ring-blush-200">
              <span className="text-[0.72rem] text-plum-400">رقم الطلب</span>
              <span className="latin font-display text-lg text-plum-900">
                {orderNumber}
              </span>
            </p>
          ) : null}
        </div>

        {!isSupabaseConfigured ? (
          <div className="glass mt-8 flex flex-col items-start gap-3 rounded-3xl p-6">
            <Badge tone="gold">وضع تجريبي</Badge>
            <p className="text-[0.85rem] leading-relaxed text-plum-600">
              لم يتم ربط Supabase، لذلك تمت محاكاة هذا الطلب بالكامل ولم يُكتب أي شيء في
              قاعدة البيانات. اربطي مشروعك (راجعي{" "}
              <span className="font-medium">README → الإعداد</span>) وسيُسجَّل الطلب فعلياً
              ويظهر في حسابك، محمياً بسياسات Row Level Security.
            </p>
          </div>
        ) : null}

        {missing ? (
          <div className="glass mt-8 rounded-3xl p-6">
            <p className="text-[0.85rem] leading-relaxed text-plum-600">
              لم نجد رقم الطلب هذا على حسابك. إن كنت قد أكملت الطلب ببريد آخر، راسلينا على{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="latin text-rose-700 underline decoration-rose-300 underline-offset-4"
              >
                {SITE.email}
              </a>{" "}
              وسنتابعه لك.
            </p>
          </div>
        ) : null}

        {order ? (
          <div className="glass mt-8 overflow-hidden rounded-4xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blush-200 px-6 py-5">
              <div>
                <p className="eyebrow text-plum-400">تاريخ الطلب</p>
                <p className="mt-1.5 text-[0.85rem] text-plum-700">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p className="eyebrow text-plum-400">الحالة</p>
                <p className="mt-1.5">
                  <Badge tone={order.status === "pending" ? "cream" : "sage"}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </p>
              </div>
              <div className="text-end">
                <p className="eyebrow text-plum-400">الإجمالي</p>
                <p className="mt-1.5 font-display text-xl text-plum-900">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>

            <ul className="divide-y divide-blush-200/70">
              {(order.items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cream-200 ring-1 ring-blush-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-blush-400">
                        <Package className="size-5" aria-hidden />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    {item.product_slug ? (
                      <Link
                        href={`/product/${item.product_slug}`}
                        className="block truncate text-[0.85rem] font-medium text-plum-800 transition-colors hover:text-rose-700"
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      <span className="block truncate text-[0.85rem] font-medium text-plum-800">
                        {item.product_name}
                      </span>
                    )}
                    {item.variant_label ? (
                      <span className="block truncate text-[0.72rem] text-plum-400">
                        {item.variant_label}
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-[0.72rem] text-plum-400">
                      الكمية {item.quantity}
                    </span>
                  </span>
                  <span className="num shrink-0 text-[0.85rem] text-plum-700">
                    {formatPrice(item.line_total)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-blush-200 px-6 py-5">
              <dl className="space-y-2 text-[0.85rem]">
                <div className="flex justify-between">
                  <dt className="text-plum-500">المجموع الفرعي</dt>
                  <dd className="num text-plum-800">
                    {formatPrice(order.subtotal)}
                  </dd>
                </div>
                {order.discount_total > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-sage-600">
                      الخصم
                      {order.discount_code ? (
                        <>
                          {" "}
                          (<span className="latin">{order.discount_code}</span>)
                        </>
                      ) : null}
                    </dt>
                    <dd className="num text-sage-600">
                      −{formatPrice(order.discount_total)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-plum-500">
                    التوصيل{order.shipping_method === "express" ? " (سريع)" : ""}
                  </dt>
                  <dd className="num text-plum-800">
                    {order.shipping_cost === 0 ? (
                      <span className="text-sage-600">مجاني</span>
                    ) : (
                      formatPrice(order.shipping_cost)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-plum-500">{COMMERCE.taxLabel}</dt>
                  <dd className="num text-plum-800">{formatPrice(order.tax)}</dd>
                </div>
              </dl>
              <Divider className="my-4" />
              <div className="flex items-baseline justify-between">
                <span className="text-[0.82rem] text-plum-600">الإجمالي المستحق</span>
                <span className="font-display text-2xl text-plum-900">
                  {formatPrice(order.total)}
                </span>
              </div>
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-sage-400/12 px-3.5 py-2.5 text-[0.78rem] text-sage-600">
                <Wallet className="size-4 shrink-0" aria-hidden />
                يُدفع {formatPrice(order.total)} نقداً لمندوب التوصيل عند التسليم
              </p>
            </div>

            <div className="border-t border-blush-200 bg-white/40 px-6 py-5">
              <p className="eyebrow mb-3 text-plum-400">التوصيل إلى</p>
              <address className="text-[0.85rem] leading-relaxed text-plum-600 not-italic">
                {order.customer_name}
                <br />
                {order.shipping_address.addressLine1}
                {order.shipping_address.addressLine2 ? (
                  <>
                    <br />
                    {order.shipping_address.addressLine2}
                  </>
                ) : null}
                <br />
                {order.shipping_address.city}، {order.shipping_address.state}{" "}
                {order.shipping_address.postalCode}
                <br />
                {order.shipping_address.country}
                <br />
                <span className="latin">{order.shipping_address.phone}</span>
              </address>
            </div>
          </div>
        ) : null}

        {/* Timeline */}
        <ol className="mt-10 grid gap-4 sm:grid-cols-4">
          {TIMELINE.map((step, index) => (
            <li key={step.label} className="text-center sm:text-start">
              <span
                className={
                  index === 0
                    ? "mx-auto flex size-9 items-center justify-center rounded-full bg-sage-400/30 text-sage-600 sm:mx-0"
                    : "mx-auto flex size-9 items-center justify-center rounded-full bg-blush-100 text-plum-400 sm:mx-0"
                }
              >
                <Sparkles className="size-4" aria-hidden />
              </span>
              <p className="mt-3 text-[0.82rem] font-medium text-plum-800">{step.label}</p>
              <p className="mt-0.5 text-[0.72rem] text-plum-400">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className={buttonClasses("gold", "lg")}>
            متابعة التسوّق
          </Link>
          <Link href="/account/orders" className={buttonClasses("outline", "lg")}>
            تتبّع طلباتي
          </Link>
        </div>
      </div>
    </div>
  );
}
