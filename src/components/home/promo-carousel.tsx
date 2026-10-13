"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { buttonClasses } from "@/components/ui/button";
import { PROMOS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ROTATION_MS = 6500;

export function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const total = PROMOS.length;

  /** `go(1)` always means "next" in reading order, which is right-to-left here. */
  const go = useCallback(
    (direction: 1 | -1) => setIndex((current) => (current + direction + total) % total),
    [total],
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => go(1), ROTATION_MS);
    return () => window.clearInterval(id);
  }, [go, paused]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!regionRef.current?.contains(document.activeElement)) return;
      // Arrow keys follow the visual direction, not the logical one.
      if (event.key === "ArrowLeft") go(1);
      if (event.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  return (
    <section className="container-x py-16 sm:py-20">
      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="عروض الدار"
        tabIndex={0}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="relative overflow-hidden rounded-[2.25rem] ring-1 ring-blush-200/70 shadow-soft"
      >
        <div className="relative h-[27rem] sm:h-[24rem]">
          {PROMOS.map((promo, i) => {
            const active = i === index;
            return (
              <article
                key={promo.id}
                aria-hidden={!active}
                aria-roledescription="slide"
                aria-label={`${i + 1} من ${total}: ${promo.title}`}
                className={cn(
                  "absolute inset-0 transition-all duration-[900ms] ease-[var(--ease-silk)]",
                  active
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none -translate-x-8 opacity-0",
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br", promo.tone)} />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(120%_100%_at_12%_10%,rgba(255,255,255,0.5),transparent_55%)]"
                />
                <div
                  aria-hidden
                  className="absolute -left-16 -bottom-24 size-[24rem] rounded-full bg-white/18 blur-2xl"
                />

                <div className="relative flex h-full flex-col justify-center px-8 py-12 sm:px-14 lg:max-w-2xl lg:px-20">
                  <p className="eyebrow text-white/85">{promo.eyebrow}</p>
                  <h2 className="mt-4 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] leading-[1.2] text-white">
                    {promo.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-[0.92rem] leading-relaxed text-white/85">
                    {promo.copy}
                  </p>
                  <div className="mt-8">
                    <Link
                      href={promo.href}
                      tabIndex={active ? 0 : -1}
                      className={buttonClasses(
                        "outline",
                        "md",
                        "border-white/60 bg-white/95 text-plum-800 hover:border-white hover:bg-white",
                      )}
                    >
                      {promo.cta}
                      <ArrowLeft className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-8 pb-6 sm:px-14 lg:px-20">
          <div
            role="tablist"
            aria-label="اختاري عرضاً"
            className="flex items-center gap-2"
          >
            {PROMOS.map((promo, i) => (
              <button
                key={promo.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={promo.title}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-500 ease-[var(--ease-silk)]",
                  i === index ? "w-10 bg-white" : "w-4 bg-white/45 hover:bg-white/70",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="العرض السابق"
              className="flex size-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition-all hover:bg-white/40"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="العرض التالي"
              className="flex size-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition-all hover:bg-white/40"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
