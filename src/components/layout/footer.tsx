import Link from "next/link";
import {
  Clock,
  Instagram,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Divider } from "@/components/ui/primitives";
import { COMMERCE, SITE } from "@/lib/constants";
import { CATEGORIES } from "@/types";

const HELP_LINKS = [
  { href: "/about#shipping", label: "الشحن والتوصيل" },
  { href: "/about#returns", label: "الإرجاع والاستبدال" },
  { href: "/about#contact", label: "تواصلي معنا" },
  { href: "/about#ingredients", label: "المكوّنات ومصادرها" },
  { href: "/account/orders", label: "تتبّع طلبك" },
];

const HOUSE_LINKS = [
  { href: "/about", label: "عن الدار" },
  { href: "/shop?sort=newest", label: "وصل حديثاً" },
  { href: "/shop?sort=rating", label: "الأكثر محبّة" },
  { href: "/about#sustainability", label: "الاستدامة" },
  { href: "/about#careers", label: "الوظائف" },
];

const PROMISES = [
  { icon: Truck, label: `توصيل مجاني فوق ${COMMERCE.freeShippingThreshold} د.أ` },
  { icon: Wallet, label: COMMERCE.paymentLabel },
  { icon: RefreshCcw, label: "إرجاع خلال ٣٠ يوماً" },
  { icon: ShieldCheck, label: "خالٍ من القسوة دائماً" },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-plum-900 text-cream-100">
      {/* Promises strip */}
      <div className="border-b border-white/8">
        <div className="container-x grid grid-cols-2 gap-x-6 gap-y-5 py-8 md:grid-cols-4">
          {PROMISES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="size-4 shrink-0 text-gold-400" aria-hidden />
              <span className="text-[0.75rem] text-cream-100/70">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x grid gap-12 py-14 lg:grid-cols-12 lg:gap-10">
        {/* Brand + newsletter */}
        <div className="lg:col-span-5">
          <div className="[&_.latin]:text-cream-100 [&_span.text-rose-600]:text-gold-400">
            <Logo />
          </div>
          <p className="mt-5 max-w-sm text-[0.85rem] leading-relaxed text-cream-100/55">
            {SITE.description}
          </p>

          <div className="mt-7 max-w-sm">
            <p className="eyebrow mb-3 text-gold-400">رسائلنا</p>
            <NewsletterForm source="footer" />
          </div>

          <div className="mt-7 space-y-2.5 text-[0.78rem] text-cream-100/55">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-400" aria-hidden />
              {SITE.address}
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="size-3.5 shrink-0 text-gold-400" aria-hidden />
              <a
                href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}
                className="latin transition-colors hover:text-cream-100"
              >
                {SITE.phone}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Clock className="size-3.5 shrink-0 text-gold-400" aria-hidden />
              {SITE.hours}
            </p>
          </div>
        </div>

        {/* Link columns */}
        <nav aria-label="تسوّقي" className="lg:col-span-2">
          <h2 className="eyebrow mb-4 text-cream-100/40">تسوّقي</h2>
          <ul className="space-y-2.5">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  href={category.href}
                  className="text-[0.82rem] text-cream-100/65 transition-colors hover:text-cream-100"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="الدار" className="lg:col-span-2">
          <h2 className="eyebrow mb-4 text-cream-100/40">الدار</h2>
          <ul className="space-y-2.5">
            {HOUSE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.82rem] text-cream-100/65 transition-colors hover:text-cream-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="خدمة العملاء" className="lg:col-span-3">
          <h2 className="eyebrow mb-4 text-cream-100/40">خدمة العملاء</h2>
          <ul className="space-y-2.5">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.82rem] text-cream-100/65 transition-colors hover:text-cream-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <p className="eyebrow mb-3 text-cream-100/40">تابعينا</p>
            <a
              href={SITE.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-[0.82rem] text-cream-100/65 transition-colors hover:text-cream-100"
            >
              <Instagram className="size-4 text-gold-400" aria-hidden />
              <span className="latin">@velvetessence.jo</span>
            </a>
          </div>
        </nav>
      </div>

      <div className="container-x">
        <Divider className="[&>span]:bg-gold-400/40" />
        <div className="flex flex-col items-center justify-between gap-4 py-7 text-center sm:flex-row sm:text-start">
          <p className="text-[0.7rem] text-cream-100/40">
            © {new Date().getFullYear()} {SITE.name} — جميع الحقوق محفوظة. صُنع في عمّان.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { href: "/about#terms", label: "شروط البيع" },
              { href: "/about#privacy", label: "سياسة الخصوصية" },
              { href: "/about#accessibility", label: "إمكانية الوصول" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.7rem] text-cream-100/40 transition-colors hover:text-cream-100/80"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
