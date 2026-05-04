"use client";

import Link from "next/link";
import { use } from "react";
import {
  ArrowLeft,
  Pause,
  Play,
  Edit,
  Trash2,
  Loader2,
  Globe,
  Lock,
} from "lucide-react";
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
import {
  useStrategy,
  useTrades,
  useLatestBacktest,
  useUpdateStrategyStatus,
  useUpdateStrategyVisibility,
  useDeleteStrategy,
} from "@/lib/api";

export default function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: strategy, isLoading } = useStrategy(id);
  const { data: trades = [] } = useTrades(id);
  const { data: backtest } = useLatestBacktest(id);
  const updateStatus = useUpdateStrategyStatus();
  const updateVisibility = useUpdateStrategyVisibility();
  const deleteStrat = useDeleteStrategy();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
        <Loader2 className="size-4 animate-spin mr-2" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Strategy not found.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/app/strategies">
            <ArrowLeft className="size-4" /> Back to strategies
          </Link>
        </Button>
      </div>
    );
  }

  const equity =
    backtest?.equity_curve.map((p) => ({
      t: p.t.slice(0, 10),
      equity: p.equity,
    })) ?? [];

  const live = strategy.status === "live";

  async function togglePauseLive() {
    if (!strategy) return;
    await updateStatus.mutateAsync({
      id: strategy.id,
      status: live ? "paused" : "live",
    });
  }

  async function toggleVisibility() {
    if (!strategy) return;
    await updateVisibility.mutateAsync({
      id: strategy.id,
      is_public: !strategy.is_public,
    });
  }

  async function handleDelete() {
    if (!strategy) return;
    if (!confirm(`Delete "${strategy.name}"? This cannot be undone.`)) return;
    await deleteStrat.mutateAsync(strategy.id);
    window.location.href = "/app/strategies";
  }

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
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePauseLive}
              disabled={updateStatus.isPending}
            >
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
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleVisibility}
              disabled={updateVisibility.isPending}
              title={
                strategy.is_public
                  ? "Public — visible on the marketplace"
                  : "Private — only you can see this"
              }
            >
              {strategy.is_public ? (
                <>
                  <Globe className="size-4" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Private
                </>
              )}
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/app/strategies/${strategy.id}/edit`}>
                <Edit className="size-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
              onClick={handleDelete}
              disabled={deleteStrat.isPending}
            >
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
            {trades.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-[var(--color-muted-foreground)]"
                >
                  No trades yet. {live ? "Strategy is live — alerts will populate here when conditions match." : "Activate the strategy to start collecting trades."}
                </TableCell>
              </TableRow>
            )}
            {trades.slice(0, 12).map((t) => {
              const isOpen = t.closed_at === null;
              const pnlUsd = t.pnl_usd ?? 0;
              const pnlPct = t.pnl_pct ?? 0;
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    <Badge variant={t.side === "long" ? "success" : "danger"}>
                      {t.side.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${t.entry_price.toFixed(2)}</TableCell>
                  <TableCell>
                    {t.exit_price !== null
                      ? `$${t.exit_price.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      isOpen
                        ? "text-[var(--color-muted-foreground)]"
                        : pnlUsd >= 0
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-danger)]"
                    }`}
                  >
                    {isOpen ? "open" : fmtUsd(pnlUsd, true)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      isOpen
                        ? "text-[var(--color-muted-foreground)]"
                        : pnlPct >= 0
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-danger)]"
                    }`}
                  >
                    {isOpen ? "—" : fmtPct(pnlPct)}
                  </TableCell>
                  <TableCell>
                    {t.exit_reason ? (
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
                    ) : (
                      <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider">
                        live
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-[var(--color-muted-foreground)]">
                    {timeAgo(t.closed_at ?? t.opened_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
