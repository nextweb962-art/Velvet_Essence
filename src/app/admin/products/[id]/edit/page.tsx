import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";

import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { fetchAdminProducts } from "@/lib/admin";

export const metadata = {
  title: "تعديل منتج",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await fetchAdminProducts();
  const product = products.find((candidate) => candidate.id === id);

  if (!product) notFound();

  const values: ProductFormValues = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline ?? "",
    description: product.description,
    category: product.category,
    collection: product.collection ?? "",
    price: String(product.price),
    compare_at_price:
      product.compare_at_price === null ? "" : String(product.compare_at_price),
    images: product.images,
    variant_groups: product.variant_groups.map((group) => ({
      id: group.id,
      label: group.label,
      display: group.display,
      options: group.options.map((option) => ({
        id: option.id,
        name: option.name,
        hex: option.hex ?? "",
        priceDelta:
          option.priceDelta === undefined ? "" : String(option.priceDelta),
        stock: option.stock === undefined ? "" : String(option.stock),
        image: option.image ?? "",
        caption: option.caption ?? "",
      })),
    })),
    badge: product.badge ?? "",
    rating: String(product.rating),
    review_count: String(product.review_count),
    stock: String(product.stock),
    is_active: product.is_active,
    is_featured: product.is_featured,
    tags: product.tags,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-[0.8rem] text-plum-500 transition-colors hover:text-plum-800"
          >
            <ChevronRight className="size-3.5" aria-hidden />
            كل المنتجات
          </Link>
          <h2 className="mt-3 text-xl">تعديل · {product.name}</h2>
          <p className="mt-1.5 text-[0.85rem] text-plum-500">
            التغييرات تظهر في المتجر فوراً بعد الحفظ.
          </p>
        </div>

        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2.5 text-[0.8rem] text-plum-600 ring-1 ring-blush-200 transition-colors hover:text-plum-900"
        >
          عرض في المتجر
          <ExternalLink className="size-3.5" aria-hidden />
        </Link>
      </header>

      <ProductForm values={values} submitLabel="حفظ التغييرات" />
    </div>
  );
}
