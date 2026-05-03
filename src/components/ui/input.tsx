import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1 text-sm text-foreground shadow-sm transition-colors",
        "placeholder:text-subtle-foreground placeholder:text-[var(--color-subtle-foreground)]",
        "focus:border-primary focus:outline-none focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
