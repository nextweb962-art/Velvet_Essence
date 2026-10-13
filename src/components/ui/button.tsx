import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "gold" | "outline" | "ghost" | "link" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-plum-800 text-cream-100 hover:bg-plum-700 active:bg-plum-900 shadow-soft hover:shadow-lift",
  gold: "bg-gradient-to-r from-rose-600 via-rose-500 to-gold-500 text-white hover:brightness-[1.06] shadow-soft hover:shadow-glow",
  outline:
    "border border-plum-800/25 text-plum-800 hover:border-plum-800/60 hover:bg-white/70",
  ghost: "text-plum-700 hover:bg-blush-100/80 hover:text-plum-900",
  link: "text-rose-700 underline decoration-rose-300 decoration-1 underline-offset-4 hover:decoration-rose-600",
  danger: "bg-rose-800 text-white hover:bg-rose-900 shadow-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[0.9375rem]",
  icon: "h-10 w-10",
};

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide " +
  "transition-all duration-300 ease-[var(--ease-silk)] disabled:pointer-events-none " +
  "disabled:opacity-45 whitespace-nowrap select-none";

/** Class recipe shared by `<Button>` and by links that must look like buttons. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
        />
      ) : null}
      {children}
    </button>
  );
}
