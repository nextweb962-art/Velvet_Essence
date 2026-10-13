import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";

import { SectionHeading } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const FEATURE_CARDS = [
  {
    href: "/shop?category=lipstick",
    label: "المكياج",
    copy: "شفاه مخملية، وباليتات بدرجات البتلات، وبلاشر حريري.",
    image: "/collections/makeup.svg",
    tone: "from-blush-200/80 via-cream-100 to-white",
  },
  {
    href: "/shop?category=fragrance",
    label: "العطور",
    copy: "أو دو بارفان مركّبة في غراس وتُنضج ستة أسابيع.",
    image: "/collections/perfume.svg",
    tone: "from-plum-400/35 via-rose-200 to-cream-100",
  },
] as const;

const MINOR_CARDS = [
  {
    href: "/shop?category=lipstick",
    label: "أحمر الشفاه",
    copy: "ستان ومطفي",
    image: "/collections/lipstick.svg",
    tone: "from-rose-200/70 to-cream-100",
  },
  {
    href: "/shop?category=blush",
    label: "البلاشر",
    copy: "كريمي وبودرة",
    image: "/products/blush-powder-flush.svg",
    tone: "from-blush-200/70 to-cream-100",
  },
  {
    href: "/shop?category=skincare",
    label: "العناية بالبشرة",
    copy: "سيرومات وبلاسم",
    image: "/collections/skincare.svg",
    tone: "from-gold-200/70 to-cream-100",
  },
] as const;

export function CategoryShowcase() {
  return (
    <section className="container-x py-16 sm:py-20">
      <SectionHeading
        eyebrow="داران وطقس واحد"
        title={
          <>
            اختاري <span className="text-rose-700">وسيلتك</span>
          </>
        }
        copy="لون لوجهك، وعطر للمكان الذي تدخلينه. ابدئي بالعائلة التي تتحدث إليك."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {FEATURE_CARDS.map((card, index) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              "group relative flex min-h-[22rem] overflow-hidden rounded-[2rem] sm:min-h-[26rem]",
              "ring-1 ring-blush-200/80 transition-all duration-500 ease-[var(--ease-silk)]",
              "hover:-translate-y-1 hover:shadow-lift hover:ring-blush-300",
            )}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br", card.tone)} />
            <Image
              src={card.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="object-cover object-center transition-transform duration-[1.2s] ease-[var(--ease-silk)] group-hover:scale-[1.05]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-plum-900/55 via-plum-900/10 to-transparent"
            />

            <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-7 sm:p-8">
              <div>
                <h3 className="font-display text-[2.1rem] leading-none text-white sm:text-[2.6rem]">
                  {card.label}
                </h3>
                <p className="mt-2.5 max-w-xs text-[0.85rem] leading-relaxed text-white/80">
                  {card.copy}
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-plum-800 backdrop-blur transition-all duration-500 group-hover:bg-white group-hover:shadow-glow">
                <ArrowUpLeft className="size-4" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {MINOR_CARDS.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              "group relative flex min-h-[15rem] overflow-hidden rounded-3xl",
              "ring-1 ring-blush-200/80 transition-all duration-500 ease-[var(--ease-silk)]",
              "hover:-translate-y-1 hover:shadow-lift hover:ring-blush-300",
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br", card.tone)} />
            <Image
              src={card.image}
              alt=""
              fill
              sizes="(max-width: 640px) 92vw, 30vw"
              className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-silk)] group-hover:scale-[1.06]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-plum-900/45 to-transparent"
            />
            <div className="relative mt-auto p-6">
              <h3 className="font-display text-2xl leading-none text-white">
                {card.label}
              </h3>
              <p className="mt-1.5 text-[0.75rem] text-white/75">{card.copy}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
