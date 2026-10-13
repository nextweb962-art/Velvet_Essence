export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductCategory =
  | "lipstick"
  | "eyeshadow"
  | "blush"
  | "fragrance"
  | "skincare";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type UserRole = "customer" | "admin";

type Timestamps = { created_at: string };
type UpdatableTimestamps = Timestamps & { updated_at: string };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: UserRole;
        } & UpdatableTimestamps;
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: UserRole;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: UserRole;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string | null;
          description: string;
          category: ProductCategory;
          collection: string | null;
          price: number;
          compare_at_price: number | null;
          images: Json;
          variant_groups: Json;
          badge: string | null;
          rating: number;
          review_count: number;
          stock: number;
          is_active: boolean;
          is_featured: boolean;
          tags: string[];
          search_vector: unknown;
        } & UpdatableTimestamps;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline?: string | null;
          description?: string;
          category: ProductCategory;
          collection?: string | null;
          price: number;
          compare_at_price?: number | null;
          images?: Json;
          variant_groups?: Json;
          badge?: string | null;
          rating?: number;
          review_count?: number;
          stock?: number;
          is_active?: boolean;
          is_featured?: boolean;
          tags?: string[];
        };
        Update: {
          slug?: string;
          name?: string;
          tagline?: string | null;
          description?: string;
          category?: ProductCategory;
          collection?: string | null;
          price?: number;
          compare_at_price?: number | null;
          images?: Json;
          variant_groups?: Json;
          badge?: string | null;
          rating?: number;
          review_count?: number;
          stock?: number;
          is_active?: boolean;
          is_featured?: boolean;
          tags?: string[];
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_group_id: string | null;
          variant_option_id: string | null;
          variant_label: string | null;
          quantity: number;
        } & UpdatableTimestamps;
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant_group_id?: string | null;
          variant_option_id?: string | null;
          variant_label?: string | null;
          quantity?: number;
        };
        Update: {
          variant_group_id?: string | null;
          variant_option_id?: string | null;
          variant_label?: string | null;
          quantity?: number;
        };
        Relationships: [];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
        };
        Update: never;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          email: string;
          customer_name: string;
          status: OrderStatus;
          subtotal: number;
          discount_code: string | null;
          discount_total: number;
          shipping_cost: number;
          tax: number;
          total: number;
          shipping_method: string;
          payment_method: string;
          shipping_address: Json;
          notes: string | null;
        } & UpdatableTimestamps;
        Insert: {
          id?: string;
          order_number?: string;
          user_id: string;
          email: string;
          customer_name: string;
          status?: OrderStatus;
          subtotal: number;
          discount_code?: string | null;
          discount_total?: number;
          shipping_cost?: number;
          tax?: number;
          total: number;
          shipping_method?: string;
          payment_method?: string;
          shipping_address: Json;
          notes?: string | null;
        };
        Update: {
          status?: OrderStatus;
          shipping_address?: Json;
          notes?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
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
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_slug?: string | null;
          variant_label?: string | null;
          image?: string | null;
          unit_price: number;
          quantity: number;
          line_total: number;
        };
        Update: never;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      admin_order_overview: {
        Row: {
          id: string;
          order_number: string;
          status: OrderStatus;
          customer_name: string;
          email: string;
          total: number;
          created_at: string;
          item_count: number;
          unit_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      place_order: {
        Args: {
          p_items: Json;
          p_email: string;
          p_customer_name: string;
          p_shipping_address: Json;
          p_notes: string;
          p_shipping_method: string;
          p_payment_method: string;
          p_subtotal: number;
          p_discount_code: string;
          p_discount_total: number;
          p_shipping_cost: number;
          p_tax: number;
          p_total: number;
        };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
    };
    Enums: {
      product_category: ProductCategory;
      order_status: OrderStatus;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
