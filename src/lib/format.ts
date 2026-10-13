/** Small formatting helpers that are safe on both the server and the client. */

export function initials(value: string) {
  const parts = value
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "VE";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/**
 * Arabic has six plural categories (zero, one, two, few, many, other), so a
 * naive `count === 1 ? x : xs` produces something a native reader stumbles on.
 * These are the four we actually need in this UI, with the unit forms centred
 * on the feminine nouns the boutique uses (قطعة، عميلة، مراجعة).
 */
export type PluralForms = {
  one: string;
  two: string;
  few: string;
  many: string;
};

export const UNITS = {
  piece: { one: "قطعة واحدة", two: "قطعتان", few: "قطع", many: "قطعة" },
  item: { one: "منتج واحد", two: "منتجان", few: "منتجات", many: "منتجاً" },
  order: { one: "طلب واحد", two: "طلبان", few: "طلبات", many: "طلباً" },
  review: { one: "مراجعة واحدة", two: "مراجعتان", few: "مراجعات", many: "مراجعة" },
  line: { one: "بند واحد", two: "بندان", few: "بنود", many: "بنداً" },
  product: { one: "منتج واحد", two: "منتجان", few: "منتجات", many: "منتجاً" },
  customer: { one: "عميلة واحدة", two: "عميلتان", few: "عميلات", many: "عميلة" },
  day: { one: "يوم واحد", two: "يومان", few: "أيام", many: "يوماً" },
} as const satisfies Record<string, PluralForms>;

export function pluralise(count: number, forms: PluralForms) {
  if (count === 0) return `لا ${forms.few}`;
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  if (count >= 3 && count <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}

/** `countOf(3, "piece")` → «3 قطع» */
export function countOf(count: number, unit: keyof typeof UNITS) {
  return pluralise(count, UNITS[unit]);
}

/** The bare word with no number, for tile labels: «القطع». */
export function unitWord(unit: keyof typeof UNITS, form: keyof PluralForms = "few") {
  return UNITS[unit][form];
}
