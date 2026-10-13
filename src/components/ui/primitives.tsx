import { Star } from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Badge                                                                      */
/* -------------------------------------------------------------------------- */

export type BadgeTone = "rose" | "gold" | "plum" | "sage" | "cream" | "outline";

const TONES: Record<BadgeTone, string> = {
  rose: "bg-rose-600 text-white",
  gold: "bg-gradient-to-r from-gold-300 to-gold-500 text-plum-800",
  plum: "bg-plum-800 text-cream-100",
  sage: "bg-sage-400/25 text-sage-600 ring-1 ring-sage-400/40",
  cream: "bg-cream-200 text-plum-600 ring-1 ring-blush-200",
  outline: "bg-white/70 text-plum-600 ring-1 ring-blush-300 backdrop-blur",
};

export function Badge({
  tone = "cream",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-medium",
        "tracking-[0.14em] uppercase",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Stars                                                                      */
/* -------------------------------------------------------------------------- */

export function StarRating({
  rating,
  count,
  size = 14,
  className,
  showValue = true,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${rating.toFixed(1)} من ٥ نجوم`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            aria-hidden
            className={cn(
              "transition-colors",
              i <= rounded
                ? "fill-gold-500 text-gold-500"
                : "fill-transparent text-blush-300",
            )}
          />
        ))}
      </div>
      {showValue ? (
        <span className="num text-[0.72rem] text-plum-400">
          {rating.toFixed(1)}
          {typeof count === "number" ? ` (${formatNumber(count)})` : ""}
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section heading                                                            */
/* -------------------------------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
  className,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  copy?: string;
  align?: "center" | "left";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        action && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="eyebrow mb-3 text-rose-600">{eyebrow}</p>
        ) : null}
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.12]">{title}</h2>
        {copy ? (
          <p className="mt-4 text-[0.95rem] leading-relaxed text-plum-500">{copy}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ornamental divider                                                         */
/* -------------------------------------------------------------------------- */

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)} aria-hidden>
      <span className="hairline flex-1" />
      <span className="size-1.5 rotate-45 bg-gold-500/70" />
      <span className="hairline flex-1" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(90deg,var(--color-cream-200)_25%,var(--color-blush-100)_37%,var(--color-cream-200)_63%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon,
  title,
  copy,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  copy?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center gap-4 rounded-4xl px-8 py-16 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-14 items-center justify-center rounded-full bg-blush-100 text-rose-600">
          {icon}
        </span>
      ) : null}
      <h3 className="text-xl">{title}</h3>
      {copy ? <p className="max-w-md text-sm text-plum-500">{copy}</p> : null}
      {action}
    </div>
  );
}
