"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { fmtPct } from "@/lib/utils";
import { useLivePrices } from "@/lib/live-prices";

const TRACKED_SYMBOLS = [
  "SOL/USDT",
  "BTC/USDT",
  "ETH/USDT",
  "JUP/USDT",
  "PYTH/USDT",
];

function formatPrice(price: number): string {
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatVolumeUsd(volBase: number, price: number): string {
  const usd = volBase * price;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(1)}M`;
  if (usd >= 1e3) return `$${(usd / 1e3).toFixed(1)}K`;
  return `$${usd.toFixed(0)}`;
}

export default function MarketsPage() {
  const ticks = useLivePrices(TRACKED_SYMBOLS);

  const markets = TRACKED_SYMBOLS.map((symbol) => {
    const t = ticks[symbol];
    return { symbol, tick: t };
  });

  return (
    <>
      <PageHeader
        title="Markets"
        description="All tracked symbols. Click a row to open chart, indicators, and live signals."
      />

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[var(--color-border)] text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-medium">
          <div className="col-span-3">Symbol</div>
          <div className="col-span-3 text-right">Price</div>
          <div className="col-span-2 text-right">24h Change</div>
          <div className="col-span-2 text-right">24h Range</div>
          <div className="col-span-2 text-right">24h Vol</div>
        </div>
        <ul className="divide-y divide-[var(--color-border)]">
          {markets.map(({ symbol, tick }) => {
            const isUp = tick ? tick.change_24h_pct >= 0 : false;
            return (
              <li key={symbol}>
                <Link
                  href={`/app/markets/${encodeURIComponent(symbol)}`}
                  className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-[var(--color-elevated)]/50 transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold">
                      {symbol.split("/")[0].slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{symbol}</div>
                      {tick && (
                        <div className="text-[10px] text-[var(--color-muted-foreground)] flex items-center gap-1">
                          <span className="size-1 rounded-full bg-[var(--color-success)] animate-pulse" />
                          live
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 text-right tabular text-sm font-medium">
                    {tick ? formatPrice(tick.price) : "—"}
                  </div>
                  <div
                    className={`col-span-2 text-right tabular text-sm font-medium flex items-center justify-end gap-1 ${
                      tick
                        ? isUp
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-danger)]"
                        : "text-[var(--color-muted-foreground)]"
                    }`}
                  >
                    {tick ? (
                      <>
                        {isUp ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        {fmtPct(tick.change_24h_pct)}
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                  <div className="col-span-2 text-right tabular text-xs text-[var(--color-muted-foreground)]">
                    {tick ? (
                      <>
                        <span className="text-[var(--color-success)]">
                          {formatPrice(tick.high_24h)}
                        </span>
                        <span> · </span>
                        <span className="text-[var(--color-danger)]">
                          {formatPrice(tick.low_24h)}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                  <div className="col-span-2 text-right tabular text-sm text-[var(--color-muted-foreground)]">
                    {tick ? formatVolumeUsd(tick.volume_24h, tick.price) : "—"}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
