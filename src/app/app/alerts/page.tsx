"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { timeAgo } from "@/lib/utils";
import { useAlerts } from "@/lib/api";
import type { Alert } from "@/lib/types";

export default function AlertsPage() {
  const { data: alerts = [], isLoading } = useAlerts(100);
  const unread = alerts.filter((a) => !a.read);
  const read = alerts.filter((a) => a.read);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Alerts"
          description="Live signals from your saved strategies, ranked by AI confidence."
        />
        <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
          <Loader2 className="size-4 animate-spin mr-2" />
          <span className="text-sm">Loading alerts…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Live signals from your saved strategies, ranked by AI confidence."
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
          <TabsTrigger value="read">Read ({read.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AlertsList alerts={alerts} />
        </TabsContent>
        <TabsContent value="unread">
          <AlertsList alerts={unread} />
        </TabsContent>
        <TabsContent value="read">
          <AlertsList alerts={read} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function AlertsList({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No alerts here.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <ul className="divide-y divide-[var(--color-border)]">
        {alerts.map((a) => {
          const isLong = a.side === "long";
          const Arrow = isLong ? ArrowUpRight : ArrowDownRight;
          return (
            <li key={a.id}>
              <Link
                href={`/app/alerts/${a.id}`}
                className="grid grid-cols-12 items-start gap-3 px-5 py-4 hover:bg-[var(--color-elevated)]/50 transition-colors"
              >
                <div className="col-span-1 pt-0.5">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-md border ${
                      isLong
                        ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                    }`}
                  >
                    <Arrow className="size-4" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="col-span-3 min-w-0">
                  <div className="flex items-center gap-2">
                    {!a.read && (
                      <span className="size-1.5 rounded-full bg-primary inline-block" />
                    )}
                    <div className="text-sm font-medium text-foreground truncate">
                      {a.strategy_name}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {a.symbol} · {timeAgo(a.fired_at)}
                  </div>
                </div>

                <div className="col-span-2 tabular text-xs">
                  <Row k="Trigger" v={`$${a.price.toFixed(2)}`} />
                  <Row
                    k="Entry"
                    v={a.suggested_entry != null ? `$${a.suggested_entry.toFixed(2)}` : "—"}
                  />
                </div>

                <div className="col-span-2 tabular text-xs">
                  <Row
                    k="Stop"
                    v={a.suggested_sl != null ? `$${a.suggested_sl.toFixed(2)}` : "—"}
                    color="text-[var(--color-danger)]"
                  />
                  <Row
                    k="Target"
                    v={a.suggested_tp != null ? `$${a.suggested_tp.toFixed(2)}` : "—"}
                    color="text-[var(--color-success)]"
                  />
                </div>

                <div className="col-span-3 hidden md:block">
                  <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-3 leading-relaxed">
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

function Row({
  k,
  v,
  color,
}: {
  k: string;
  v: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {k}
      </span>
      <span className={`tabular ${color ?? "text-foreground"} font-medium`}>
        {v}
      </span>
    </div>
  );
}
