import Link from "next/link";
import { Heart } from "lucide-react";

import { WishlistGrid } from "@/components/account/wishlist-grid";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { fetchWishlistProducts } from "@/lib/account";
import { countOf } from "@/lib/format";

export const metadata = {
  title: "قائمة الأمنيات",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const products = await fetchWishlistProducts();

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="size-6" aria-hidden />}
        title="قائمة أمنياتك فارغة"
        copy="اضغطي على القلب في أي قطعة تعجبك، وستنتظرك هنا على كل أجهزتك."
        action={
          <Link href="/shop" className={buttonClasses("gold", "md")}>
            اعثري على مفضّلاتك
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl">قائمة الأمنيات</h2>
          <p className="mt-1.5 text-[0.85rem] text-plum-500">
            {countOf(products.length, "piece")} محفوظة.
          </p>
        </div>
        <Link href="/shop" className={buttonClasses("outline", "sm")}>
          متابعة التصفّح
        </Link>
      </header>

      <WishlistGrid products={products} className="mt-8" />
    </div>
  );
}
