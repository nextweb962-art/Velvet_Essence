import Link from "next/link";
import { Compass } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { CATEGORIES } from "@/types";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-blush-100 text-rose-600">
        <Compass className="size-7" aria-hidden />
      </span>

      <p className="eyebrow num mt-7 text-rose-600">خطأ 404</p>
      <h1 className="mt-4 text-[clamp(1.8rem,4.4vw,2.9rem)] leading-[1.15]">
        هذا الكاونتر <span className="text-rose-700">مغلق</span>
      </h1>
      <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed text-plum-500">
        الصفحة التي تبحثين عنها نُقلت أو تغيّر اسمها أو لم توجد أصلاً. أما المتجر فمفتوح
        تماماً.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className={buttonClasses("gold", "lg")}>
          تصفّحي كل شيء
        </Link>
        <Link href="/" className={buttonClasses("outline", "lg")}>
          العودة للرئيسية
        </Link>
      </div>

      <ul className="mt-12 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <Link
              href={category.href}
              className="rounded-full bg-white/70 px-4 py-2.5 text-[0.8rem] text-plum-600 ring-1 ring-blush-200 transition-all hover:bg-white hover:text-plum-900 hover:ring-rose-300"
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
