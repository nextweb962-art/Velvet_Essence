"use client";

import Link from "next/link";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { deleteProduct, setOrderStatus, toggleProductActive } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/types";

function SubmitIconButton({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-plum-500 transition-colors",
        "hover:bg-blush-100 hover:text-plum-900 disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProductRowActions({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/products/${id}/edit`}
        aria-label={`تعديل ${name}`}
        title="تعديل"
        className="flex size-8 items-center justify-center rounded-full text-plum-500 transition-colors hover:bg-blush-100 hover:text-plum-900"
      >
        <Pencil className="size-3.5" aria-hidden />
      </Link>

      <form action={toggleProductActive}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="active" value={String(!isActive)} />
        <SubmitIconButton
          label={isActive ? `إخفاء ${name}` : `نشر ${name}`}
          className={isActive ? undefined : "text-sage-600"}
        >
          {isActive ? (
            <EyeOff className="size-3.5" aria-hidden />
          ) : (
            <Eye className="size-3.5" aria-hidden />
          )}
        </SubmitIconButton>
      </form>

      {confirming ? (
        <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-1 ring-1 ring-rose-200">
          <span className="text-[0.7rem] text-rose-900">حذف؟</span>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={id} />
            <SubmitIconButton
              label={`تأكيد حذف ${name}`}
              className="text-rose-800 hover:bg-rose-200"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </SubmitIconButton>
          </form>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-[0.7rem] text-plum-500 underline underline-offset-2"
          >
            لا
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`حذف ${name}`}
          title="حذف"
          className="flex size-8 items-center justify-center rounded-full text-plum-500 transition-colors hover:bg-rose-100 hover:text-rose-800"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

/**
 * The whole form lives in this Client Component so `useFormStatus` can observe
 * the submission — it only reports status for forms rendered on the client.
 */
export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  return (
    <form action={setOrderStatus} className="inline-flex items-center gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <StatusFields status={status} />
    </form>
  );
}

function StatusFields({ status }: { status: string }) {
  const { pending } = useFormStatus();

  return (
    <>
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        aria-label="حالة الطلب"
        className="h-9 appearance-none rounded-full border border-blush-200 bg-white/80 px-3 pe-8 text-[0.78rem] text-plum-700 outline-none transition-colors hover:border-blush-300 focus:border-rose-400 disabled:opacity-50"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235D464E' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left 0.6rem center",
          backgroundSize: "12px",
        }}
      >
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <Button type="submit" variant="ghost" size="sm" loading={pending}>
        {pending ? "جارٍ الحفظ…" : "تحديث"}
      </Button>
    </>
  );
}
