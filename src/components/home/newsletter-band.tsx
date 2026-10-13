import { Gift, Sparkles } from "lucide-react";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { FEATURED_DISCOUNT_CODE } from "@/lib/discounts";
import { COMMERCE } from "@/lib/constants";

export function NewsletterBand() {
  return (
    <section className="container-x py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-plum-800 via-rose-800 to-rose-600 px-8 py-14 sm:px-14 lg:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -end-24 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(233,205,156,0.42),transparent_65%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -start-20 size-[22rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_65%)] blur-2xl"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-2.5 text-gold-300">
              <Sparkles className="size-3.5" aria-hidden />
              رسائلنا
            </p>
            <h2 className="mt-4 text-[clamp(1.7rem,3.6vw,2.6rem)] leading-[1.25] text-cream-100">
              خصم ١٠٪ على
              <br />
              <span className="text-foil">طقسك الأول</span>
            </h2>
            <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-cream-100/70">
              انضمي إلى القائمة للوصول المبكر إلى الإصدارات المحدودة ودفعات الدرجات
              الجديدة، ورسالة من عطّارنا بين الحين والآخر. استخدمي الرمز{" "}
              <span className="latin rounded-md bg-white/12 px-2 py-0.5 font-medium text-gold-200">
                {FEATURED_DISCOUNT_CODE}
              </span>{" "}
              عند إتمام الطلب.
            </p>
          </div>

          <div className="lg:ps-8">
            <div className="max-w-md">
              <NewsletterForm source="landing" />
            </div>
            <p className="mt-5 flex items-center gap-2.5 text-[0.75rem] text-cream-100/50">
              <Gift className="size-3.5 shrink-0 text-gold-400" aria-hidden />
              عينتان مجانيتان تُضافان إلى كل طلب، و
              {COMMERCE.paymentLabel} في كل المحافظات.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
