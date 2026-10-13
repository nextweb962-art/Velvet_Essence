import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-blush-200 bg-white/80 px-4 text-sm text-plum-800",
        "placeholder:text-plum-400/60",
        "transition-all duration-200 outline-none",
        "hover:border-blush-300",
        "focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-200/40",
        "disabled:cursor-not-allowed disabled:bg-cream-200 disabled:opacity-60",
        "aria-[invalid=true]:border-rose-700 aria-[invalid=true]:ring-rose-200/60",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-blush-200 bg-white/80 px-4 py-3 text-sm text-plum-800",
        "placeholder:text-plum-400/60",
        "transition-all duration-200 outline-none resize-y",
        "hover:border-blush-300",
        "focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-200/40",
        "disabled:cursor-not-allowed disabled:bg-cream-200 disabled:opacity-60",
        "aria-[invalid=true]:border-rose-700",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-xl border border-blush-200 bg-white/80",
        "bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat px-4 pr-10 text-sm text-plum-800",
        "transition-all duration-200 outline-none",
        "hover:border-blush-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-200/40",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235D464E' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer appearance-none rounded-[5px] border border-blush-400 bg-white",
        "transition-all duration-200 checked:border-rose-600 checked:bg-rose-600",
        "checked:bg-[length:11px] checked:bg-center checked:bg-no-repeat",
        "focus-visible:ring-4 focus-visible:ring-rose-200/50",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E\")",
      }}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Field wrapper — label, hint and error in one accessible unit               */
/* -------------------------------------------------------------------------- */

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional = false,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[0.78rem] font-medium tracking-[0.08em] text-plum-600 uppercase"
        >
          {label}
          {optional ? (
            <span className="ml-2 text-[0.65rem] tracking-normal text-plum-400 normal-case">
              optional
            </span>
          ) : null}
        </label>
        {hint && !error ? (
          <span className="text-[0.7rem] text-plum-400">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          role="alert"
          className="animate-fade-in text-[0.75rem] font-medium text-rose-800"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
