import Link from "next/link";
import { Receipt, Wallet } from "lucide-react";

import { OrderStatusControl } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/primitives";
import { fetchAdminOrders } from "@/lib/admin";
import { COMMERCE, ORDER_STATUS_LABELS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { countOf } from "@/lib/format";
import { formatDate, formatNumber, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "الطلبات",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const orders = await fetchAdminOrders(60);
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl">الطلبات</h2>
        <p className="mt-1.5 text-[0.85rem] text-plum-500">
          {countOf(orders.length, "order")} ·{" "}
          <span className="num">{formatPrice(revenue, { compact: true })}</span> محصّلة
          أو مستحقة
        </p>
      </header>

      {!isSupabaseConfigured ? (
        <p className="rounded-2xl border border-gold-300 bg-gold-200/50 px-4 py-3 text-[0.85rem] text-plum-600">
          وضع تجريبي: لا تُخزَّن أي طلبات. اربطي Supabase وشغّلي المخطط لتظهر الطلبات
          الحقيقية هنا.
        </p>
      ) : null}

      <p className="flex items-center gap-2.5 rounded-2xl bg-sage-400/12 px-4 py-3 text-[0.82rem] text-sage-600">
        <Wallet className="size-4 shrink-0" aria-hidden />
        جميع الطلبات تُدفع نقداً عند التسليم — حدّثي الحالة إلى «مدفوع» بعد تحصيل
        المبلغ.
      </p>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-6" aria-hidden />}
          title="لا توجد طلبات بعد"
          copy="تظهر الطلبات لحظة إتمام أي عميلة لعملية الشراء، مع قطعها ومجاميعها وعنوان التوصيل."
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="glass overflow-hidden rounded-4xl">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-5">
                <div>
                  <p className="latin font-display text-lg text-plum-900">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-plum-400">
                    {formatDate(order.created_at)} ·{" "}
                    {countOf(order.items?.length ?? 0, "line")}
                  </p>
                </div>

                <div className="min-w-44">
                  <p className="text-[0.85rem] font-medium text-plum-800">
                    {order.customer_name}
                  </p>
                  <p className="latin text-[0.72rem] text-plum-400">{order.email}</p>
                </div>

                <Badge
                  tone={
                    order.status === "pending"
                      ? "cream"
                      : order.status === "cancelled"
                        ? "rose"
                        : order.status === "delivered"
                          ? "sage"
                          : "gold"
                  }
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>

                <p className="num font-display text-xl text-plum-900">
                  {formatPrice(order.total)}
                </p>

                <OrderStatusControl orderId={order.id} status={order.status} />
              </div>

              <div className="border-t border-blush-200 bg-white/40 px-6 py-4">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <ul className="space-y-2.5">
                    {(order.items ?? []).map((item) => (
                      <li key={item.id} className="flex items-baseline gap-3">
                        <span className="text-[0.82rem] text-plum-700">
                          <span className="num">{item.quantity}</span> ×{" "}
                          {item.product_name}
                        </span>
                        {item.variant_label ? (
                          <span className="text-[0.72rem] text-plum-400">
                            {item.variant_label}
                          </span>
                        ) : null}
                        <span className="num ms-auto text-[0.8rem] text-plum-500">
                          {formatPrice(item.line_total)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    <address className="text-[0.8rem] leading-relaxed text-plum-500 not-italic">
                      <span className="eyebrow mb-1.5 block text-plum-400">
                        التوصيل إلى
                      </span>
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
                      <a
                        href={`tel:${order.shipping_address.phone.replace(/[^+\d]/g, "")}`}
                        className="latin transition-colors hover:text-plum-800"
                      >
                        {order.shipping_address.phone}
                      </a>
                    </address>

                    <dl className="space-y-1 text-[0.78rem]">
                      <div className="flex justify-between">
                        <dt className="text-plum-400">المجموع الفرعي</dt>
                        <dd className="num text-plum-600">
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
                        <dt className="text-plum-400">
                          التوصيل
                          {order.shipping_method === "express" ? " (سريع)" : ""}
                        </dt>
                        <dd className="num text-plum-600">
                          {formatPrice(order.shipping_cost)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-plum-400">{COMMERCE.taxLabel}</dt>
                        <dd className="num text-plum-600">{formatPrice(order.tax)}</dd>
                      </div>
                      <div className="flex justify-between border-t border-blush-200 pt-1.5">
                        <dt className="text-plum-600">الإجمالي</dt>
                        <dd className="num text-plum-800">
                          {formatPrice(order.total)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-plum-400">طريقة الدفع</dt>
                        <dd className="text-plum-600">{COMMERCE.paymentLabel}</dd>
                      </div>
                    </dl>

                    {order.notes ? (
                      <p className="rounded-xl bg-blush-50 px-3 py-2 text-[0.75rem] text-plum-500">
                        ملاحظة: {order.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-[0.75rem] text-plum-400">
        يمكن للمشرفات قراءة كل الطلبات؛ أما العميلات فلا يرين سوى طلباتهن.{" "}
        <Link href="/about#privacy" className="underline underline-offset-4">
          سياسة الخصوصية
        </Link>
        {orders.length > 0 ? (
          <>
            {" "}
            · يُعرض{" "}
            <span className="num">{formatNumber(orders.length)}</span> كحد أقصى
          </>
        ) : null}
      </p>
    </div>
  );
}
