"use client";

import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { useCart } from "@/components/providers/cart-provider";
import { SearchDialog } from "@/components/search/search-dialog";
import { Badge } from "@/components/ui/primitives";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";

export type Viewer = {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
} | null;

const MAKEUP_CATEGORIES = CATEGORIES.filter((c) =>
  ["lipstick", "eyeshadow", "blush"].includes(c.id),
);

const NAV_LINKS = [
  { href: "/shop?sort=newest", label: "وصل حديثاً" },
  { href: "/shop?category=fragrance", label: "العطور" },
  { href: "/shop?category=skincare", label: "العناية بالبشرة" },
  { href: "/about", label: "عن الدار" },
];

export function Navbar({ viewer, demo }: { viewer: Viewer; demo: boolean }) {
  const pathname = usePathname();
  const { itemCount, openCart, hydrated } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Any navigation closes every transient panel. */
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  /* ⌘K / Ctrl-K opens search. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 ease-[var(--ease-silk)]",
          scrolled
            ? "border-b border-blush-200/70 bg-cream-100/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-x">
          <div
            className={cn(
              "flex items-center justify-between gap-4 transition-all duration-500",
              scrolled ? "h-16" : "h-20",
            )}
          >
            {/* Menu trigger — mirrors to the inline start of the row in RTL. */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={mobileOpen}
              className="-ms-2 rounded-full p-2 text-plum-700 transition-colors hover:bg-blush-100 lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <Logo
              compact={false}
              className={cn("shrink-0", scrolled && "lg:scale-[0.97] lg:origin-right")}
            />

            {/* Desktop navigation */}
            <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 lg:flex">
              <NavItem href="/shop?sort=newest" label="وصل حديثاً" pathname={pathname} />

              <div className="group relative">
                <NavItem href="/shop?category=lipstick" label="المكياج" pathname={pathname} />
                <div
                  className={cn(
                    "invisible absolute top-full start-1/2 z-10 w-64 translate-x-1/2 pt-3 opacity-0",
                    "transition-all duration-300 ease-[var(--ease-silk)]",
                    "group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
                  )}
                >
                  <div className="glass-strong overflow-hidden rounded-3xl p-2">
                    {MAKEUP_CATEGORIES.map((category) => (
                      <Link
                        key={category.id}
                        href={category.href}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-blush-100/80"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "size-9 shrink-0 rounded-full bg-gradient-to-br ring-1 ring-white/60",
                            category.accent,
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block text-[0.85rem] font-medium text-plum-800">
                            {category.label}
                          </span>
                          <span className="block text-[0.7rem] text-plum-400">
                            {category.blurb}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {NAV_LINKS.slice(1).map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  pathname={pathname}
                />
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="ابحثي عن منتج"
                className="rounded-full p-2.5 text-plum-700 transition-colors hover:bg-blush-100 hover:text-plum-900"
              >
                <Search className="size-[1.15rem]" aria-hidden />
              </button>

              {viewer ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((open) => !open)}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="حسابك"
                    className="rounded-full p-2.5 text-plum-700 transition-colors hover:bg-blush-100 hover:text-plum-900"
                  >
                    <User className="size-[1.15rem]" aria-hidden />
                  </button>
                  {accountOpen ? (
                    <>
                      <button
                        type="button"
                        aria-hidden
                        tabIndex={-1}
                        onClick={() => setAccountOpen(false)}
                        className="fixed inset-0 z-10 cursor-default"
                      />
                      <div
                        role="menu"
                        className="glass-strong animate-scale-in absolute top-full end-0 z-20 mt-2 w-60 origin-top-left overflow-hidden rounded-3xl p-2"
                      >
                        <div className="px-3 py-2.5">
                          <p className="truncate text-[0.85rem] font-medium text-plum-800">
                            {viewer.name ?? "أهلاً بعودتك"}
                          </p>
                          <p className="latin truncate text-[0.7rem] text-plum-400">
                            {viewer.email}
                          </p>
                        </div>
                        <div className="hairline my-1" />
                        <MenuLink href="/account" icon={<User className="size-4" />}>
                          حسابي
                        </MenuLink>
                        <MenuLink
                          href="/account/orders"
                          icon={<ShoppingBag className="size-4" />}
                        >
                          طلباتي
                        </MenuLink>
                        <MenuLink
                          href="/account/wishlist"
                          icon={<Heart className="size-4" />}
                        >
                          قائمة الأمنيات
                        </MenuLink>
                        {viewer.isAdmin ? (
                          <MenuLink
                            href="/admin"
                            icon={<LayoutDashboard className="size-4" />}
                          >
                            لوحة التحكم
                          </MenuLink>
                        ) : null}
                        <div className="hairline my-1" />
                        <form action="/auth/signout" method="post">
                          <button
                            type="submit"
                            role="menuitem"
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start text-[0.82rem] text-plum-700 transition-colors hover:bg-blush-100/80"
                          >
                            <LogOut className="size-4 text-rose-600" aria-hidden />
                            تسجيل الخروج
                          </button>
                        </form>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden rounded-full px-3.5 py-2 text-[0.8rem] text-plum-700 transition-colors hover:bg-blush-100 hover:text-plum-900 sm:inline-block"
                >
                  تسجيل الدخول
                </Link>
              )}

              <button
                type="button"
                onClick={openCart}
                aria-label={
                  hydrated && itemCount > 0
                    ? `فتح سلة التسوق، ${itemCount} قطعة`
                    : "فتح سلة التسوق"
                }
                className="relative rounded-full p-2.5 text-plum-700 transition-colors hover:bg-blush-100 hover:text-plum-900"
              >
                <ShoppingBag className="size-[1.15rem]" aria-hidden />
                {hydrated && itemCount > 0 ? (
                  <span className="num absolute top-1 end-1 flex min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[0.6rem] leading-4 font-medium text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        {demo ? (
          <div className="border-t border-gold-300/40 bg-gold-200/50">
            <div className="container-x flex flex-wrap items-center justify-center gap-2 py-1.5 text-center">
              <Badge tone="gold" className="scale-90">
                تجريبي
              </Badge>
              <p className="text-[0.68rem] text-plum-600">
                الكتالوج يعمل محلياً — اربطي Supabase لتفعيل الحسابات والطلبات ولوحة
                التحكم.
              </p>
            </div>
          </div>
        ) : null}
      </header>

      {/* Mobile panel */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileOpen(false)}
            className="animate-fade-in absolute inset-0 cursor-default bg-plum-900/40 backdrop-blur-sm"
          />
          <div className="animate-slide-in-right absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-cream-100 shadow-lift">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-blush-200 px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="إغلاق القائمة"
                className="rounded-full p-2 text-plum-600 transition-colors hover:bg-blush-100"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav aria-label="قائمة الجوال" className="flex-1 overflow-y-auto p-5">
              <p className="eyebrow mb-3 text-plum-400">تسوّقي</p>
              <ul className="space-y-1">
                {CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={category.href}
                      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[0.95rem] text-plum-700 transition-colors hover:bg-white/80"
                    >
                      {category.label}
                      <span className="text-[0.7rem] text-plum-400">
                        {category.blurb}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="eyebrow mt-7 mb-3 text-plum-400">اكتشفي</p>
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-2xl px-4 py-3 text-[0.95rem] text-plum-700 transition-colors hover:bg-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="shrink-0 space-y-2 border-t border-blush-200 p-5">
              {viewer ? (
                <>
                  <p className="latin px-1 pb-1 text-[0.7rem] text-plum-400">
                    {viewer.email}
                  </p>
                  <Link
                    href="/account"
                    className="block rounded-2xl bg-white/80 px-4 py-3 text-center text-[0.85rem] text-plum-700 ring-1 ring-blush-200"
                  >
                    حسابي
                  </Link>
                  {viewer.isAdmin ? (
                    <Link
                      href="/admin"
                      className="block rounded-2xl bg-white/80 px-4 py-3 text-center text-[0.85rem] text-plum-700 ring-1 ring-blush-200"
                    >
                      لوحة التحكم
                    </Link>
                  ) : null}
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full rounded-2xl px-4 py-3 text-center text-[0.85rem] text-rose-700 ring-1 ring-blush-200"
                    >
                      تسجيل الخروج
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-full bg-plum-800 px-4 py-3.5 text-center text-[0.85rem] text-cream-100"
                >
                  سجّلي الدخول أو أنشئي حساباً
                </Link>
              )}
              <a
                href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}
                className="latin block pt-1 text-center text-[0.75rem] text-plum-400"
              >
                {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NavItem({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = pathname === href.split("?")[0] && href !== "/shop?sort=newest";
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-full px-3.5 py-2 text-[0.82rem] transition-colors",
        active ? "text-plum-900" : "text-plum-600 hover:text-plum-900",
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-3.5 -bottom-0.5 h-px origin-right bg-rose-500 transition-transform duration-400 ease-[var(--ease-silk)]",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[0.82rem] text-plum-700 transition-colors hover:bg-blush-100/80"
    >
      <span className="text-rose-600">{icon}</span>
      {children}
    </Link>
  );
}
