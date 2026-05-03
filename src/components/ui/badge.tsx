import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-muted-foreground)]",
        primary:
          "border-primary/30 bg-primary/10 text-primary",
        success:
          "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]",
        danger:
          "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
        warning:
          "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
        outline:
          "border-[var(--color-border)] bg-transparent text-[var(--color-muted-foreground)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
