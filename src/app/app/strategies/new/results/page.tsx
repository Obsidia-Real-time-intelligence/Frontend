"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
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
import { fmtPct, fmtUsd } from "@/lib/utils";
import { useCreateStrategy } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { BacktestResult, StrategyDSL, Trade } from "@/lib/types";

export default function BacktestResultsPage() {
  const router = useRouter();
  const create = useCreateStrategy();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [dsl, setDsl] = useState<StrategyDSL | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const r = sessionStorage.getItem("obsidia.lastBacktest");
      const d = sessionStorage.getItem("obsidia.lastBacktestDsl");
      if (r) setResult(JSON.parse(r));
      if (d) setDsl(JSON.parse(d));
    } catch {}
  }, []);

  if (!result) {
    return (
      <>
        <PageHeader
          title="Backtest results"
          description="Loading from your last run…"
        />
        <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No recent backtest. Go back to the builder and run one.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/app/strategies/new">
              <ArrowLeft className="size-4" />
              Back to builder
            </Link>
          </Button>
        </div>
      </>
    );
  }

  // Map trade ledger from backend (entry_time iso) to UI shape
  const trades: Trade[] = (result.trade_ledger ?? []).map((t, i) => ({
    id: `t_${i}`,
    strategy_id: "draft",
    side: t.side as "long" | "short",
    entry_time: t.entry_time,
    exit_time: t.exit_time,
    entry_price: t.entry_price,
    exit_price: t.exit_price,
    pnl_pct: t.pnl_pct,
    pnl_usd: t.pnl_usd,
    exit_reason: t.exit_reason as Trade["exit_reason"],
  }));
  const wins = trades.filter((t) => t.pnl_usd > 0);
  const equity = (result.equity_curve ?? []).map((p) => ({
    t: p.t.slice(0, 10),
    equity: p.equity,
  }));

  async function handleSave() {
    if (!dsl) return;
    setSaving(true);
    try {
      const created = await create.mutateAsync(dsl);
      sessionStorage.removeItem("obsidia.lastBacktest");
      sessionStorage.removeItem("obsidia.lastBacktestDsl");
      router.push(`/app/strategies/${created.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Backtest results"
        description="Run completed against 24 months of OHLCV with real fees and slippage. No lookahead."
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/strategies/new">
                <ArrowLeft className="size-4" />
                Back to builder
              </Link>
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !dsl}>
              <Save className="size-4" />
              {saving ? "Saving…" : "Save strategy"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total return"
          value={fmtPct(result.total_pnl_pct)}
          delta={{
            value: `${trades.length} trades`,
            direction: result.total_pnl_pct >= 0 ? "up" : "down",
          }}
          hint="Net of fees + slippage"
        />
        <KPICard
          label="Max drawdown"
          value={`${result.max_drawdown_pct.toFixed(2)}%`}
          hint="Worst peak-to-trough"
        />
        <KPICard
          label="Win rate"
          value={`${result.win_rate.toFixed(1)}%`}
          hint={`${result.wins}W / ${result.losses}L`}
        />
        <KPICard
          label="Sharpe"
          value={result.sharpe.toFixed(2)}
          hint="Per-bar (annualized)"
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
          <div className="p-5 pb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold tracking-tight">
                Equity curve
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)]">
                Starting capital $8,500
              </div>
            </div>
            <Badge variant={result.total_pnl_pct >= 0 ? "success" : "danger"}>
              {fmtPct(result.total_pnl_pct)}
            </Badge>
          </div>
          <EquityCurve
            data={equity}
            height={300}
            tone={result.total_pnl_pct >= 0 ? "green" : "red"}
          />
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div className="text-sm font-semibold tracking-tight mb-4">
            Detailed stats
          </div>
          <dl className="space-y-3 text-xs">
            {[
              ["Trades", trades.length],
              ["Wins", result.wins],
              ["Losses", result.losses],
              ["Profit factor", result.profit_factor.toFixed(2)],
              ["Avg win", `${fmtPct(result.avg_win_pct)}`],
              ["Avg loss", `${fmtPct(result.avg_loss_pct)}`],
              ["Longest losing streak", result.longest_losing_streak],
            ].map(([k, v]) => (
              <div
                key={String(k)}
                className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 last:border-0"
              >
                <dt className="text-[var(--color-muted-foreground)]">{k}</dt>
                <dd className="tabular text-foreground font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Trade-by-trade ledger
            </div>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Every trade as it executed in the backtest
            </div>
          </div>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Showing latest {Math.min(20, trades.length)} of {trades.length}
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <TableHead className="text-right">PnL</TableHead>
              <TableHead className="text-right">PnL %</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Closed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((t, i) => (
              <TableRow key={t.id}>
                <TableCell className="text-[var(--color-muted-foreground)]">
                  {i + 1}
                </TableCell>
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
                <TableCell className="text-right text-[var(--color-muted-foreground)] text-[11px]">
                  {new Date(t.exit_time).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
