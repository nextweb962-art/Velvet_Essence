export type CategoryId =
  | "lipstick"
  | "eyeshadow"
  | "blush"
  | "fragrance"
  | "skincare";

export type Category = {
  id: CategoryId;
  label: string;
  blurb: string;
  href: string;
  accent: string;
};

export const CATEGORIES: readonly Category[] = [
  {
    id: "lipstick",
    label: "أحمر الشفاه",
    blurb: "ستان، مطفي ولامع",
    href: "/shop?category=lipstick",
    accent: "from-rose-200 to-blush-300",
  },
  {
    id: "eyeshadow",
    label: "ظلال العيون",
    blurb: "باليتات وألوان",
    href: "/shop?category=eyeshadow",
    accent: "from-plum-400/40 to-rose-200",
  },
  {
    id: "blush",
    label: "البلاشر",
    blurb: "كريمي وبودرة",
    href: "/shop?category=blush",
    accent: "from-blush-200 to-rose-300",
  },
  {
    id: "fragrance",
    label: "العطور",
    blurb: "أو دو بارفان وميست",
    href: "/shop?category=fragrance",
    accent: "from-gold-200 to-rose-200",
  },
  {
    id: "skincare",
    label: "العناية بالبشرة",
    blurb: "سيرومات وبلاسم",
    href: "/shop?category=skincare",
    accent: "from-cream-200 to-blush-200",
  },
] as const;

export const CATEGORY_LABELS: Record<CategoryId, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.label }),
  {} as Record<CategoryId, string>,
);

export function isCategoryId(value: unknown): value is CategoryId {
  return (
    typeof value === "string" && CATEGORIES.some((c) => c.id === value)
  );
}

export type VariantOption = {
  id: string;
  name: string;
  /** Swatch colour for shades, e.g. "#B76E79" */
  hex?: string;
  /** Signed adjustment applied to the base price. */
  priceDelta?: number;
  stock?: number;
  image?: string;
  caption?: string;
};

export type VariantGroup = {
  id: string;
  label: string;
  /** `swatch` renders colour circles, `chip` renders sized pills. */
  display: "swatch" | "chip";
  options: VariantOption[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  category: CategoryId;
  collection: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  variant_groups: VariantGroup[];
  badge: string | null;
  rating: number;
  review_count: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  tags: string[];
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;

export type CartLine = {
  /** Stable identity: product + chosen variant. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  category: CategoryId;
  groupId: string | null;
  groupLabel: string | null;
  optionId: string | null;
  optionName: string | null;
  optionHex: string | null;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

/**
 * Jordan settles almost all fashion and beauty orders in cash at the door, so
 * the storefront ships with a single, cardless payment path and no field for
 * payment credentials anywhere in the flow.
 */
export type PaymentMethod = "cash_on_delivery";

export type ShippingMethod = "standard" | "express";

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  variant_label: string | null;
  image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  customer_name: string;
  status: OrderStatus;
  subtotal: number;
  discount_code: string | null;
  discount_total: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  shipping_address: ShippingAddress;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type Promo = {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
  href: string;
  tone: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
};
