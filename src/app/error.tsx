"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";

/**
 * Route-level error boundary. In production Next.js strips the message from
 * server errors, so we never render `error.message` — only our own copy plus
 * the digest, which is useful when matching against server logs.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] render error", error);
  }, [error]);

  return (
    <div className="container-x flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
        <TriangleAlert className="size-7" aria-hidden />
      </span>

      <p className="eyebrow mt-7 text-rose-600">حدث خطأ غير متوقع</p>
      <h1 className="mt-4 text-[clamp(1.7rem,4vw,2.7rem)] leading-[1.15]">
        الأتيليه <span className="text-rose-700">مغلق مؤقتاً</span>
      </h1>
      <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-plum-500">
        قاطع خطأ غير متوقع عرض هذه الصفحة. لم يتأثّر شيء في سلّتك — جرّبي مرة أخرى، أو
        عودي إلى المتجر.
      </p>

      {error.digest ? (
        <p className="mt-3 text-[0.72rem] text-plum-400">
          رقم المرجع:{" "}
          <code className="latin rounded bg-white/70 px-1.5 py-0.5">{error.digest}</code>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={buttonClasses("gold", "lg")}>
          حاولي مرة أخرى
        </button>
        <Link href="/shop" className={buttonClasses("outline", "lg")}>
          العودة إلى المتجر
        </Link>
      </div>
    </div>
  );
}
