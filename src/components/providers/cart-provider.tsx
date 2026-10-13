"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useToast } from "@/components/providers/toast-provider";
import {
  CART_STORAGE_KEY,
  buildCartLine,
  cartLineKey,
  computeTotals,
  parseStoredCart,
  resolveOption,
  type CartTotals,
} from "@/lib/cart";
import { rowToProduct } from "@/lib/product-mapper";
import { createClient } from "@/lib/supabase/client";
import { clamp } from "@/lib/utils";
import type { CartLine, Product } from "@/types";

type AddPayload = {
  product: Product;
  groupId?: string | null;
  optionId?: string | null;
  quantity?: number;
  /** Suppress the drawer + toast (used by quick-add and "buy it now" flows). */
  silent?: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  totals: CartTotals;
  /** False until the persisted cart has been read, so the UI avoids a flash. */
  hydrated: boolean;
  isSyncing: boolean;
  itemCount: number;
  isOpen: boolean;
  openCart(): void;
  closeCart(): void;
  addItem(payload: AddPayload): void;
  setQuantity(key: string, quantity: number): void;
  removeItem(key: string): void;
  clear(): void;
  hasProduct(productId: string): boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  /** Guards the write-through effect from running before the initial merge. */
  const readyForRemote = useRef(false);
  const remoteTimer = useRef<number | null>(null);

  /* ---------------------------------------------------------------------- */
  /* 1. Hydrate from localStorage (guests and signed-in shoppers alike)      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    setLines(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    setHydrated(true);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* 2. Persist locally on every change                                     */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private browsing or storage disabled — the cart simply will not persist.
    }
  }, [lines, hydrated]);

  /* ---------------------------------------------------------------------- */
  /* 3. On sign-in, merge the guest cart into Supabase and adopt the result  */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!hydrated) return;

    if (!userId) {
      readyForRemote.current = false;
      return;
    }

    let cancelled = false;

    (async () => {
      setIsSyncing(true);
      try {
        const supabase = createClient();

        const { data: rows, error } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", userId);
        if (error) throw error;

        const productIds = Array.from(
          new Set((rows ?? []).map((row) => row.product_id)),
        );

        // Two plain queries rather than an embedded join: keeps every read
        // fully typed and avoids relying on PostgREST relationship inference.
        const remoteProductRows = productIds.length
          ? (
              await supabase.from("products").select("*").in("id", productIds)
            ).data ?? []
          : [];

        const byId = new Map(remoteProductRows.map((row) => [row.id, row]));

        const remoteLines: CartLine[] = [];
        for (const row of rows ?? []) {
          const productRow = byId.get(row.product_id);
          if (!productRow) continue;
          const product = rowToProduct(productRow);
          const { group, option } = resolveOption(
            product,
            row.variant_group_id,
            row.variant_option_id,
          );
          remoteLines.push(buildCartLine(product, group, option, row.quantity));
        }

        if (cancelled) return;

        // Merge strategy: the larger quantity wins per line, so signing in on a
        // second device can never silently double somebody's order.
        const merged = new Map(remoteLines.map((line) => [line.key, line]));

        for (const line of parseStoredCart(
          window.localStorage.getItem(CART_STORAGE_KEY),
        )) {
          const existing = merged.get(line.key);
          merged.set(
            line.key,
            existing
              ? {
                  ...existing,
                  quantity: clamp(
                    Math.max(existing.quantity, line.quantity),
                    1,
                    existing.maxQuantity,
                  ),
                }
              : line,
          );
        }

        setLines(Array.from(merged.values()));
        readyForRemote.current = true;
      } catch (error) {
        // A missing schema or an RLS denial must never break the storefront —
        // the local cart keeps working independently.
        console.warn(
          "[cart] remote sync unavailable:",
          error instanceof Error ? error.message : error,
        );
        readyForRemote.current = false;
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, hydrated]);

  /* ---------------------------------------------------------------------- */
  /* 4. Debounced write-through to Supabase for signed-in shoppers          */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!userId || !hydrated || !readyForRemote.current) return;

    if (remoteTimer.current) window.clearTimeout(remoteTimer.current);

    remoteTimer.current = window.setTimeout(async () => {
      try {
        const supabase = createClient();
        const snapshot = lines;

        const { error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId);
        if (deleteError) throw deleteError;

        if (snapshot.length > 0) {
          const { error: insertError } = await supabase.from("cart_items").insert(
            snapshot.map((line) => ({
              user_id: userId,
              product_id: line.productId,
              variant_group_id: line.groupId,
              variant_option_id: line.optionId,
              variant_label: line.optionName,
              quantity: line.quantity,
            })),
          );
          if (insertError) throw insertError;
        }
      } catch (error) {
        console.warn(
          "[cart] could not persist to Supabase:",
          error instanceof Error ? error.message : error,
        );
      }
    }, 700);

    return () => {
      if (remoteTimer.current) window.clearTimeout(remoteTimer.current);
    };
  }, [lines, userId, hydrated]);

  /* ---------------------------------------------------------------------- */
  /* Mutations                                                              */
  /* ---------------------------------------------------------------------- */

  const addItem = useCallback<CartContextValue["addItem"]>(
    ({ product, groupId, optionId, quantity = 1, silent = false }) => {
      const { group, option } = resolveOption(product, groupId, optionId);

      // A product with variants cannot be added without a choice.
      if (product.variant_groups.length > 0 && !option) {
        toast({
          tone: "error",
          title: `Choose a ${(
            product.variant_groups[0]?.label ?? "variant"
          ).toLowerCase()}`,
          description: "Pick an option before adding this to your bag.",
        });
        return;
      }

      const key = cartLineKey(product.id, option?.id);
      const alreadyInBag = lines.some((line) => line.key === key);

      setLines((current) => {
        const index = current.findIndex((line) => line.key === key);
        if (index >= 0) {
          return current.map((line, i) =>
            i === index
              ? {
                  ...line,
                  quantity: clamp(line.quantity + quantity, 1, line.maxQuantity),
                }
              : line,
          );
        }
        return [...current, buildCartLine(product, group, option, quantity)];
      });

      if (!silent) {
        setIsOpen(true);
        toast({
          title: alreadyInBag
            ? `${product.name} quantity updated`
            : `${product.name} added to your bag`,
          description: option ? `${group?.label}: ${option.name}` : undefined,
        });
      }
    },
    [lines, toast],
  );

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    (key, quantity) => {
      setLines((current) =>
        current.flatMap((line) => {
          if (line.key !== key) return [line];
          const next = clamp(Math.round(quantity), 0, line.maxQuantity);
          return next <= 0 ? [] : [{ ...line, quantity: next }];
        }),
      );
    },
    [],
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>((key) => {
    setLines((current) => current.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totals,
      hydrated,
      isSyncing,
      itemCount: totals.itemCount,
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
      hasProduct: (productId) => lines.some((line) => line.productId === productId),
    }),
    [
      lines,
      totals,
      hydrated,
      isSyncing,
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* Quality of life: lock body scroll and close on Escape.                 */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
