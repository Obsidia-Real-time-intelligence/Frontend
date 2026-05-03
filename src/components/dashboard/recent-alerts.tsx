import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Alert } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export function RecentAlerts({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <div>
          <div className="text-sm font-semibold tracking-tight">
            Recent alerts
          </div>
          <div className="text-xs text-[var(--color-muted-foreground)]">
            Live signals from your saved strategies
          </div>
        </div>
        <Link
          href="/app/alerts"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      <ul className="divide-y divide-[var(--color-border)]">
        {alerts.length === 0 && (
          <li className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No alerts yet. Live alerts appear here when your strategies fire.
            </p>
          </li>
        )}
        {alerts.map((a) => {
          const isLong = a.side === "long";
          const Arrow = isLong ? ArrowUpRight : ArrowDownRight;
          return (
            <li key={a.id}>
              <Link
                href={`/app/alerts/${a.id}`}
                className="grid grid-cols-12 items-center gap-3 px-5 py-4 hover:bg-[var(--color-elevated)]/50 transition-colors"
              >
                <div className="col-span-1">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-md border ${
                      isLong
                        ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                    }`}
                  >
                    <Arrow className="size-3.5" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="col-span-4 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {a.strategy_name}
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                    {a.symbol} · {timeAgo(a.fired_at)}
                  </div>
                </div>

                <div className="col-span-2 text-right tabular">
                  <div className="text-sm font-medium">
                    ${a.price.toFixed(2)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                    Trigger
                  </div>
                </div>

                <div className="col-span-4 hidden md:block">
                  <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2">
                    {a.ai_summary}
                  </p>
                </div>

                <div className="col-span-1 text-right">
                  <Badge
                    variant={
                      a.ai_confidence >= 7
                        ? "success"
                        : a.ai_confidence >= 5
                          ? "primary"
                          : "default"
                    }
                  >
                    {a.ai_confidence}/10
                  </Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
