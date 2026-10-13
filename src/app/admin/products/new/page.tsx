import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";

export const metadata = {
  title: "إضافة منتج",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[0.8rem] text-plum-500 transition-colors hover:text-plum-800"
        >
          <ChevronRight className="size-3.5" aria-hidden />
          كل المنتجات
        </Link>
        <h2 className="mt-3 text-xl">إضافة منتج</h2>
        <p className="mt-1.5 text-[0.85rem] text-plum-500">
          كل حقل يُتحقّق منه بـ Zod على الخادم قبل أن يصل إلى قاعدة البيانات، والكتابة
          محصورة بسياسة RLS للمشرفات فقط.
        </p>
      </header>

      <ProductForm
        submitLabel="إنشاء المنتج"
        values={{
          slug: "",
          name: "",
          tagline: "",
          description: "",
          category: "lipstick",
          collection: "",
          price: "",
          compare_at_price: "",
          images: [],
          variant_groups: [],
          badge: "",
          rating: "0",
          review_count: "0",
          stock: "0",
          is_active: true,
          is_featured: false,
          tags: [],
        }}
      />
    </div>
  );
}
