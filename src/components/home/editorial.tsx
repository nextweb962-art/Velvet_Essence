import Image from "next/image";
import Link from "next/link";
import { Quote } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Divider, SectionHeading, StarRating } from "@/components/ui/primitives";
import { TESTIMONIALS } from "@/lib/constants";

export function Editorial() {
  return (
    <section className="container-x py-16 sm:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div className="relative aspect-5/6 overflow-hidden rounded-[2.5rem] bg-blush-100 shadow-soft">
            <Image
              src="/collections/skincare.svg"
              alt="سيروم غلاسهاوس غلو ونوي بالم مرتّبان على سطح كريمي"
              fill
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="object-cover"
            />
          </div>
          <div className="glass-strong animate-float absolute bottom-6 start-4 w-44 rounded-2xl p-4 sm:-start-5">
            <p className="num font-display text-3xl leading-none text-plum-900">94%</p>
            <p className="mt-1.5 text-[0.7rem] leading-snug text-plum-500">
              لاحظن لوناً أكثر توحّداً خلال أربعة أسابيع
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="طقس غلاسهاوس"
            title={
              <>
                تُركَّب كالعناية بالبشرة،
                <br />
                <span className="text-rose-700">وتُلبس كالأزياء الراقية</span>
              </>
            }
            copy="كل تركيبة تُطوَّر في مختبرنا بحضور أطباء الجلد والعطّارين في الغرفة نفسها. ننشر قوائم المكوّنات كاملة، ونرفض التلك واللدائن الدقيقة، ونضغط باليتاتنا في ألمنيوم قابل لإعادة التعبئة."
          />

          <dl className="mt-9 grid grid-cols-3 gap-6">
            {[
              { value: "38", label: "تركيبة في الدار" },
              { value: "6", label: "أسابيع لإنضاج العطر" },
              { value: "0", label: "تجارب على الحيوانات" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="num font-display text-[1.9rem] leading-none text-rose-700">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-[0.72rem] leading-snug text-plum-400">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <Divider className="my-8" />

          <div className="flex flex-wrap gap-3">
            <Link href="/about" className={buttonClasses("primary", "md")}>
              اقرئي قصتنا
            </Link>
            <Link
              href="/shop?category=skincare"
              className={buttonClasses("outline", "md")}
            >
              تسوّقي العناية بالبشرة
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent,var(--color-blush-50)_35%,var(--color-blush-50)_65%,transparent)]"
      />
      <div className="container-x">
        <SectionHeading
          eyebrow="كلام جميل"
          title={
            <>
              محبوبة في <span className="text-rose-700">اثنتي عشرة</span> دولة
            </>
          }
          copy="أكثر من اثني عشر ألف مراجعة، وثيمة واحدة تتكرّر: تبدو فاخرة، وتعمل فعلاً."
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {TESTIMONIALS.map((testimonial, index) => (
            <li
              key={testimonial.id}
              className="glass flex flex-col rounded-4xl p-6 transition-all duration-500 ease-[var(--ease-silk)] hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <Quote className="size-6 text-blush-300" aria-hidden />
              <blockquote className="mt-4 flex-1 text-[0.86rem] leading-relaxed text-plum-600">
                {testimonial.quote}
              </blockquote>
              <StarRating
                className="mt-5"
                rating={testimonial.rating}
                size={13}
                showValue={false}
              />
              <div className="mt-3 border-t border-white/70 pt-3">
                <p className="text-[0.82rem] font-medium text-plum-800">
                  {testimonial.author}
                </p>
                <p className="text-[0.7rem] text-plum-400">{testimonial.location}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
