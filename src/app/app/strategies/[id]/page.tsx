"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Pause, Play, Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { EquityCurve } from "@/components/charts/equity-curve";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { fmtPct, fmtUsd, timeAgo } from "@/lib/utils";
import { MOCK_STRATEGIES, MOCK_TRADES, mockEquityCurve } from "@/lib/mock";

export default function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const strategy = MOCK_STRATEGIES.find((s) => s.id === id) ?? MOCK_STRATEGIES[0];
  const trades = MOCK_TRADES;
  const equity = mockEquityCurve(180, 8500);
  const live = strategy.status === "live";

  return (
    <>
      <PageHeader
        title={strategy.name}
        description={`${strategy.symbol} · ${strategy.timeframe} · ${strategy.description ?? ""}`}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/strategies">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <Button variant="secondary" size="sm">
              {live ? (
                <>
                  <Pause className="size-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Activate
                </>
              )}
            </Button>
            <Button variant="secondary" size="sm">
              <Edit className="size-4" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" aria-label="Delete">
              <Trash2 className="size-4" />
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2 -mt-4 mb-4">
        <Badge
          variant={
            strategy.status === "live"
              ? "success"
              : strategy.status === "paused"
                ? "warning"
                : "default"
          }
        >
          {strategy.status}
        </Badge>
        {strategy.last_fired_at && (
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Last fired {timeAgo(strategy.last_fired_at)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Return"
          value={fmtPct(strategy.return_pct ?? 0)}
          delta={{
            value: "all-time",
            direction: (strategy.return_pct ?? 0) >= 0 ? "up" : "down",
          }}
        />
        <KPICard
          label="Win rate"
          value={`${(strategy.win_rate ?? 0).toFixed(1)}%`}
          hint={`${trades.length} trades`}
        />
        <KPICard
          label="Sharpe"
          value={(strategy.sharpe ?? 0).toFixed(2)}
          hint="Annualized"
        />
        <KPICard
          label="Max drawdown"
          value={`${(strategy.max_drawdown_pct ?? 0).toFixed(1)}%`}
          hint="Peak-to-trough"
        />
      </div>

      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <div className="p-5 pb-3">
          <div className="text-sm font-semibold tracking-tight">
            Equity curve
          </div>
          <div className="text-xs text-[var(--color-muted-foreground)]">
            Backtested over 24 months · 100 SOL fixed notional
          </div>
        </div>
        <EquityCurve data={equity} height={320} tone="blue" />
      </div>

      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            Trade ledger
          </div>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {trades.length} trades
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Side</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <TableHead className="text-right">PnL</TableHead>
              <TableHead className="text-right">PnL %</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.slice(0, 12).map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Badge variant={t.side === "long" ? "success" : "danger"}>
                    {t.side.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>${t.entry_price.toFixed(2)}</TableCell>
                <TableCell>${t.exit_price.toFixed(2)}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    t.pnl_usd >= 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {fmtUsd(t.pnl_usd, true)}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    t.pnl_pct >= 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {fmtPct(t.pnl_pct)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      t.exit_reason === "tp"
                        ? "success"
                        : t.exit_reason === "sl"
                          ? "danger"
                          : "default"
                    }
                  >
                    {t.exit_reason}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-[var(--color-muted-foreground)]">
                  {timeAgo(t.exit_time)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
