import Link from "next/link";
import { Heart, LayoutDashboard, Package, User } from "lucide-react";

import { Badge } from "@/components/ui/primitives";
import { getCurrentProfile } from "@/lib/supabase/server";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/account", label: "بياناتي", icon: User },
  { href: "/account/orders", label: "طلباتي", icon: Package },
  { href: "/account/wishlist", label: "قائمة الأمنيات", icon: Heart },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="container-x pt-10 pb-20 sm:pt-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-gold-500 font-display text-xl text-white"
          >
            {initials(profile?.full_name ?? profile?.email ?? "زائرة")}
          </span>
          <div>
            <p className="eyebrow text-rose-600">حسابك</p>
            <h1 className="mt-2 text-[clamp(1.5rem,3.2vw,2.1rem)] leading-tight">
              {profile?.full_name ?? "أهلاً بعودتك"}
            </h1>
            <p className="latin mt-1 text-[0.78rem] text-plum-500">
              {profile?.email}
            </p>
          </div>
        </div>

        {profile?.role === "admin" ? (
          <Link
            href="/admin"
            className="inline-flex items-center gap-2.5 rounded-full bg-plum-800 px-5 py-3 text-[0.8rem] text-cream-100 transition-colors hover:bg-plum-700"
          >
            <LayoutDashboard className="size-4" aria-hidden />
            لوحة التحكم
          </Link>
        ) : (
          <Badge tone="cream">عميلة منذ {new Date().getFullYear()}</Badge>
        )}
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
        <nav aria-label="أقسام الحساب" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto hide-scrollbar lg:flex-col lg:gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.85rem] whitespace-nowrap text-plum-600 transition-colors hover:bg-white/80 hover:text-plum-900"
                >
                  <Icon className="size-4 text-rose-500" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
