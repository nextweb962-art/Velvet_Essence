import Link from "next/link";
import { AlertTriangle, BadgeDollarSign, Package, Receipt, Users } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Badge, Divider, EmptyState } from "@/components/ui/primitives";
import { fetchAdminOrders, fetchAdminStats } from "@/lib/admin";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { initials } from "@/lib/format";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "نظرة عامة",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const [stats, orders] = await Promise.all([
    fetchAdminStats(),
    fetchAdminOrders(8),
  ]);

  const cards = [
    {
      label: "الإيرادات",
      value: formatPrice(stats.revenue, { compact: true }),
      detail: `متوسط الطلب ${formatPrice(stats.averageOrderValue, { compact: true })}`,
      icon: BadgeDollarSign,
    },
    {
      label: "الطلبات",
      value: stats.orderCount,
      detail: `${stats.pendingCount} بانتظار التأكيد`,
      icon: Receipt,
    },
    {
      label: "المنتجات المنشورة",
      value: stats.productCount,
      detail: `${stats.draftCount} مسودة`,
      icon: Package,
    },
    {
      label: "العميلات",
      value: stats.customerCount,
      detail: `${stats.lowStock} على وشك النفاد`,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-10">
      {!isSupabaseConfigured ? (
        <div className="rounded-3xl border border-gold-300 bg-gold-200/50 px-5 py-4">
          <p className="flex items-start gap-3 text-[0.85rem] leading-relaxed text-plum-600">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-gold-600"
              aria-hidden
            />
            <span>
              <strong className="font-medium">وضع تجريبي.</strong> لم يتم ربط Supabase،
              فلا يوجد ما يمكن إدارته بعد. شغّلي{" "}
              <code className="latin rounded bg-white/70 px-1.5 py-0.5 text-[0.75rem]">
                supabase/schema.sql
              </code>{" "}
              ثم{" "}
              <code className="latin rounded bg-white/70 px-1.5 py-0.5 text-[0.75rem]">
                supabase/seed.sql
              </code>
              ، ثم رقّي حسابك إلى <code className="latin">admin</code>. كل خطوات الإعداد
              موجودة في ملف الـ README.
            </span>
          </p>
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon }) => (
          <li key={label} className="glass rounded-4xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.72rem] text-plum-400">{label}</p>
              <Icon className="size-4 shrink-0 text-rose-500" aria-hidden />
            </div>
            <p className="num mt-4 font-display text-[2rem] leading-none text-plum-900">
              {value}
            </p>
            <p className="mt-2 text-[0.75rem] text-plum-400">{detail}</p>
          </li>
        ))}
      </ul>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl">أحدث الطلبات</h2>
            <p className="mt-1.5 text-[0.82rem] text-plum-500">
              حدّثي حالة التجهيز من صفحة الطلبات.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link href="/admin/orders" className={buttonClasses("outline", "sm")}>
              كل الطلبات
            </Link>
            <Link href="/admin/products/new" className={buttonClasses("gold", "sm")}>
              إضافة منتج
            </Link>
          </div>
        </div>

        <Divider className="my-6" />

        {orders.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-6" aria-hidden />}
            title="لا توجد طلبات بعد"
            copy="عند إتمام أي عميلة للطلب، سيظهر هنا مع قطعه وعنوان التوصيل."
          />
        ) : (
          <ul className="glass divide-y divide-blush-200/70 overflow-hidden rounded-4xl">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4"
              >
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-[0.72rem] font-medium text-rose-700"
                >
                  {initials(order.customer_name)}
                </span>

                <span className="min-w-40 flex-1">
                  <span className="block text-[0.85rem] font-medium text-plum-800">
                    {order.customer_name}
                  </span>
                  <span className="latin block text-[0.7rem] text-plum-400">
                    {order.email}
                  </span>
                </span>

                <span className="latin text-[0.78rem] text-plum-600">
                  {order.order_number}
                </span>

                <span className="text-[0.75rem] text-plum-400">
                  {formatDate(order.created_at)}
                </span>

                <Badge
                  tone={
                    order.status === "pending"
                      ? "cream"
                      : order.status === "cancelled"
                        ? "rose"
                        : "sage"
                  }
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>

                <span className="num text-[0.85rem] text-plum-800">
                  {formatPrice(order.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
