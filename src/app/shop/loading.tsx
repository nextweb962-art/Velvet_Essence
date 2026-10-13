import { Skeleton } from "@/components/ui/primitives";

/**
 * Streamed while the catalogue query runs, so filtering feels instant and the
 * layout never jumps.
 */
export default function ShopLoading() {
  return (
    <div className="container-x pt-10 pb-20 sm:pt-14">
      <div className="h-[16rem] animate-shimmer rounded-[2.25rem] bg-[linear-gradient(90deg,var(--color-cream-200)_25%,var(--color-blush-100)_37%,var(--color-cream-200)_63%)] bg-[length:200%_100%] sm:h-[19rem]" />

      <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-11 w-full lg:max-w-md" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>

      <div className="my-8 h-px bg-blush-200" />

      <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <div className="hidden lg:block">
          <Skeleton className="h-[26rem] rounded-4xl" />
        </div>

        <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="space-y-4">
              <Skeleton className="aspect-4/5 rounded-4xl" />
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-1/3 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
