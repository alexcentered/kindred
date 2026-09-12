import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { AvatarTone, PostType } from "@/lib/kindred/types";
import { POST_TYPE_LABEL } from "@/lib/kindred/format";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        glass: "glass text-fg",
        ghost: "bg-transparent text-fg hover:bg-accent-soft",
        quiet: "bg-accent-soft text-fg",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-lg",
        md: "h-11 px-4 text-sm rounded-xl",
        lg: "h-12 px-5 text-base rounded-xl",
        icon: "size-11 rounded-xl",
        pill: "h-9 px-3.5 text-sm rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

export function Field({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl px-3.5 text-sm text-fg placeholder:text-subtle",
        "glass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Area({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-xl px-3.5 py-3 text-sm text-fg placeholder:text-subtle",
        "glass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent resize-none",
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({
  initials,
  tone,
  size = "md",
  className,
}: {
  initials: string;
  tone: AvatarTone;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dim = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-12 text-base", xl: "size-16 text-lg" }[size];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium tracking-wide",
        `tone-${tone}`,
        dim,
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function TypeBadge({ type }: { type: PostType }) {
  return (
    <span className={cn("text-xs font-medium tracking-wide uppercase", `type-${type}`)}>
      {POST_TYPE_LABEL[type]}
    </span>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.96]",
        active ? "bg-accent text-accent-fg" : "glass text-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wider text-subtle">{children}</p>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl px-5 py-10 text-center">
      <p className="font-display text-xl text-fg">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
