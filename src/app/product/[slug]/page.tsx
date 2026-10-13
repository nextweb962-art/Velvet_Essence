import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductDetail } from "@/components/product/product-detail";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/primitives";
import { fetchWishlistIds } from "@/lib/account";
import { SITE } from "@/lib/constants";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/products";
import { getSessionUser } from "@/lib/supabase/server";
import { CATEGORY_LABELS } from "@/types";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return { title: "Piece not found" };
  }

  const description =
    product.tagline ??
    product.description.slice(0, 155).trimEnd().concat("…");

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · ${SITE.name}`,
      description,
      url: `${SITE.url}/product/${product.slug}`,
      images: [{ url: product.images[0] ?? "/hero.svg", alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  const [related, wishlist, user] = await Promise.all([
    fetchRelatedProducts(product, 4),
    fetchWishlistIds(),
    getSessionUser(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) =>
      image.startsWith("http") ? image : `${SITE.url}${image}`,
    ),
    brand: { "@type": "Brand", name: SITE.name },
    category: CATEGORY_LABELS[product.category],
    sku: product.slug.toUpperCase(),
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/product/${product.slug}`,
      priceCurrency: SITE.currency,
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.review_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.review_count,
          },
        }
      : {}),
  };

  return (
    <div className="container-x pt-8 pb-20 sm:pt-10">
      <script
        type="application/ld+json"
        // Serialising a plain object of our own data — no user input involved.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="مسار التنقل" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-[0.72rem] text-plum-500">
          <li>
            <Link href="/" className="transition-colors hover:text-plum-800">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3 text-blush-400" aria-hidden />
          <li>
            <Link href="/shop" className="transition-colors hover:text-plum-800">
              Boutique
            </Link>
          </li>
          <ChevronRight className="size-3 text-blush-400" aria-hidden />
          <li>
            <Link
              href={`/shop?category=${product.category}`}
              className="transition-colors hover:text-plum-800"
            >
              {CATEGORY_LABELS[product.category]}
            </Link>
          </li>
          <ChevronRight className="size-3 text-blush-400" aria-hidden />
          <li className="text-plum-700" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail
        product={product}
        wishlisted={wishlist.has(product.id)}
        signedIn={Boolean(user)}
      />

      {related.length > 0 ? (
        <section className="mt-24">
          <SectionHeading
            align="left"
            eyebrow="Pairs beautifully with"
            title={
              <>
                Complete the <span className="italic">ritual</span>
              </>
            }
          />
          <ProductGrid
            className="mt-10"
            products={related}
            wishlist={Array.from(wishlist)}
            signedIn={Boolean(user)}
          />
        </section>
      ) : null}
    </div>
  );
}
