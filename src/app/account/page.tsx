import Link from "next/link";
import { ShoppingBag, Sparkles, Wallet } from "lucide-react";

import { ProfileForm } from "@/components/account/profile-form";
import { buttonClasses } from "@/components/ui/button";
import { Badge, Divider, EmptyState } from "@/components/ui/primitives";
import { fetchOrders, fetchWishlistIds } from "@/lib/account";
import { COMMERCE, ORDER_STATUS_LABELS } from "@/lib/constants";
import { countOf } from "@/lib/format";
import { getCurrentProfile } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "بياناتي",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const [profile, orders, wishlist] = await Promise.all([
    getCurrentProfile(),
    fetchOrders({ limit: 3 }),
    fetchWishlistIds(),
  ]);

  const lifetime = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-10">
      <section className="glass rounded-4xl p-6 sm:p-8">
        <h2 className="text-xl">بياناتي</h2>
        <p className="mt-1.5 mb-7 text-[0.85rem] text-plum-500">
          محفوظة بخصوصية ومحمية بسياسات Row Level Security — لا يمكن لأحد غيرك (ومشرفة
          الدعم لأغراض الطلبات) قراءتها.
        </p>

        <ProfileForm
          defaults={{
            fullName: profile?.full_name ?? "",
            phone: profile?.phone ?? "",
            email: profile?.email ?? "",
          }}
        />
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "الطلبات", value: orders.length },
            { label: "القطع المحفوظة", value: wishlist.size },
            { label: "أحدث المشتريات", value: formatPrice(lifetime, { compact: true }) },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-3xl p-5">
              <p className="num font-display text-[1.8rem] leading-none text-plum-900">
                {stat.value}
              </p>
              <p className="mt-2 text-[0.72rem] text-plum-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl">أحدث الطلبات</h2>
          {orders.length > 0 ? (
            <Link
              href="/account/orders"
              className="text-[0.8rem] text-rose-700 underline decoration-rose-300 underline-offset-4 transition-colors hover:decoration-rose-700"
            >
              عرض الكل
            </Link>
          ) : null}
        </div>

        <Divider className="my-6" />

        {orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-6" aria-hidden />}
            title="لا توجد طلبات بعد"
            copy="سيظهر طلبك الأول هنا، مع حالة التوصيل وإمكانية إعادة الطلب بضغطة."
            action={
              <Link href="/shop" className={buttonClasses("gold", "md")}>
                اعثري على شيء جميل
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4"
              >
                <div>
                  <p className="latin font-display text-lg text-plum-900">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] text-plum-400">
                    {formatDate(order.created_at)} ·{" "}
                    {countOf(order.items?.length ?? 0, "piece")}
                  </p>
                </div>
                <Badge tone={order.status === "pending" ? "cream" : "sage"}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <p className="num text-[0.9rem] text-plum-800">
                  {formatPrice(order.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-4xl bg-gradient-to-br from-plum-800 via-rose-800 to-rose-600 px-7 py-9 sm:px-9">
        <p className="eyebrow flex items-center gap-2.5 text-gold-300">
          <Sparkles className="size-3.5" aria-hidden />
          للعميلات فقط
        </p>
        <h2 className="mt-3.5 text-[clamp(1.3rem,2.8vw,1.8rem)] leading-tight text-cream-100">
          احجزي جلسة مجانية لمطابقة الدرجات
        </h2>
        <p className="mt-3 max-w-lg text-[0.85rem] leading-relaxed text-cream-100/70">
          خمس وأربعون دقيقة مع إحدى خبيرات المكياج، في الأتيليه أو عبر مكالمة فيديو.
          مجاناً مع أي شراء، و{COMMERCE.paymentLabel} في كل المحافظات.
        </p>
        <Link
          href="/about#contact"
          className={buttonClasses(
            "outline",
            "md",
            "mt-6 border-white/50 bg-white/95 text-plum-800 hover:border-white hover:bg-white",
          )}
        >
          احجزي موعدك
        </Link>
      </section>

      <p className="flex items-center justify-center gap-2.5 text-[0.75rem] text-plum-400">
        <Wallet className="size-3.5" aria-hidden />
        جميع طلباتك تُدفع نقداً عند التسليم
      </p>
    </div>
  );
}
