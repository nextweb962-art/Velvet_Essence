import type { OrderStatus, Promo, Testimonial } from "@/types";

/* -------------------------------------------------------------------------- */
/* The house                                                                  */
/* -------------------------------------------------------------------------- */

export const SITE = {
  /** Arabic name for metadata and prose; the wordmark stays Latin as a logotype. */
  name: "فيلفت إسنس",
  latinName: "Velvet Essence",
  tagline: "دار الجمال",
  description:
    "دار متخصّصة في أحمر الشفاه المخملي وباليتات ظلال العيون والعطور الراقية. تركيبات نظيفة، وتغليف مصنوع بحبّ، في عمّان — لعطر يسبقك ويدوم بعدك.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  currency: "JOD",
  currencySymbol: "د.أ",
  locale: "ar-JO",
  email: "care@velvetessence.jo",
  phone: "+962 6 555 0148",
  addressLine: "شارع المدينة المنورة، عبدون",
  address: "عبدون، شارع المدينة المنورة، عمّان 11185، الأردن",
  hours: "من الأحد إلى الخميس، 10 صباحاً – 7 مساءً",
  socials: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Commerce — Jordan                                                          */
/* -------------------------------------------------------------------------- */

export const COMMERCE = {
  /** Orders at or above this subtotal ship free, in JOD. */
  freeShippingThreshold: 50,
  flatShippingRate: 3,
  expressShippingRate: 6,
  /** Jordan's general sales tax on cosmetics. */
  taxRate: 0.16,
  taxLabel: "ضريبة المبيعات 16%",
  maxQuantityPerLine: 12,
  /** Delivery is national, cash on delivery only. */
  paymentMethod: "cash_on_delivery",
  paymentLabel: "الدفع عند الاستلام",
} as const;

/** The twelve governorates, used as the region field at checkout. */
export const GOVERNORATES = [
  "عمّان",
  "إربد",
  "الزرقاء",
  "البلقاء",
  "المفرق",
  "جرش",
  "مادبا",
  "عجلون",
  "الكرك",
  "معان",
  "الطفيلة",
  "العقبة",
] as const;

/** Delivery windows quoted at checkout. */
export const SHIPPING_OPTIONS = [
  {
    id: "standard" as const,
    label: "التوصيل العادي",
    copy: "٢–٤ أيام عمل",
    note: "يشمل جميع محافظات المملكة",
  },
  {
    id: "express" as const,
    label: "التوصيل السريع",
    copy: "خلال ٢٤ ساعة داخل عمّان",
    note: "اطلب قبل الساعة ٢ ظهراً",
  },
] as const;

export const SORT_OPTIONS = [
  { id: "featured", label: "الأكثر رواجاً" },
  { id: "newest", label: "وصل حديثاً" },
  { id: "price-asc", label: "السعر: من الأقل إلى الأعلى" },
  { id: "price-desc", label: "السعر: من الأعلى إلى الأقل" },
  { id: "rating", label: "الأعلى تقييماً" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد التأكيد",
  paid: "مدفوع",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};

/* -------------------------------------------------------------------------- */
/* Merchandising                                                              */
/* -------------------------------------------------------------------------- */

export const PROMOS: readonly Promo[] = [
  {
    id: "la-velours",
    eyebrow: "جديد هذا الموسم",
    title: "لا فيلور",
    copy: "ستّة أحمر شفاه مخملي خفيف على الشفاه، بلون مشبع وتغليف من الذهب الوردي المصقول.",
    cta: "تسوّقي المجموعة",
    href: "/shop?category=lipstick",
    tone: "from-rose-600 via-rose-500 to-gold-400",
  },
  {
    id: "nuit-bloomee",
    eyebrow: "عطور فاخرة",
    title: "نوي بلوميه",
    copy: "ياسمين يتفتّح ليلاً، وورد تركي، ولمسة من العنبر الدافئ. توقيع الدار.",
    cta: "اكتشفي العطر",
    href: "/shop?category=fragrance",
    tone: "from-plum-800 via-rose-700 to-rose-500",
  },
  {
    id: "glow-ritual",
    eyebrow: "الروتين الكامل",
    title: "توهّج غلاسهاوس",
    copy: "روتين من أربع خطوات لإشراقة تخرج من داخل البشرة. مختبر جلدياً وخالٍ من القسوة.",
    cta: "ابدئي الروتين",
    href: "/shop?category=skincare",
    tone: "from-gold-300 via-blush-300 to-rose-300",
  },
  {
    id: "atelier-rose",
    eyebrow: "إصدار محدود",
    title: "أتيليه روزيه",
    copy: "باليت من اثني عشر لوناً بألوان البتلات — ساتان ومعدني ومات كريمي واحد مثالي.",
    cta: "تصفّحي الباليت",
    href: "/shop?category=eyeshadow",
    tone: "from-blush-400 via-rose-400 to-plum-600",
  },
] as const;

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "t1",
    quote:
      "فيلفت نوار هو أول أحمر شفاه أكمله حتى آخر قطرة. يثبت مع القهوة والعشاء، والتغليف يشبه المجوهرات.",
    author: "أمل الزعبي",
    location: "عمّان",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "صار نوي بلوميه توقيعي الخاص. ثلاثة أشخاص أوقفوني في ليلة واحدة ليسألوني عن العطر.",
    author: "ليان الحوراني",
    location: "إربد",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "بشرتي حساسة، وسيروم غلاسهاوس أول منتج أعطاني إشراقة دون أي تهيّج. مخلصة له.",
    author: "رِيم النعيمي",
    location: "العقبة",
    rating: 5,
  },
  {
    id: "t4",
    quote:
      "طلبت يوم الأربعاء ووصلني يوم الجمعة، في أجمل علبة استلمتها في حياتي. شعرت أنني أهديت نفسي شيئاً.",
    author: "سارة المصري",
    location: "الزرقاء",
    rating: 5,
  },
] as const;

export const ANNOUNCEMENTS = [
  "توصيل مجاني للطلبات فوق ٥٠ د.أ",
  "عينتان مجانيتان مع كل طلب",
  "الدفع عند الاستلام في جميع المحافظات",
  "خالٍ من القسوة على الحيوانات دائماً",
  "إرجاع مجاني خلال ٣٠ يوماً",
] as const;
