import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Star } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";

const HIGHLIGHTS = ["تركيبات نظيفة", "خالية من القسوة", "تغليف قابل لإعادة التعبئة"];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 lg:pt-20 lg:pb-24">
      {/* Ambient light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -start-24 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-blush-200),transparent_65%)] blur-2xl" />
        <div className="absolute top-16 -end-32 size-[40rem] rounded-full bg-[radial-gradient(circle,var(--color-rose-200),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-0 start-1/3 size-[26rem] rounded-full bg-[radial-gradient(circle,var(--color-gold-200),transparent_68%)] blur-3xl opacity-70" />
      </div>

      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        {/* Copy */}
        <div className="lg:col-span-6 xl:col-span-5">
          <p
            className="animate-fade-up eyebrow flex items-center gap-2.5 text-rose-600"
            style={{ animationDelay: "60ms" }}
          >
            <Sparkles className="size-3.5" aria-hidden />
            مجموعة الخريف
          </p>

          <h1
            className="animate-fade-up mt-5 text-[clamp(2.5rem,6.5vw,4.6rem)] leading-[1.15]"
            style={{ animationDelay: "140ms" }}
          >
            جمالٌ
            <br />
            <span className="text-foil">يشبهكِ وحدك</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-md text-[0.98rem] leading-relaxed text-plum-500"
            style={{ animationDelay: "220ms" }}
          >
            أحمر شفاه مخملي، وباليتات بدرجات البتلات، وعطور مركّبة في غراس — تُصنع في
            دفعات صغيرة لمن تكون ملهمة نفسها.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <Link href="/shop" className={buttonClasses("gold", "lg")}>
              تسوّقي المجموعة
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
            <Link
              href="/shop?category=fragrance"
              className={buttonClasses("outline", "lg")}
            >
              اكتشفي العطور
            </Link>
          </div>

          <ul
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-7 gap-y-3"
            style={{ animationDelay: "380ms" }}
          >
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[0.78rem] text-plum-500"
              >
                <span aria-hidden className="size-1.5 rotate-45 bg-gold-500" />
                {item}
              </li>
            ))}
          </ul>

          <div
            className="animate-fade-up mt-9 flex items-center gap-4 border-t border-blush-200 pt-6"
            style={{ animationDelay: "460ms" }}
          >
            <div className="flex -space-x-2.5" aria-hidden>
              {["#E5A3A8", "#C67A6D", "#B76E79", "#D9B173"].map((tone) => (
                <span
                  key={tone}
                  className="size-9 rounded-full ring-2 ring-cream-100"
                  style={{
                    background: `linear-gradient(135deg, ${tone}, #FFFFFF 140%)`,
                  }}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-gold-500 text-gold-500"
                    aria-hidden
                  />
                ))}
                <span className="num ms-1.5 text-[0.75rem] text-plum-600">4.9</span>
              </div>
              <p className="mt-0.5 text-[0.72rem] text-plum-400">
                من أكثر من 12,480 مراجعة موثّقة
              </p>
            </div>
          </div>
        </div>

        {/* Editorial image */}
        <div
          className="animate-fade-up lg:col-span-6 xl:col-span-7"
          style={{ animationDelay: "260ms" }}
        >
          <div className="relative mx-auto max-w-xl lg:me-0 lg:ms-auto lg:max-w-none">
            <div className="relative aspect-4/5 overflow-hidden rounded-[2.5rem] bg-blush-100 shadow-glow sm:aspect-3/4 lg:aspect-4/5">
              <Image
                src="/hero.svg"
                alt="طبيعة صامتة من فيلفت إسنس: قارورة ذهبية وردية، وأحمر شفاه مخملي، وعلبة بودرة، وباليت ظلال"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 55vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-plum-900/12 via-transparent to-white/10"
              />
            </div>

            {/* Floating glass cards */}
            <div className="glass-strong animate-float absolute -bottom-4 -start-3 w-52 rounded-3xl p-4 sm:-start-6 sm:w-60">
              <p className="eyebrow text-[0.6rem] text-rose-600">عطر التوقيع</p>
              <p className="mt-1.5 font-display text-lg leading-tight text-plum-800">
                نوي بلوميه
              </p>
              <p className="mt-1 text-[0.7rem] text-plum-500">ياسمين · ورد · عنبر</p>
            </div>

            <div
              className="glass-strong animate-float absolute -top-3 -end-2 rounded-2xl px-4 py-3 sm:-end-5"
              style={{ animationDelay: "1.4s" }}
            >
              <p className="text-[0.62rem] text-plum-400">الأكثر مبيعاً</p>
              <p className="mt-0.5 font-display text-base text-plum-800">فيلفت نوار</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
