"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn, formatPrice } from "@/lib/utils";
import { CATEGORIES } from "@/types";

type Suggestion = {
  slug: string;
  name: string;
  tagline: string | null;
  price: number;
  compareAtPrice: number | null;
  image: string;
  category: string;
};

const TRENDING_TERMS = ["فيلفت نوار", "ورد", "عود", "سيروم", "باليت"];

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose(): void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  /* Focus the field as soon as the overlay is mounted. */
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  /* Reset transient state each time the overlay closes. */
  useEffect(() => {
    if (open) return;
    setTerm("");
    setResults([]);
    setActiveIndex(-1);
  }, [open]);

  /* Debounced instant search. */
  useEffect(() => {
    if (!open) return;

    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const id = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/products?q=${encodeURIComponent(query)}&limit=6`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`فشل البحث (${response.status})`);
        const payload = (await response.json()) as { results: Suggestion[] };
        setResults(payload.results ?? []);
        setActiveIndex(payload.results?.length ? 0 : -1);
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.warn("[search]", error);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(id);
      controller.abort();
    };
  }, [term, open]);

  const go = useCallback(
    (suggestion: Suggestion | undefined) => {
      if (!suggestion) return;
      onClose();
      router.push(`/product/${suggestion.slug}`);
    },
    [onClose, router],
  );

  const submit = useCallback(
    (value?: string) => {
      const query = (value ?? term).trim();
      onClose();
      router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
    },
    [onClose, router, term],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (results.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        go(results[activeIndex]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, results, activeIndex, onClose, go]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[max(1rem,8vh)] sm:pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="البحث في المتجر"
    >
      <button
        type="button"
        aria-label="إغلاق البحث"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-plum-900/35 backdrop-blur-sm"
      />

      <div className="glass-strong animate-scale-in relative w-full max-w-2xl overflow-hidden rounded-4xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex items-center gap-3 border-b border-blush-200 px-5 py-4"
        >
          <Search className="size-4 shrink-0 text-rose-600" aria-hidden />
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            type="search"
            placeholder="ابحثي عن أحمر شفاه، عطور، سيرومات…"
            aria-label="البحث عن منتجات"
            className="h-8 flex-1 bg-transparent text-[0.95rem] text-plum-800 outline-none placeholder:text-plum-400/60"
          />
          {loading ? (
            <Loader2 className="size-4 animate-spin text-blush-400" aria-hidden />
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق البحث"
            className="rounded-full p-1.5 text-plum-400 transition-colors hover:bg-blush-100 hover:text-plum-700"
          >
            <X className="size-4" aria-hidden />
          </button>
        </form>

        <div className="max-h-[52vh] overflow-y-auto overscroll-contain">
          {term.trim().length < 2 ? (
            <div className="p-5">
              <p className="eyebrow mb-3 text-plum-400">تصفّحي</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={category.href}
                    onClick={onClose}
                    className="rounded-full bg-white/70 px-3.5 py-2 text-[0.78rem] text-plum-600 ring-1 ring-blush-200 transition-all hover:bg-white hover:text-plum-900 hover:ring-rose-300"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
              <p className="eyebrow mt-6 mb-3 text-plum-400">جرّبي</p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TERMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTerm(item)}
                    className="rounded-full bg-blush-100/80 px-3.5 py-2 text-[0.78rem] text-rose-800 transition-all hover:bg-blush-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="px-5 py-10 text-center">
              <p className="font-display text-lg text-plum-700">
                لا نتائج لـ«{term.trim()}»
              </p>
              <p className="mt-1 text-[0.8rem] text-plum-500">
                جرّبي درجة، أو نغمة عطرية، أو عائلة منتج.
              </p>
            </div>
          ) : (
            <ul className="p-2">
              {results.map((suggestion, index) => (
                <li key={suggestion.slug}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(suggestion)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-start transition-colors",
                      index === activeIndex ? "bg-white/85" : "hover:bg-white/60",
                    )}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream-200 ring-1 ring-blush-200">
                      <Image
                        src={suggestion.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.88rem] font-medium text-plum-800">
                        {suggestion.name}
                      </span>
                      <span className="block truncate text-[0.74rem] text-plum-400">
                        {suggestion.tagline}
                      </span>
                    </span>
                    <span className="num shrink-0 text-[0.82rem] text-plum-700">
                      {formatPrice(suggestion.price, { compact: true })}
                    </span>
                  </button>
                </li>
              ))}
              <li className="px-1 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => submit()}
                  className="w-full rounded-2xl px-4 py-3 text-[0.8rem] text-rose-700 transition-colors hover:bg-blush-100/70"
                >
                  عرض كل النتائج لـ«{term.trim()}»
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
