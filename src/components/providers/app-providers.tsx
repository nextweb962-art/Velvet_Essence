"use client";

import { CartProvider } from "@/components/providers/cart-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function AppProviders({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider userId={userId}>{children}</CartProvider>
    </ToastProvider>
  );
}
