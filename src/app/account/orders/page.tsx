import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Badge, Divider, EmptyState, type BadgeTone } from "@/components/ui/primitives";
import { fetchOrders } from "@/lib/account";
import { COMMERCE, ORDER_STATUS_LABELS } from "@/lib/constants";
import { countOf } from "@/lib/format";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const metadata = {
  title: "طلباتي",
  robots: { index: false, follow: false },
};

const STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  pending: "cream",
  paid: "sage",
  processing: "sage",
  shipped: "gold",
  delivered: "sage",
  cancelled: "rose",
};

export default async function OrdersPage() {
  const orders = await fetchOrders({ limit: 50 });

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="size-6" aria-hidden />}
        title="لا توجد طلبات بعد"
        copy="بمجرّد أن تؤكّدي طلباً ستجدينه هنا، مع حالته وإمكانية إعادة الطلب بضغطة."
        action={
          <Link href="/shop" className={buttonClasses("gold", "md")}>
            تصفّحي المتجر
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl">طلباتي</h2>
        <p className="mt-1.5 text-[0.85rem] text-plum-500">
          {countOf(orders.length, "order")} من هذا الحساب.
        </p>
      </header>

      <ul className="space-y-5">
        {orders.map((order) => (
          <li key={order.id} className="glass overflow-hidden rounded-4xl">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5">
              <div>
                <p className="eyebrow text-plum-400">رقم الطلب</p>
                <p className="latin mt-1.5 font-display text-lg text-plum-900">
                  {order.order_number}
                </p>
              </div>
              <div>
                <p className="eyebrow text-plum-400">التاريخ</p>
                <p className="mt-1.5 text-[0.83rem] text-plum-600">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p className="eyebrow text-plum-400">الإجمالي</p>
                <p className="num mt-1.5 text-[0.9rem] text-plum-800">
                  {formatPrice(order.total)}
                </p>
              </div>
              <Badge tone={STATUS_TONES[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>

            <Divider className="[&>span]:bg-blush-300" />

            <ul className="divide-y divide-blush-200/60">
              {(order.items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream-200 ring-1 ring-blush-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-blush-400">
                        <Package className="size-4" aria-hidden />
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
                    <span className="block truncate text-[0.72rem] text-plum-400">
                      {item.variant_label ? `${item.variant_label} · ` : ""}
                      الكمية {item.quantity}
                    </span>
                  </span>
                  <span className="num shrink-0 text-[0.83rem] text-plum-700">
                    {formatPrice(item.line_total)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-blush-200 bg-white/40 px-6 py-4">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[0.8rem] text-plum-600 transition-colors hover:text-plum-900">
                  تفاصيل التوصيل والفاتورة
                  <span
                    aria-hidden
                    className="text-blush-400 transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <address className="text-[0.8rem] leading-relaxed text-plum-500 not-italic">
                    <span className="eyebrow mb-2 block text-plum-400">
                      التوصيل إلى
                    </span>
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

                  <dl className="space-y-1.5 text-[0.8rem]">
                    <div className="flex justify-between">
                      <dt className="text-plum-500">المجموع الفرعي</dt>
                      <dd className="num text-plum-700">
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
                        التوصيل
                        {order.shipping_method === "express" ? " (سريع)" : ""}
                      </dt>
                      <dd className="num text-plum-700">
                        {order.shipping_cost === 0
                          ? "مجاني"
                          : formatPrice(order.shipping_cost)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-plum-500">{COMMERCE.taxLabel}</dt>
                      <dd className="num text-plum-700">{formatPrice(order.tax)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-blush-200 pt-1.5">
                      <dt className="text-plum-700">الإجمالي</dt>
                      <dd className="num text-plum-900">
                        {formatPrice(order.total)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-plum-500">طريقة الدفع</dt>
                      <dd className="text-plum-700">{COMMERCE.paymentLabel}</dd>
                    </div>
                  </dl>
                </div>

                {order.notes ? (
                  <p className="mt-4 rounded-xl bg-blush-50 px-3.5 py-2.5 text-[0.78rem] text-plum-500">
                    ملاحظة: {order.notes}
                  </p>
                ) : null}
              </details>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
