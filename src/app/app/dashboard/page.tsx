"use client";

import Link from "next/link";
import { Plus, Sparkles, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { EquityCurve } from "@/components/charts/equity-curve";
import { TVAdvanced } from "@/components/charts/tv-advanced";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKpis, useAlerts, useStrategies } from "@/lib/api";
import { mockEquityCurve } from "@/lib/mock";
import { fmtPct, fmtUsd } from "@/lib/utils";

// Live SOL stats — would come from a real ticker API in production.
const SOL_LIVE = {
  price: 84.06,
  change_5m: -0.03,
  change_1h: -0.05,
  change_6h: 0.22,
  change_24h: -0.72,
  mc: "48.3B",
  fdv: "52.5B",
  liquidity: "707M",
  volume_24h: "14.1B",
  holders: "3.82M",
};

const SR = [
  { kind: "resistance" as const, price: 86.76, touches: 14 },
  { kind: "resistance" as const, price: 85.74, touches: 13 },
  { kind: "support" as const, price: 83.73, touches: 11 },
  { kind: "support" as const, price: 82.76, touches: 10 },
];

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useKpis();
  const { data: alerts = [] } = useAlerts(5);
  const { data: strategies = [] } = useStrategies();

  const k = kpis ?? {
    total_strategies: 0,
    active_alerts: 0,
    paper_pnl_usd: 0,
    paper_pnl_pct: 0,
  };

  const equity = mockEquityCurve(90, 8500);
  const isUp24h = SOL_LIVE.change_24h >= 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live SOL terminal. Your strategies, alerts, and AI brief — at a glance."
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link href="/app/marketplace">Browse marketplace</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/app/strategies/new">
                <Plus className="size-4" />
                New strategy
              </Link>
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Strategies live"
          value={kpisLoading ? "—" : String(k.total_strategies)}
          hint={`${strategies.filter((s) => s.status === "live").length} active · ${strategies.filter((s) => s.status === "paused").length} paused`}
        />
        <KPICard
          label="Active alerts (24h)"
          value={kpisLoading ? "—" : String(k.active_alerts)}
          hint="Across all strategies"
        />
        <KPICard
          label="Paper P&L (30d)"
          value={fmtUsd(k.paper_pnl_usd, true)}
          delta={{
            value: fmtPct(k.paper_pnl_pct),
            direction: k.paper_pnl_pct >= 0 ? "up" : "down",
          }}
          hint="Combined across saved strategies"
        />
      </div>

      {/* SOL terminal — chart + token info side-by-side */}
      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        {/* Symbol header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] flex-wrap">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold">
            SO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                SOL/USDT
              </span>
              <Badge variant="outline">Solana L1</Badge>
            </div>
          </div>
          <div className="flex items-baseline gap-2 ml-2 tabular">
            <span className="text-xl font-semibold">
              ${SOL_LIVE.price.toFixed(2)}
            </span>
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                isUp24h
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-danger)]"
              }`}
            >
              {isUp24h ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {fmtPct(SOL_LIVE.change_24h)} <span className="text-[var(--color-muted-foreground)] font-normal">24h</span>
            </span>
          </div>
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link href={`/app/markets/${encodeURIComponent("SOL/USDT")}`}>
              Open full view
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Chart + side panel */}
        <div className="grid grid-cols-12">
          <div className="col-span-12 lg:col-span-9 border-r border-[var(--color-border)]">
            <TVAdvanced symbol="BINANCE:SOLUSDT" interval="15" height={520} />
          </div>

          {/* Right info rail */}
          <aside className="col-span-12 lg:col-span-3 p-4 space-y-5 bg-[var(--color-surface)]">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Stat label="MC" value={`$${SOL_LIVE.mc}`} />
              <Stat label="FDV" value={`$${SOL_LIVE.fdv}`} />
              <Stat label="Liquidity" value={`$${SOL_LIVE.liquidity}`} />
              <Stat label="Holders" value={SOL_LIVE.holders} />
              <Stat
                label="24h Vol"
                value={`$${SOL_LIVE.volume_24h}`}
                className="col-span-2"
              />
            </div>

            {/* Change blocks */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">
                Change
              </div>
              <div className="grid grid-cols-4 gap-1">
                <ChangeBlock label="5m" value={SOL_LIVE.change_5m} />
                <ChangeBlock label="1h" value={SOL_LIVE.change_1h} />
                <ChangeBlock label="6h" value={SOL_LIVE.change_6h} />
                <ChangeBlock label="24h" value={SOL_LIVE.change_24h} />
              </div>
            </div>

            {/* S/R */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  S/R levels (15m)
                </span>
                <Badge variant="outline">{SR.length}</Badge>
              </div>
              <ul className="space-y-1">
                {SR.map((l, i) => (
                  <li
                    key={i}
                    className={`flex items-center justify-between text-xs px-2 py-1 rounded-md ${
                      l.kind === "resistance"
                        ? "bg-[var(--color-danger)]/5"
                        : "bg-[var(--color-success)]/5"
                    }`}
                  >
                    <span
                      className={`tabular font-medium ${
                        l.kind === "resistance"
                          ? "text-[var(--color-danger)]"
                          : "text-[var(--color-success)]"
                      }`}
                    >
                      ${l.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                      {l.kind[0].toUpperCase()} ×{l.touches}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI brief */}
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-semibold">
                  AI brief
                </div>
                <Badge className="ml-auto" variant="primary">
                  6/10
                </Badge>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed">
                Compression between $82.76 support and $86.76 resistance. RSI
                mid-range. 4H trend remains bullish despite 24h pullback. No
                conviction setups firing yet.
              </p>
              <Link
                href="/app/alerts"
                className="mt-3 text-[10px] text-primary hover:underline inline-flex items-center gap-1"
              >
                See active conditions <ArrowRight className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Strategy performance + AI morning brief */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] lg:col-span-2 overflow-hidden">
          <div className="flex items-start justify-between p-5 pb-3">
            <div>
              <div className="text-sm font-semibold tracking-tight">
                Strategy performance
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)]">
                Combined paper equity · last 90 days
              </div>
            </div>
            <Badge variant="success">+14.7% all-time</Badge>
          </div>
          <EquityCurve data={equity} height={260} tone="brand" />
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex flex-col">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <div className="text-sm font-semibold tracking-tight">
              AI morning brief
            </div>
            <Badge className="ml-auto" variant="primary">
              6/10
            </Badge>
          </div>
          <p className="mt-4 text-sm text-foreground leading-relaxed">
            SOL is consolidating between $82.42 support and $86.72 resistance.
            Volume profile flat. Funding rates neutral. No high-conviction
            setups firing — your <span className="text-primary">SOL Bounce</span>{" "}
            strategy is closest to triggering.
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4 text-xs">
            <MarketStat label="BTC" value="$78,313" delta="+2.4%" up />
            <MarketStat label="SOL" value="$84.06" delta="+0.8%" up />
            <MarketStat label="ETH" value="$3,941" delta="-0.3%" />
            <MarketStat label="Funding (SOL)" value="0.012%" delta="neutral" />
          </div>
          <Link
            href="/app/alerts"
            className="mt-auto pt-4 text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            See active conditions <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="mt-6">
        <RecentAlerts alerts={alerts} />
      </div>

      {/* Your strategies */}
      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Your strategies
            </div>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Click to view details, edit, or pause.
            </div>
          </div>
          <Link
            href="/app/strategies"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Manage all <ArrowRight className="size-3" />
          </Link>
        </div>
        {strategies.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No strategies yet — your dashboard will populate as you save strategies.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/app/strategies/new">
                <Plus className="size-4" />
                Create your first strategy
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {strategies.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/app/strategies/${s.id}`}
                  className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-[var(--color-elevated)]/50 transition-colors"
                >
                  <div className="col-span-5 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {s.name}
                    </div>
                    <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                      {s.symbol} · {s.timeframe}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
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
                  </div>
                  <div className="col-span-2 text-right tabular text-xs">
                    <div
                      className={
                        (s.return_pct ?? 0) >= 0
                          ? "text-[var(--color-success)] font-medium"
                          : "text-[var(--color-danger)] font-medium"
                      }
                    >
                      {fmtPct(s.return_pct ?? 0)}
                    </div>
                    <div className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                      return
                    </div>
                  </div>
                  <div className="col-span-2 text-right tabular text-xs">
                    <div className="text-foreground font-medium">
                      {(s.win_rate ?? 0).toFixed(1)}%
                    </div>
                    <div className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                      win rate
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <ArrowRight className="size-3.5 text-[var(--color-muted-foreground)] inline-block" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div className="tabular font-semibold text-foreground mt-0.5">
        {value}
      </div>
    </div>
  );
}

function MarketStat({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  up?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div className="tabular text-foreground font-medium">{value}</div>
      <div
        className={
          up
            ? "text-[var(--color-success)] tabular text-[10px]"
            : "text-[var(--color-muted-foreground)] tabular text-[10px]"
        }
      >
        {delta}
      </div>
    </div>
  );
}

function ChangeBlock({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;
  return (
    <div
      className={`rounded-md border px-1.5 py-1.5 text-center ${
        positive
          ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
          : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div
        className={`tabular text-[11px] font-medium mt-0.5 ${
          positive
            ? "text-[var(--color-success)]"
            : "text-[var(--color-danger)]"
        }`}
      >
        {fmtPct(value)}
      </div>
    </div>
  );
}
