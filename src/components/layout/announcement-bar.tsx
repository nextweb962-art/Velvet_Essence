import { Sparkle } from "lucide-react";

import { ANNOUNCEMENTS } from "@/lib/constants";

/**
 * Infinite marquee. The list is rendered twice and translated by exactly -50%,
 * so the loop is seamless without measuring anything in JavaScript.
 */
export function AnnouncementBar() {
  const items = ANNOUNCEMENTS;

  return (
    <div className="relative overflow-hidden bg-plum-800 text-cream-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--color-rose-800),transparent_35%,transparent_65%,var(--color-rose-800))] opacity-60"
      />
      <div className="relative flex py-2.5">
        <div className="animate-marquee flex min-w-max items-center">
          {[0, 1].map((pass) => (
            <ul
              key={pass}
              className="flex items-center"
              aria-hidden={pass === 1 ? true : undefined}
            >
              {items.map((item) => (
                <li
                  key={`${pass}-${item}`}
                  className="flex items-center gap-4 px-6 text-[0.68rem] tracking-[0.22em] whitespace-nowrap uppercase"
                >
                  <Sparkle className="size-3 text-gold-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
