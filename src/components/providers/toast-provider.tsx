"use client";

import { Check, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toast(input: { tone?: ToastTone; title: string; description?: string }): void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: Check,
  error: TriangleAlert,
  info: Info,
} as const;

const TONES: Record<ToastTone, string> = {
  success: "text-sage-600",
  error: "text-rose-800",
  info: "text-plum-600",
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ tone = "success", title, description }) => {
      nextId += 1;
      const id = nextId;
      setToasts((current) => [...current.slice(-2), { id, tone, title, description }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map(({ id, tone, title, description }) => {
          const Icon = ICONS[tone];
          return (
            <div
              key={id}
              className="glass-strong animate-scale-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-lift"
            >
              <Icon
                className={cn("mt-0.5 size-4 shrink-0", TONES[tone])}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[0.83rem] leading-snug font-medium text-plum-800">
                  {title}
                </p>
                {description ? (
                  <p className="mt-0.5 text-[0.75rem] text-plum-500">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="إغلاق الإشعار"
                className="rounded-full p-1 text-plum-400 transition-colors hover:bg-blush-100 hover:text-plum-700"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}
