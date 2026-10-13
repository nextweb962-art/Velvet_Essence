import Link from "next/link";

import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-rose-500 via-rose-600 to-gold-500",
        "latin text-[0.7rem] font-medium text-white",
        "ring-1 ring-white/50 ring-offset-1 ring-offset-cream-100",
        className,
      )}
      aria-hidden
    >
      VE
    </span>
  );
}

/**
 * The wordmark stays Latin — it is a logotype, and `.latin` keeps the tracking
 * that the RTL base layer strips from everything else.
 */
export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — الصفحة الرئيسية`}
      className={cn("group flex items-center gap-3", className)}
    >
      <Monogram className="transition-transform duration-500 ease-[var(--ease-silk)] group-hover:rotate-[14deg]" />
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="latin text-[1.22rem] leading-none text-plum-800">
            Velvet Essence
          </span>
          <span className="mt-1.5 text-[0.6rem] leading-none text-rose-600">
            {SITE.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
