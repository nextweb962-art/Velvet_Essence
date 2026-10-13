import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** Builds a page link that preserves every other query parameter. */
function hrefForPage(
  basePath: string,
  params: Record<string, string | string[] | undefined>,
  page: number,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) for (const entry of value) search.append(key, entry);
    else search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  page,
  pageCount,
  params,
  basePath = "/shop",
}: {
  page: number;
  pageCount: number;
  params: Record<string, string | string[] | undefined>;
  basePath?: string;
}) {
  if (pageCount <= 1) return null;

  // Windowed page numbers: always show first, last, and a few around current.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (candidate) =>
      candidate === 1 || candidate === pageCount || Math.abs(candidate - page) <= 1,
  );

  return (
    <nav
      aria-label="التنقل بين الصفحات"
      className="mt-14 flex items-center justify-center gap-2"
    >
      {/* In an RTL document "previous" sits on the right, so the chevrons flip. */}
      <PageLink
        href={hrefForPage(basePath, params, Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="size-4" aria-hidden />
      </PageLink>

      {pages.map((candidate, index) => {
        const previous = pages[index - 1];
        const gap = previous && candidate - previous > 1;

        return (
          <span key={candidate} className="flex items-center gap-2">
            {gap ? <span className="px-1 text-plum-400">…</span> : null}
            <PageLink
              href={hrefForPage(basePath, params, candidate)}
              current={candidate === page}
              aria-label={`الصفحة ${candidate}`}
            >
              <span className="num">{candidate}</span>
            </PageLink>
          </span>
        );
      })}

      <PageLink
        href={hrefForPage(basePath, params, Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  current = false,
  disabled = false,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
} & React.AriaAttributes) {
  const className = cn(
    "flex size-10 items-center justify-center rounded-full text-[0.82rem] transition-all duration-300",
    current
      ? "bg-plum-800 text-cream-100 shadow-soft"
      : "bg-white/70 text-plum-600 ring-1 ring-blush-200 hover:bg-white hover:text-plum-900 hover:ring-rose-300",
    disabled && "pointer-events-none opacity-35",
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled="true" {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={current ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
