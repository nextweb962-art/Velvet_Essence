import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { CategoryShowcase } from "@/components/home/category-showcase";
import { Editorial, Testimonials } from "@/components/home/editorial";
import { Hero } from "@/components/home/hero";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { PromoCarousel } from "@/components/home/promo-carousel";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/primitives";
import { fetchWishlistIds } from "@/lib/account";
import { SITE } from "@/lib/constants";
import { fetchNewArrivals, fetchTrendingProducts } from "@/lib/products";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata = {
  title: "مكياج فاخر وعطور راقية",
  description:
    "أحمر شفاه مخملي، وباليتات بدرجات البتلات، وعطور مركّبة في غراس. تركيبات نظيفة وخالية من القسوة، تُصنع في دفعات صغيرة في عمّان.",
};

export default async function HomePage() {
  const [trending, arrivals, wishlist, user] = await Promise.all([
    fetchTrendingProducts(4),
    fetchNewArrivals(4),
    fetchWishlistIds(),
    getSessionUser(),
  ]);

  const signedIn = Boolean(user);
  const wishlistArray = Array.from(wishlist);

  return (
    <>
      <Hero />
      <CategoryShowcase />
      <PromoCarousel />

      {/* Trending */}
      <section className="container-x py-16 sm:py-20">
        <SectionHeading
          align="left"
          eyebrow="الأكثر طلباً"
          title={
            <>
              رائجة في <span className="text-rose-700">الأتيليه</span>
            </>
          }
          copy="القطع التي تعود إليها عميلاتنا مرّة بعد مرّة."
          action={
            <Link
              href="/shop?sort=rating"
              className={buttonClasses("outline", "md", "group")}
            >
              كل الأكثر مبيعاً
              <ArrowLeft
                className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                aria-hidden
              />
            </Link>
          }
        />

        <ProductGrid
          className="mt-12"
          products={trending}
          wishlist={wishlistArray}
          signedIn={signedIn}
          priorityCount={2}
        />
      </section>

      <Editorial />

      {/* New arrivals */}
      <section className="relative py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent,var(--color-cream-200)_30%,var(--color-cream-200)_70%,transparent)]"
        />
        <div className="container-x">
          <SectionHeading
            align="left"
            eyebrow="وصل للتو"
            title={
              <>
                جديد <span className="text-rose-700">الأتيليه</span>
              </>
            }
            copy="طازج من المختبر، في دفعاته الأولى المحدودة."
            action={
              <Link
                href="/shop?sort=newest"
                className={buttonClasses("outline", "md", "group")}
              >
                تسوّقي الجديد
                <ArrowLeft
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                  aria-hidden
                />
              </Link>
            }
          />

          <ProductGrid
            className="mt-12"
            products={arrivals}
            wishlist={wishlistArray}
            signedIn={signedIn}
          />
        </div>
      </section>

      <Testimonials />

      {/* Boutique note */}
      <section className="container-x pb-8">
        <div className="glass flex flex-col items-start gap-6 rounded-[2.25rem] px-8 py-10 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow flex items-center gap-2.5 text-rose-600">
              <Sparkles className="size-3.5" aria-hidden />
              {SITE.addressLine}، عمّان
            </p>
            <h2 className="mt-3 text-[clamp(1.35rem,2.8vw,1.95rem)] leading-tight">
              احجزي جلسة خاصة لمطابقة الدرجات أو لبناء خزانة عطورك.
            </h2>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-plum-500">
              خمس وأربعون دقيقة مع إحدى خبيرات المكياج، مجاناً مع أي شراء. في الأتيليه أو
              عبر مكالمة فيديو.
            </p>
          </div>
          <Link
            href="/about#contact"
            className={buttonClasses("primary", "lg", "shrink-0")}
          >
            احجزي موعدك
          </Link>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
