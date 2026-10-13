import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";
import { Divider } from "@/components/ui/primitives";

const PROMISES = [
  "تتبّعي كل طلب وأعيدي الطلب بضغطة واحدة",
  "قائمة أمنيات تتبعك على كل أجهزتك",
  "وصول مبكر للإصدارات المحدودة ودفعات الدرجات",
  "عينتان مجانيتان مع كل طلب",
];

export function AuthShell({
  mode,
  title,
  copy,
  redirectTo = "/account",
  reason,
  urlError,
}: {
  mode: "login" | "signup";
  title: React.ReactNode;
  copy: string;
  redirectTo?: string;
  reason?: string;
  urlError?: string;
}) {
  return (
    <div className="container-x pt-10 pb-20 sm:pt-14">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Editorial side */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow flex items-center gap-2.5 text-rose-600">
              <Sparkles className="size-3.5" aria-hidden />
              قائمة العميلات
            </p>
            <h2 className="mt-5 text-[clamp(1.8rem,3.6vw,2.7rem)] leading-[1.2]">
              جمالك، محفوظاً
              <br />
              <span className="text-foil">بكل أناقة</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-plum-500">
              الحساب يفتح لك الجانب الهادئ من الدار: تاريخ طلباتك، ودرجاتك المحفوظة،
              وحق الأولوية في كل ما هو محدود.
            </p>

            <Divider className="my-8" />

            <ul className="space-y-3.5">
              {PROMISES.map((promise) => (
                <li
                  key={promise}
                  className="flex items-start gap-3 text-[0.88rem] text-plum-600"
                >
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold-500"
                  />
                  {promise}
                </li>
              ))}
            </ul>

            <div className="glass mt-10 max-w-md rounded-3xl p-6">
              <p className="font-display text-lg leading-snug text-plum-800">
                «لم أُكمل أحمر شفاه في حياتي قبل فيلفت نوار. اشتريته أربع مرات.»
              </p>
              <p className="mt-3 text-[0.74rem] text-plum-400">أمل الزعبي · عمّان</p>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="mx-auto w-full max-w-md">
          <nav aria-label="مسار التنقل" className="mb-6">
            <ol className="flex items-center gap-2 text-[0.74rem] text-plum-500">
              <li>
                <Link href="/" className="transition-colors hover:text-plum-800">
                  الرئيسية
                </Link>
              </li>
              <li aria-hidden className="text-blush-400">
                /
              </li>
              <li className="text-plum-700" aria-current="page">
                {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
              </li>
            </ol>
          </nav>

          <h1 className="text-[clamp(1.7rem,3.6vw,2.4rem)] leading-[1.2]">{title}</h1>
          <p className="mt-3 mb-7 text-[0.9rem] leading-relaxed text-plum-500">{copy}</p>

          {/*
            Search params are resolved on the server and passed down as props, so
            the form server-renders in full — no Suspense boundary, no skeleton
            flash on the most-visited entry point of the account flow.
          */}
          <AuthForm
            mode={mode}
            redirectTo={redirectTo}
            reason={reason}
            urlError={urlError}
          />
        </div>
      </div>
    </div>
  );
}
