import Link from "next/link";
import { Wallet } from "lucide-react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { COMMERCE } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/supabase/server";

export const metadata = {
  title: "إتمام الطلب",
  description: "أكملي طلبك من فيلفت إسنس — الدفع عند الاستلام.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="container-x pt-10 pb-20 sm:pt-14">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow flex items-center justify-center gap-2.5 text-rose-600">
          <Wallet className="size-3.5" aria-hidden />
          {COMMERCE.paymentLabel} · بدون بطاقة
        </p>
        <h1 className="mt-4 text-[clamp(1.8rem,4.4vw,2.8rem)] leading-[1.2]">
          أوشكتِ على <span className="text-rose-700">امتلاكها</span>
        </h1>
        <p className="mt-4 text-[0.92rem] text-plum-500">
          مسجّلة الدخول باسم{" "}
          <span className="latin text-plum-700">{profile?.email ?? "زائرة"}</span>. سلّتك
          محفوظة في حسابك بمجرّد تأكيد الطلب.
        </p>
      </header>

      <div className="mt-12">
        <CheckoutForm
          defaults={{
            fullName: profile?.full_name ?? "",
            email: profile?.email ?? "",
            phone: profile?.phone ?? "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
          }}
        />
      </div>

      <p className="mt-12 text-center text-[0.78rem] text-plum-400">
        غيّرتِ رأيك؟{" "}
        <Link
          href="/shop"
          className="text-rose-700 underline decoration-rose-300 underline-offset-4"
        >
          متابعة التسوّق
        </Link>
      </p>
    </div>
  );
}
