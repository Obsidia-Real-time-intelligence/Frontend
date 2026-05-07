"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Sparkles,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TVAdvanced } from "@/components/charts/tv-advanced";
import { fmtPct, timeAgo } from "@/lib/utils";
import { useLivePrice, type Tick } from "@/lib/live-prices";
import { useAlerts, type SrZone } from "@/lib/api";
import { useLiveSr } from "@/lib/use-live-sr";
import { SrList } from "@/components/dashboard/sr-list";
import type { Alert } from "@/lib/types";

const SYMBOL_TO_TV: Record<string, string> = {
  "SOL/USDT": "BINANCE:SOLUSDT",
  "BTC/USDT": "BINANCE:BTCUSDT",
  "ETH/USDT": "BINANCE:ETHUSDT",
  "JUP/USDT": "BINANCE:JUPUSDT",
  "PYTH/USDT": "BINANCE:PYTHUSDT",
};

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = use(params);
  const symbol = decodeURIComponent(rawSymbol);
  const tvSymbol = SYMBOL_TO_TV[symbol] ?? "BINANCE:SOLUSDT";

  const tick = useLivePrice(symbol);
  const { data: srZones = [] } = useLiveSr(symbol, "15m");
  const { data: allAlerts = [] } = useAlerts(100);
  const symbolAlerts = allAlerts.filter((a) => a.symbol === symbol);

  return (
    <div className="-mx-4 md:-mx-6 -my-6">
      <SymbolHeader symbol={symbol} tick={tick} />

      <div className="grid grid-cols-12 gap-px bg-[var(--color-border)] border-y border-[var(--color-border)]">
        {/* LEFT — token stats rail */}
        <aside className="col-span-12 lg:col-span-3 bg-[var(--color-background)]">
          <LeftRail tick={tick} srZones={srZones} />
        </aside>

        {/* CENTER — chart */}
        <section className="col-span-12 lg:col-span-6 bg-[var(--color-background)]">
          <div className="h-full flex flex-col">
            <TVAdvanced symbol={tvSymbol} interval="15" height={620} />
            <BottomTabs symbol={symbol} symbolAlerts={symbolAlerts} />
          </div>
        </section>

        {/* RIGHT — trade panel */}
        <aside className="col-span-12 lg:col-span-3 bg-[var(--color-background)]">
          <TradePanel symbol={symbol} price={tick?.price ?? 0} />
        </aside>
      </div>
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────

function SymbolHeader({ symbol, tick }: { symbol: string; tick: Tick | null }) {
  const ticker = symbol.split("/")[0];
  const positive = tick ? tick.change_24h_pct >= 0 : false;
  return (
    <div className="px-5 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center gap-4 flex-wrap">
      <Link
        href="/app/markets"
        className="text-[var(--color-muted-foreground)] hover:text-foreground inline-flex items-center gap-1 text-xs"
      >
        <ArrowLeft className="size-3.5" />
      </Link>
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary border border-primary/30 font-bold">
        {ticker.slice(0, 2)}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">{symbol}</span>
          {tick && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider">
              <span className="size-1 rounded-full bg-[var(--color-success)] animate-pulse" />
              live
            </span>
          )}
        </div>
        <div className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
          Coinbase ticker
        </div>
      </div>

      <div className="flex items-baseline gap-2 ml-2 tabular">
        <span className="text-2xl font-semibold">
          {tick ? `$${tick.price.toFixed(2)}` : "—"}
        </span>
        {tick && (
          <span
            className={`text-sm font-medium ${
              positive ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
            }`}
          >
            {fmtPct(tick.change_24h_pct)}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative max-w-xs hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-subtle-foreground)]" />
          <Input
            type="text"
            placeholder="Search symbol…"
            className="pl-8 h-8 w-48 text-xs"
          />
        </div>
        <Button variant="ghost" size="icon" aria-label="Watchlist">
          <Star className="size-4" />
        </Button>
        <Button variant="secondary" size="sm">
          <Bell className="size-4" />
          Set alert
        </Button>
        <Button size="sm" asChild>
          <Link href="/app/strategies/new">
            <Plus className="size-4" />
            Backtest
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ── Left rail ──────────────────────────────────────────────────────

function LeftRail({
  tick,
  srZones,
}: {
  tick: Tick | null;
  srZones: SrZone[];
}) {
  return (
    <div className="p-5 space-y-5">
      {/* Live stats from Coinbase ticker */}
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="24h High"
          value={tick ? `$${tick.high_24h.toFixed(2)}` : "—"}
        />
        <Stat
          label="24h Low"
          value={tick ? `$${tick.low_24h.toFixed(2)}` : "—"}
        />
        <Stat
          label="24h Open"
          value={tick ? `$${tick.open_24h.toFixed(2)}` : "—"}
        />
        <Stat
          label="24h Range"
          value={
            tick ? `$${(tick.high_24h - tick.low_24h).toFixed(2)}` : "—"
          }
        />
        <Stat
          label="24h Volume (base)"
          value={tick ? `${(tick.volume_24h / 1000).toFixed(1)}k` : "—"}
          className="col-span-2"
        />
      </div>

      {/* 24h change vs open / low / high */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
          24h Change
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <ChangeBlock label="vs Open" value={tick?.change_24h_pct ?? 0} />
          <ChangeBlock
            label="vs Low"
            value={
              tick && tick.low_24h > 0
                ? ((tick.price - tick.low_24h) / tick.low_24h) * 100
                : 0
            }
          />
          <ChangeBlock
            label="vs High"
            value={
              tick && tick.high_24h > 0
                ? ((tick.price - tick.high_24h) / tick.high_24h) * 100
                : 0
            }
          />
        </div>
      </div>

      {/* S/R from sr_zones table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            S/R levels (15m)
          </div>
          <Badge variant="outline">{srZones.length}</Badge>
        </div>
        {srZones.length === 0 ? (
          <p className="text-[11px] text-[var(--color-muted-foreground)] py-2">
            Computing — refreshes hourly via worker.
          </p>
        ) : (
          <SrList
            zones={srZones}
            currentPrice={tick?.price}
            maxRows={8}
            size="md"
          />
        )}
      </div>

      {/* AI summary card */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-3.5 text-primary" />
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-semibold">
            AI brief
          </div>
          <Badge className="ml-auto" variant="primary">
            6/10
          </Badge>
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          Compression between $82.76 support and $86.76 resistance. RSI
          mid-range. 4H trend remains bullish despite 24h pullback.{" "}
          <span className="text-primary">SOL Bounce</span> strategy closest to
          firing — needs another -0.5% drop.
        </p>
      </div>
    </div>
  );
}

// ── Right rail (trade) ─────────────────────────────────────────────

function TradePanel({ symbol, price }: { symbol: string; price: number }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const numericAmount = Number(amount) || 0;
  const total = numericAmount * price;

  return (
    <div className="p-5 space-y-4">
      <Tabs defaultValue="market">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
          <TabsTrigger value="paper">Paper</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-3 mt-4">
          {/* Side toggle */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={`h-9 rounded-md text-xs font-medium border transition-colors ${
                side === "buy"
                  ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={`h-9 rounded-md text-xs font-medium border transition-colors ${
                side === "sell"
                  ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
              }`}
            >
              Sell
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <span>{side === "buy" ? "Buy" : "Sell"}</span>
              <span>{symbol.split("/")[0]}</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg h-12 pr-16 tabular"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {symbol.split("/")[0]}
              </div>
            </div>
            <div className="text-[10px] text-[var(--color-muted-foreground)] tabular">
              ≈ $
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Quick % */}
          <div className="grid grid-cols-4 gap-1.5">
            {["25%", "50%", "75%", "Max"].map((p) => (
              <button
                key={p}
                type="button"
                className="h-7 rounded-md border border-[var(--color-border)] text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] hover:bg-[var(--color-card)] hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Routing badge */}
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 space-y-1.5 text-[11px]">
            <Row k="Route" v="Drift Protocol" />
            <Row k="Fee" v="0.10%" />
            <Row k="Slippage" v="0.05% max" />
            <Row k="Confidence" v="6/10" color="text-primary" />
          </div>

          <Button size="lg" className="w-full">
            Connect wallet
          </Button>
          <p className="text-[10px] text-center text-[var(--color-muted-foreground)]">
            Or paper-trade for free
          </p>
        </TabsContent>

        <TabsContent value="limit" className="mt-4">
          <div className="rounded-md border border-dashed border-[var(--color-border)] py-8 text-center">
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Limit orders coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="paper" className="mt-4 space-y-3">
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Paper balance
            </div>
            <div className="text-2xl font-semibold tabular">$8,500.00</div>
            <div className="text-[10px] text-[var(--color-muted-foreground)]">
              Open positions: 0 · Today's P&amp;L: +$24.30
            </div>
          </div>
          <Button size="lg" className="w-full">
            Paper-trade {side.toUpperCase()}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Bottom tabs ────────────────────────────────────────────────────

function BottomTabs({
  symbol,
  symbolAlerts,
}: {
  symbol: string;
  symbolAlerts: Alert[];
}) {
  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">
            Alerts on this symbol ({symbolAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="strategies">My strategies</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-3">
          {symbolAlerts.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)] py-6 text-center">
              No alerts yet for {symbol}.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
              {symbolAlerts.map((a) => {
                const isLong = a.side === "long";
                const Arrow = isLong ? ArrowUpRight : ArrowDownRight;
                return (
                  <li key={a.id}>
                    <Link
                      href={`/app/alerts/${a.id}`}
                      className="grid grid-cols-12 gap-3 items-center px-4 py-2.5 hover:bg-[var(--color-elevated)]/50"
                    >
                      <div className="col-span-1">
                        <div
                          className={`grid h-6 w-6 place-items-center rounded-md border ${
                            isLong
                              ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                              : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                          }`}
                        >
                          <Arrow className="size-3" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="col-span-3 text-xs font-medium truncate">
                        {a.strategy_name}
                      </div>
                      <div className="col-span-2 tabular text-xs">
                        ${a.price.toFixed(2)}
                      </div>
                      <div className="col-span-4 text-xs text-[var(--color-muted-foreground)] line-clamp-1">
                        {a.ai_summary}
                      </div>
                      <div className="col-span-1 text-right text-[10px] text-[var(--color-muted-foreground)]">
                        {timeAgo(a.fired_at)}
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
          )}
        </TabsContent>

        <TabsContent value="strategies" className="mt-3">
          <p className="text-xs text-[var(--color-muted-foreground)] py-6 text-center">
            2 of your strategies trade {symbol}.{" "}
            <Link href="/app/strategies" className="text-primary hover:underline">
              Manage
            </Link>
          </p>
        </TabsContent>

        <TabsContent value="positions" className="mt-3">
          <p className="text-xs text-[var(--color-muted-foreground)] py-6 text-center">
            No open positions on {symbol}.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

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
      <div className="tabular text-sm font-semibold text-foreground mt-0.5">
        {value}
      </div>
    </div>
  );
}

function ChangeBlock({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;
  return (
    <div
      className={`rounded-md border px-2 py-2 text-center ${
        positive
          ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
          : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div
        className={`tabular text-xs font-medium mt-0.5 ${
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
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-muted-foreground)]">{k}</span>
      <span className={`tabular ${color ?? "text-foreground"} font-medium`}>
        {v}
      </span>
    </div>
  );
}
