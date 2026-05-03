import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <div className="text-sm font-semibold tracking-tight">{title}</div>
        {description && (
          <div className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            {description}
          </div>
        )}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export function FormRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid sm:grid-cols-12 gap-3 sm:items-start">
      <div className="sm:col-span-4">
        <div className="text-xs font-medium text-foreground">{label}</div>
        {hint && (
          <div className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
            {hint}
          </div>
        )}
      </div>
      <div className="sm:col-span-8">{children}</div>
    </div>
  );
}
