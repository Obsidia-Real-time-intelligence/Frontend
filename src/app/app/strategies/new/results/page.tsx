"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Pause,
  Play,
  RotateCcw,
  FastForward,
  RefreshCw,
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
import { fmtPct, fmtUsd } from "@/lib/utils";
import {
  useCreateStrategy,
  useRunBacktest,
  useSaveBacktestForStrategy,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePlayback } from "@/lib/use-playback";
import type { BacktestResult, StrategyDSL, Trade } from "@/lib/types";

const STARTING_CAPITAL = 8500;
// 1× plays the full backtest over 30s — slow enough to watch the equity
// curve build day-by-day. Multipliers cover slow-motion (0.5×) for
// inspecting a critical drawdown, or fast-forward (2×/4×) when the user
// just wants the final number.
const SPEEDS = [0.5, 1, 2, 4] as const;
const PLAYBACK_BASE_MS = 30_000;

export default function BacktestResultsPage() {
  const router = useRouter();
  const create = useCreateStrategy();
  const saveBacktest = useSaveBacktestForStrategy();
  const runBacktest = useRunBacktest();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [dsl, setDsl] = useState<StrategyDSL | null>(null);
  const [saving, setSaving] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    try {
      const r = sessionStorage.getItem("obsidia.lastBacktest");
      const d = sessionStorage.getItem("obsidia.lastBacktestDsl");
      if (r) setResult(JSON.parse(r));
      if (d) setDsl(JSON.parse(d));
    } catch {}
  }, []);

  // Parse trades + equity once, in stable order
  const fullTrades: Trade[] = useMemo(
    () =>
      (result?.trade_ledger ?? []).map((t, i) => ({
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
      })),
    [result]
  );
  const fullEquity = useMemo(
    () =>
      (result?.equity_curve ?? []).map((p) => ({
        t: p.t.slice(0, 10),
        equity: p.equity,
        rawT: p.t,
      })),
    [result]
  );

  const startTime = useMemo(() => {
    if (fullEquity.length) return new Date(fullEquity[0].rawT);
    if (fullTrades.length) return new Date(fullTrades[0].entry_time);
    return null;
  }, [fullEquity, fullTrades]);
  const endTime = useMemo(() => {
    if (fullEquity.length)
      return new Date(fullEquity[fullEquity.length - 1].rawT);
    if (fullTrades.length)
      return new Date(fullTrades[fullTrades.length - 1].exit_time);
    return null;
  }, [fullEquity, fullTrades]);

  const playback = usePlayback({
    startTime,
    endTime,
    durationMs: PLAYBACK_BASE_MS,
    speed,
    isPlaying,
  });

  // Auto-pause when finished (single play-through, manual restart available)
  useEffect(() => {
    if (playback.finished) setIsPlaying(false);
  }, [playback.finished]);

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

  // Slice everything to currentTime
  const cutoffMs = playback.currentTime.getTime();
  const equityShown = fullEquity.filter(
    (p) => new Date(p.rawT).getTime() <= cutoffMs
  );
  const tradesShown = fullTrades.filter(
    (t) => new Date(t.exit_time).getTime() <= cutoffMs
  );

  // Live-recomputed KPIs from sliced data
  const liveStats = computeStats(tradesShown, equityShown);

  async function handleRerun() {
    if (!dsl) return;
    setRerunning(true);
    setIsPlaying(false);
    try {
      const fresh = await runBacktest.mutateAsync({ dsl });
      sessionStorage.setItem("obsidia.lastBacktest", JSON.stringify(fresh));
      setResult(fresh);
      playback.restart();
      setIsPlaying(true);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setRerunning(false);
    }
  }

  async function handleSave() {
    if (!dsl || !result) return;
    setSaving(true);
    try {
      const created = await create.mutateAsync(dsl);
      // Attach the backtest result to the new strategy so the detail page
      // has stats + an equity curve to render.
      await saveBacktest.mutateAsync({
        strategyId: created.id,
        dsl,
        result,
      });
      sessionStorage.removeItem("obsidia.lastBacktest");
      sessionStorage.removeItem("obsidia.lastBacktestDsl");
      router.push(`/app/strategies/${created.id}`);
    } finally {
      setSaving(false);
    }
  }

  const liveDate = playback.currentTime.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <PageHeader
        title="Backtest results"
        description="Replaying every fill against 24 months of OHLCV — real fees and slippage, no lookahead."
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/strategies/new">
                <ArrowLeft className="size-4" />
                Back to builder
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRerun}
              disabled={rerunning || !dsl}
            >
              <RefreshCw
                className={`size-4 ${rerunning ? "animate-spin" : ""}`}
              />
              {rerunning ? "Re-running…" : "Re-run"}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !dsl}>
              <Save className="size-4" />
              {saving ? "Saving…" : "Save strategy"}
            </Button>
          </>
        }
      />

      {/* Playback transport */}
      <div className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (playback.finished) {
              playback.restart();
              setIsPlaying(true);
              return;
            }
            setIsPlaying((p) => !p);
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {playback.finished ? (
            <RotateCcw className="size-4" />
          ) : isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>

        <div className="flex items-center gap-1 ml-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2.5 h-7 text-xs rounded-md border tabular transition-colors ${
                speed === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-elevated)]"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={playback.skipToEnd}
          disabled={playback.finished}
        >
          <FastForward className="size-3.5" />
          Skip
        </Button>

        {/* Progress bar */}
        <div className="flex-1 min-w-[200px] mx-2">
          <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-75"
              style={{ width: `${(playback.progress * 100).toFixed(2)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs tabular text-[var(--color-muted-foreground)]">
          <span className="text-foreground">{liveDate}</span>
          <span>·</span>
          <span>
            {tradesShown.length} / {fullTrades.length} trades
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total return"
          value={fmtPct(liveStats.totalPnlPct)}
          delta={{
            value: `${tradesShown.length} trades`,
            direction: liveStats.totalPnlPct >= 0 ? "up" : "down",
          }}
          hint="Net of fees + slippage"
        />
        <KPICard
          label="Max drawdown"
          value={`${liveStats.maxDrawdownPct.toFixed(2)}%`}
          hint="Worst peak-to-trough so far"
        />
        <KPICard
          label="Win rate"
          value={`${liveStats.winRate.toFixed(1)}%`}
          hint={`${liveStats.wins}W / ${liveStats.losses}L`}
        />
        <KPICard
          label="Sharpe"
          value={liveStats.sharpe.toFixed(2)}
          hint="Per-trade (annualized rough)"
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
                Starting capital ${STARTING_CAPITAL.toLocaleString()}
              </div>
            </div>
            <Badge variant={liveStats.totalPnlPct >= 0 ? "success" : "danger"}>
              {fmtPct(liveStats.totalPnlPct)}
            </Badge>
          </div>
          <EquityCurve
            data={equityShown}
            height={300}
            tone={liveStats.totalPnlPct >= 0 ? "green" : "red"}
          />
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div className="text-sm font-semibold tracking-tight mb-4">
            Detailed stats
          </div>
          <dl className="space-y-3 text-xs">
            {[
              ["Trades", tradesShown.length],
              ["Wins", liveStats.wins],
              ["Losses", liveStats.losses],
              ["Profit factor", liveStats.profitFactor.toFixed(2)],
              ["Avg win", fmtPct(liveStats.avgWinPct)],
              ["Avg loss", fmtPct(liveStats.avgLossPct)],
              ["Longest losing streak", liveStats.longestLosingStreak],
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
              Updates as the replay runs — newest at top.
            </div>
          </div>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Showing {Math.min(20, tradesShown.length)} of {fullTrades.length}
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
            {tradesShown
              .slice(-20)
              .reverse()
              .map((t, i) => (
                <TableRow
                  key={t.id}
                  className="animate-in fade-in slide-in-from-top-1 duration-300"
                >
                  <TableCell className="text-[var(--color-muted-foreground)]">
                    {tradesShown.length - i}
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
            {tradesShown.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-xs text-[var(--color-muted-foreground)] py-8"
                >
                  Waiting for first trade…
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

interface LiveStats {
  totalPnlPct: number;
  wins: number;
  losses: number;
  winRate: number;
  sharpe: number;
  maxDrawdownPct: number;
  profitFactor: number;
  avgWinPct: number;
  avgLossPct: number;
  longestLosingStreak: number;
}

function computeStats(
  trades: Trade[],
  equity: { equity: number }[]
): LiveStats {
  if (trades.length === 0) {
    return {
      totalPnlPct: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      sharpe: 0,
      maxDrawdownPct: 0,
      profitFactor: 0,
      avgWinPct: 0,
      avgLossPct: 0,
      longestLosingStreak: 0,
    };
  }

  const wins = trades.filter((t) => t.pnl_usd > 0);
  const losses = trades.filter((t) => t.pnl_usd <= 0);
  const winRate = (wins.length / trades.length) * 100;

  const last = equity.length ? equity[equity.length - 1].equity : 100;
  const totalPnlPct = last - 100;

  // Max drawdown over equity slice
  let peak = equity[0]?.equity ?? 100;
  let maxDd = 0;
  for (const p of equity) {
    if (p.equity > peak) peak = p.equity;
    const dd = peak > 0 ? ((peak - p.equity) / peak) * 100 : 0;
    if (dd > maxDd) maxDd = dd;
  }

  const grossWin = wins.reduce((acc, t) => acc + t.pnl_usd, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl_usd, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin;

  const avgWinPct =
    wins.length > 0 ? wins.reduce((a, t) => a + t.pnl_pct, 0) / wins.length : 0;
  const avgLossPct =
    losses.length > 0
      ? losses.reduce((a, t) => a + t.pnl_pct, 0) / losses.length
      : 0;

  // Longest losing streak
  let streak = 0;
  let longest = 0;
  for (const t of trades) {
    if (t.pnl_usd <= 0) {
      streak += 1;
      if (streak > longest) longest = streak;
    } else {
      streak = 0;
    }
  }

  // Sharpe: mean(pnl_pct) / stdev(pnl_pct) * sqrt(N) — quick approx
  const mean =
    trades.reduce((a, t) => a + t.pnl_pct, 0) / trades.length;
  const variance =
    trades.reduce((a, t) => a + (t.pnl_pct - mean) ** 2, 0) / trades.length;
  const std = Math.sqrt(variance);
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(trades.length) : 0;

  return {
    totalPnlPct,
    wins: wins.length,
    losses: losses.length,
    winRate,
    sharpe,
    maxDrawdownPct: maxDd,
    profitFactor,
    avgWinPct,
    avgLossPct,
    longestLosingStreak: longest,
  };
}
