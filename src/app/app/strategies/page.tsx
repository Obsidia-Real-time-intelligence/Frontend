"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { fmtPct } from "@/lib/utils";
import { useStrategies } from "@/lib/api";
import type { Strategy } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function StrategiesPage() {
  const { data: strategies = [], isLoading } = useStrategies();
  const live = strategies.filter((s) => s.status === "live");
  const paused = strategies.filter((s) => s.status === "paused");
  const draft = strategies.filter((s) => s.status === "draft");

  return (
    <>
      <PageHeader
        title="Strategies"
        description="All your saved strategies. Live ones run 24/7 and fire alerts when they trigger."
        actions={
          <Button asChild size="sm">
            <Link href="/app/strategies/new">
              <Plus className="size-4" />
              New strategy
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
          <Loader2 className="size-4 animate-spin mr-2" />
          <span className="text-sm">Loading…</span>
        </div>
      )}

      {!isLoading && (
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({strategies.length})</TabsTrigger>
          <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({paused.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draft.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <StrategyTable rows={strategies} />
        </TabsContent>
        <TabsContent value="live">
          <StrategyTable rows={live} />
        </TabsContent>
        <TabsContent value="paused">
          <StrategyTable rows={paused} />
        </TabsContent>
        <TabsContent value="draft">
          <StrategyTable rows={draft} />
        </TabsContent>
      </Tabs>
      )}
    </>
  );
}

function StrategyTable({ rows }: { rows: Strategy[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No strategies here yet.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/app/strategies/new">
            <Plus className="size-4" />
            Create one
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Symbol / TF</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Return</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
            <TableHead className="text-right">Sharpe</TableHead>
            <TableHead className="text-right">MDD</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.id} className="cursor-pointer">
              <TableCell>
                <Link
                  href={`/app/strategies/${s.id}`}
                  className="font-medium hover:text-primary"
                >
                  {s.name}
                </Link>
                <div className="text-[11px] text-[var(--color-muted-foreground)]">
                  {s.description}
                </div>
              </TableCell>
              <TableCell className="text-[var(--color-muted-foreground)]">
                {s.symbol} · {s.timeframe}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    s.status === "live"
                      ? "success"
                      : s.status === "paused"
                        ? "warning"
                        : "default"
                  }
                >
                  {s.status}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  (s.return_pct ?? 0) >= 0
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-danger)]"
                }`}
              >
                {fmtPct(s.return_pct ?? 0)}
              </TableCell>
              <TableCell className="text-right">
                {(s.win_rate ?? 0).toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">
                {(s.sharpe ?? 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-[var(--color-muted-foreground)]">
                {(s.max_drawdown_pct ?? 0).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
