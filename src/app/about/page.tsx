import Image from "next/image";
import Link from "next/link";
import { Leaf, Mail, MapPin, Phone, Clock, Sparkles } from "lucide-react";

import { NewsletterBand } from "@/components/home/newsletter-band";
import { buttonClasses } from "@/components/ui/button";
import { Divider, SectionHeading } from "@/components/ui/primitives";
import { COMMERCE, SITE } from "@/lib/constants";

export const metadata = {
  title: "عن الدار",
  description:
    "كيف تُركّب فيلفت إسنس ألوانها وعطورها وتشحنها: تركيبات نظيفة وعطور راقية من أتيليه صغير في عمّان، مع الدفع عند الاستلام في كل المحافظات.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    title: "دفعات صغيرة",
    copy: "كل تركيبة تُضغط وتُسكب وتُعبّأ في دفعات من بضعة آلاف، ثم تُترك لترتاح قبل الشحن. لا شيء يبقى في المستودع سنة كاملة.",
  },
  {
    title: "قوائم مكوّنات منشورة",
    copy: "قائمة المكوّنات كاملة على العلبة وعلى صفحة المنتج. لا خلطات سرّية، ولا كلمة «عطر» تخفي خلفها كل شيء.",
  },
  {
    title: "قابل لإعادة التعبئة بالتصميم",
    copy: "الباليتات تُضغط في ألمنيوم، وقوارير العطر لها عبوة إعادة تعبئة. أعيدي العبوة الفارغة ونضيف رصيداً لطلبك القادم.",
  },
  {
    title: "لم تُختبر على الحيوانات أبداً",
    copy: "ندفع مقابل اختبارات بشرية وفي المختبر. خلوّ التركيبات من القسوة خط أساس، لا عبارة تسويقية.",
  },
];

const SECTIONS = [
  {
    id: "shipping",
    title: "الشحن والتوصيل",
    body: [
      `تُجهَّز الطلبات من الأتيليه خلال يوم عمل واحد، من الأحد إلى الخميس. التوصيل مجاني على الطلبات فوق ${COMMERCE.freeShippingThreshold} د.أ، وإلا ${COMMERCE.flatShippingRate} د.أ، ويصل خلال ٢–٤ أيام عمل إلى جميع محافظات المملكة.`,
      `التوصيل السريع ${COMMERCE.expressShippingRate} د.أ، ويصل خلال ٢٤ ساعة داخل عمّان للطلبات المؤكَّدة قبل الساعة ٢ ظهراً. يمكنك أيضاً اختيار استلام الطلب من الأتيليه في عبدون.`,
      "كل الطلبات تُدفع نقداً عند الاستلام. لا نطلب بيانات بطاقة، ولا يُخصم أي مبلغ قبل أن يكون الطلب بين يديك.",
    ],
  },
  {
    id: "returns",
    title: "الإرجاع والاستبدال",
    body: [
      "يمكنك إرجاع أي منتج غير مفتوح خلال ثلاثين يوماً لاسترداد المبلغ كاملاً، ونتحمّل نحن تكلفة الإرجاع. أما الألوان ومنتجات العناية المفتوحة فيمكن استبدالها بدرجة أو تركيبة أخرى خلال المدة نفسها إن لم تناسبك.",
      "العطور مكلفة في الشحن والإرجاع؛ إن لم يناسبك عطر، راسلي خدمة العملاء وسنرتّب لك رصيداً لشراء مجموعة اكتشاف بدلاً منه.",
    ],
  },
  {
    id: "ingredients",
    title: "المكوّنات ومصادرها",
    body: [
      "تُطحن ألواننا في نيوجيرسي، ويُركَّب عطرنا ويُنضج في غراس بفرنسا ثم يُعبَّأ في إيطاليا، وتُصنع منتجات العناية بالبشرة في عمّان بقائمة مكوّنات قصيرة وواضحة.",
      "نستبعد التلك والبارابين والزيوت المعدنية واللدائن الدقيقة، وكل المكوّنات ذات المصدر الحيواني ما عدا شمع العسل، ونعمل على استبداله.",
    ],
  },
  {
    id: "sustainability",
    title: "الاستدامة",
    body: [
      "التغليف من كرتون وألمنيوم معاد تدويرهما، ومطبوع بأحبار صويا. يُغلَّف طلبك بورق غير مبيَّض ويُقفل بشريط ورقي، دون أي بلاستيك.",
      "ننشر تقرير أثر سنوياً يغطّي التغليف المُستعاد، وعبوات إعادة التعبئة المُعادة إلينا، والكلفة الكربونية لشحننا — بما في ذلك السنوات التي أخفقنا فيها.",
    ],
  },
  {
    id: "careers",
    title: "الوظائف",
    body: [
      "نوظّف خبيرات ألوان، وكيميائيين، وعطّارين، وأشخاصاً يجيدون الردّ على الرسائل بدفء. تُنشر الوظائف هنا وعلى إنستغرام، ونقرأ كل طلب.",
    ],
  },
  {
    id: "contact",
    title: "تواصلي معنا",
    body: [
      "راسلينا وسيردّ عليك شخص حقيقي، عادة خلال ساعات قليلة في أوقات عمل الأتيليه. ولجلسات مطابقة الدرجات واستشارات العطور نحفظ ثلاثة مواعيد يومياً.",
    ],
  },
  {
    id: "terms",
    title: "شروط البيع",
    body: [
      "هذا المتجر نسخة عرض توضيحية. الأسعار والضرائب ورسوم التوصيل لأغراض العرض، والدفع يتم عند الاستلام، ولا تُعالج أي عملية دفع إلكترونية ولا تُخزَّن أي بيانات بطاقة.",
      "في نشر تجاري حقيقي، تغطّي هذه الشروط تكوّن العقد، وأخطاء التسعير، وحقوق الإلغاء، والجهة القضائية المختصة.",
    ],
  },
  {
    id: "privacy",
    title: "سياسة الخصوصية",
    body: [
      "نحفظ الحد الأدنى اللازم لتنفيذ الطلب: اسمك، وبريدك، ورقم جوالك، وعنوان التوصيل، والطلب نفسه. كلمات المرور تديرها Supabase Auth ولا تمر عبر هذا التطبيق.",
      "سياسات Row Level Security مفعّلة على كل الجداول، فلا تستطيع أي عميلة قراءة سوى سلّتها وطلباتها وملفها الشخصي. ويمكن للمشرفات قراءة الطلبات لأغراض الدعم فقط؛ ولا يمكن لأحد قراءة سلة شخص آخر.",
      "لا نبيع البيانات ولا نستخدم بكسلات إعلانية من أطراف ثالثة. الاشتراك في الرسائل البريدية اختياري، وإلغاؤه بضغطة واحدة.",
      "تُحفظ البيانات على خوادم Supabase، ويمكنك طلب تصدير بياناتك أو حذف حسابك بمراسلتنا في أي وقت.",
    ],
  },
  {
    id: "accessibility",
    title: "إمكانية الوصول",
    body: [
      "نستهدف معيار WCAG 2.2 AA: مؤشرات تركيز واضحة، وقوائم تعمل بالكيبورد، ومناطق حيّة تُعلن تحديثات السلة والفلاتر، ودعم تقليل الحركة الذي يحترم إعداد نظامك.",
      "إن وجدتِ شيئاً صعب الاستخدام، أخبري خدمة العملاء وسيدخل مباشرة في خطة العمل القادمة لا في قائمة انتظار.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 end-0 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-rose-200),transparent_65%)] blur-3xl" />
          <div className="absolute bottom-0 start-0 size-[28rem] rounded-full bg-[radial-gradient(circle,var(--color-gold-200),transparent_68%)] blur-3xl opacity-70" />
        </div>

        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-2.5 text-rose-600">
              <Sparkles className="size-3.5" aria-hidden />
              منذ 2019 · عمّان، الأردن
            </p>
            <h1 className="mt-5 text-[clamp(2.1rem,5.2vw,3.8rem)] leading-[1.15]">
              دار صغيرة
              <br />
              <span className="text-foil">بآراء قوية</span>
            </h1>
            <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-plum-500">
              بدأت فيلفت إسنس في غرفتين على شارع المدينة المنورة بأحمر شفاه واحد وبقناعة
              عنيدة: اللون يجب أن يُشعرك بالعناية، والعطر يستحق الانتظار. بعد ست سنوات
              صرنا واحداً وثلاثين شخصاً، وأربعاً وعشرين تركيبة، وما زلنا نضغط كل باليت
              بأيدينا.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className={buttonClasses("gold", "lg")}>
                تسوّقي المجموعة
              </Link>
              <Link
                href="/shop?category=fragrance"
                className={buttonClasses("outline", "lg")}
              >
                اكتشفي العطور
              </Link>
            </div>
          </div>

          <div className="relative aspect-4/5 overflow-hidden rounded-[2.5rem] bg-blush-100 shadow-soft">
            <Image
              src="/hero.svg"
              alt="تشكيلة من منتجات فيلفت إسنس بدرجات الذهب الوردي والوردي والكريمي"
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-x py-16 sm:py-20">
        <SectionHeading
          eyebrow="كيف نعمل"
          title={
            <>
              أربعة أشياء لا <span className="text-rose-700">نساوم</span> عليها
            </>
          }
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRINCIPLES.map((principle, index) => (
            <li
              key={principle.title}
              className="glass rounded-4xl p-6 transition-all duration-500 ease-[var(--ease-silk)] hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <Leaf className="size-5 text-sage-600" aria-hidden />
              <h3 className="mt-4 text-[1.05rem] leading-snug">{principle.title}</h3>
              <p className="mt-2.5 text-[0.85rem] leading-relaxed text-plum-500">
                {principle.copy}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x pb-16 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <nav aria-label="في هذه الصفحة" className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow mb-4 text-plum-400">خدمة العملاء</p>
            <ul className="space-y-1">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-xl px-3 py-2 text-[0.85rem] text-plum-600 transition-colors hover:bg-white/80 hover:text-plum-900"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>

            <Divider className="my-6" />

            <ul className="space-y-3 text-[0.8rem] text-plum-500">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-rose-500" aria-hidden />
                {SITE.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-3.5 shrink-0 text-rose-500" aria-hidden />
                <a
                  href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}
                  className="latin transition-colors hover:text-plum-800"
                >
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-3.5 shrink-0 text-rose-500" aria-hidden />
                <a
                  href={`mailto:${SITE.email}`}
                  className="latin transition-colors hover:text-plum-800"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-rose-500" aria-hidden />
                {SITE.hours}
              </li>
            </ul>
          </nav>

          <div className="space-y-14">
            {SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-[clamp(1.3rem,2.8vw,1.8rem)]">{section.title}</h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 24)}
                      className="max-w-2xl text-[0.9rem] leading-relaxed text-plum-500"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
