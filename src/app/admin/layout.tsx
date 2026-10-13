import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Receipt, Sparkles, Store } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: Receipt },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  // Middleware already guards /admin; this is the second, independent check so
  // the dashboard is never rendered by a route that forgot the gate.
  if (isSupabaseConfigured && profile?.role !== "admin") {
    redirect(
      profile ? "/account?error=forbidden" : "/login?redirectTo=/admin&reason=auth",
    );
  }

  return (
    <div className="container-x pt-10 pb-20 sm:pt-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow flex items-center gap-2.5 text-rose-600">
            <Sparkles className="size-3.5" aria-hidden />
            خلف الكواليس
          </p>
          <h1 className="mt-3 text-[clamp(1.7rem,3.8vw,2.5rem)] leading-tight">
            لوحة <span className="text-rose-700">التحكم</span>
          </h1>
          <p className="mt-2 text-[0.85rem] text-plum-500">
            مسجّلة الدخول باسم{" "}
            <span className="latin text-plum-700">{profile?.email ?? "مشرفة"}</span>
            {profile?.role === "admin" ? " · مشرفة" : ""}
          </p>
        </div>

        <Link href="/" className={buttonClasses("outline", "md", "gap-2.5")}>
          <Store className="size-4" aria-hidden />
          عرض المتجر
        </Link>
      </header>

      <nav aria-label="أقسام لوحة التحكم" className="mt-10">
        <ul className="flex gap-2 overflow-x-auto hide-scrollbar">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className="flex items-center gap-2.5 rounded-full bg-white/70 px-4.5 py-2.5 text-[0.82rem] whitespace-nowrap text-plum-600 ring-1 ring-blush-200 transition-all hover:bg-white hover:text-plum-900 hover:ring-rose-300"
              >
                <Icon className="size-4 text-rose-500" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
