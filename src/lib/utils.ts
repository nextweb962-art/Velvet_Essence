import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { SITE } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Jordanian Dinar, formatted for the web.
 *
 * `ar-JO-u-nu-latn` keeps Arabic month/currency wording while forcing Western
 * digits — the convention in Jordanian retail — instead of the Arabic-Indic
 * numerals that `ar-JO` alone would produce.
 *
 * The symbol is appended by hand rather than via `style: "currency"` because
 * CLDR's Arabic symbol for JOD carries a trailing Arabic letter mark
 * (`د.أ.‏`) that renders as a stray mark in buttons and tight layouts.
 */
export function formatPrice(
  value: number,
  options: { compact?: boolean; withSymbol?: boolean } = {},
) {
  const { compact = false, withSymbol = true } = options;

  const amount = new Intl.NumberFormat("ar-JO-u-nu-latn", {
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(value);

  return withSymbol ? `${amount} ${SITE.currencySymbol}` : amount;
}

/** Digits only, for places that render the currency separately. */
export function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("ar-JO-u-nu-latn", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ar-JO-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDay(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ar-JO-u-nu-latn", { dateStyle: "medium" }).format(
    date,
  );
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Order references stay Latin and digit-only so they survive being read aloud
 * over the phone in either script.
 */
export function orderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VE-${stamp}-${rand}`;
}

export function discountedPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Deterministic 0..1 hash — used to stagger animations, not for security. */
export function hashSeed(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}
