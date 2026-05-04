"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users, TrendingUp, Lock, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { EquityCurve } from "@/components/charts/equity-curve";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtPct } from "@/lib/utils";
import { useMarketplaceStrategy, useLatestBacktest } from "@/lib/api";

export default function MarketplaceStrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: strategy, isLoading } = useMarketplaceStrategy(id);
  const { data: backtest } = useLatestBacktest(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
        <Loader2 className="size-4 animate-spin mr-2" />
        <span className="text-sm">Loading strategy…</span>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Strategy not found or no longer public.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/app/marketplace">
            <ArrowLeft className="size-4" /> Back to marketplace
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

  return (
    <>
      <PageHeader
        title={strategy.name}
        description={`${strategy.creator} · ${strategy.timeframe} · ${strategy.symbols.join(", ")}`}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/marketplace">
              <ArrowLeft className="size-4" />
              Back to marketplace
            </Link>
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPICard
              label="30-day return"
              value={fmtPct(strategy.return_pct_30d)}
              delta={{
                value: "vs SOL +1.2%",
                direction: strategy.return_pct_30d >= 0 ? "up" : "down",
              }}
            />
            <KPICard
              label="All-time return"
              value={fmtPct(strategy.return_pct_total)}
              hint="Net of fees"
            />
            <KPICard
              label="Risk score"
              value={`${strategy.risk_score}/10`}
              hint={
                strategy.risk_score >= 7
                  ? "High"
                  : strategy.risk_score >= 4
                    ? "Medium"
                    : "Low"
              }
            />
            <KPICard
              label="Subscribers"
              value={String(strategy.subscribers)}
              hint="Active followers"
            />
          </div>

          {/* Performance chart */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
            <div className="p-5 pb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  Performance
                </div>
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  Verified backtest · 24 months · real fees
                </div>
              </div>
              <Badge variant="primary">
                <ShieldCheck className="size-3" />
                Audited
              </Badge>
            </div>
            <EquityCurve data={equity} height={320} tone="green" />
          </div>

          {/* Description */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <div className="text-sm font-semibold tracking-tight mb-3">
              About this strategy
            </div>
            <div className="space-y-3 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              <p>{strategy.description}</p>
              <p>
                This strategy has been backtested on 24 months of OHLCV data
                with realistic Jupiter Perps fees and slippage. No look-ahead
                bias. Edge derives from systematic identification of liquidity
                imbalances on higher timeframes.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4 text-xs">
              <Spec label="Symbols" value={strategy.symbols.join(", ")} />
              <Spec label="Timeframe" value={strategy.timeframe} />
              <Spec label="Avg trades / week" value="2-4" />
              <Spec label="Avg hold" value="3-6 hours" />
              <Spec label="Sharpe" value="1.42" />
              <Spec label="Max drawdown" value="12.4%" />
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-start gap-2">
              <Lock className="size-3.5 text-[var(--color-muted-foreground)] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
                Strategy logic and exact parameters are kept private. You'll
                receive entry/exit alerts but not the underlying rules — this
                protects the creator's edge while you benefit from the signals.
              </p>
            </div>
          </div>
        </div>

        {/* Subscribe panel */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-xl border border-primary/30 bg-[var(--color-card)] p-6 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]">
            <div className="flex items-baseline gap-1.5 tabular">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                ${strategy.price_usd_monthly}
              </span>
              <span className="text-sm text-[var(--color-muted-foreground)]">
                / month
              </span>
            </div>

            <Button size="lg" className="mt-5 w-full">
              Subscribe to strategy
            </Button>

            <p className="mt-3 text-[11px] text-[var(--color-muted-foreground)] text-center">
              Cancel any time. First 7 days free.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                Real-time alerts via Telegram, Discord, email
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                Suggested entry, stop, target on every alert
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                Paper-trade ledger for performance tracking
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                One-click execute via Drift / Jupiter (Trader plan)
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="size-3.5 text-primary" />
              <div className="text-xs font-semibold tracking-tight uppercase text-[var(--color-muted-foreground)]">
                Creator
              </div>
            </div>
            <div className="text-sm font-medium">{strategy.creator}</div>
            <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              4 strategies · 1.2k followers
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
              <span className="text-[var(--color-muted-foreground)]">
                Avg performance
              </span>
              <span className="text-[var(--color-success)] font-medium tabular flex items-center gap-1">
                <TrendingUp className="size-3" />
                +24.8%
              </span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div className="text-foreground font-medium">{value}</div>
    </div>
  );
}
