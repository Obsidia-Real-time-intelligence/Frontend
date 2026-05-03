import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  hint?: string;
}

export function KPICard({ label, value, delta, hint }: KPICardProps) {
  const deltaColor =
    delta?.direction === "up"
      ? "text-[var(--color-success)]"
      : delta?.direction === "down"
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-muted-foreground)]";

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2 tabular">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {delta && (
          <span className={cn("text-xs font-medium tabular", deltaColor)}>
            {delta.value}
          </span>
        )}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-[var(--color-subtle-foreground)]">
          {hint}
        </div>
      )}
    </div>
  );
}
