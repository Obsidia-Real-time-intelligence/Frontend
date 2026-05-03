"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { fmtPct } from "@/lib/utils";

const MARKETS = [
  {
    symbol: "SOL/USDT",
    price: 84.06,
    change_24h: 0.8,
    change_7d: -3.2,
    volume_24h: "1.4B",
    has_alert: true,
    alerts_24h: 3,
    sr_count: 8,
  },
  {
    symbol: "BTC/USDT",
    price: 78313,
    change_24h: 2.4,
    change_7d: 4.1,
    volume_24h: "12.8B",
    has_alert: false,
    alerts_24h: 0,
    sr_count: 6,
  },
  {
    symbol: "ETH/USDT",
    price: 3941,
    change_24h: -0.3,
    change_7d: 1.8,
    volume_24h: "5.6B",
    has_alert: false,
    alerts_24h: 1,
    sr_count: 7,
  },
  {
    symbol: "JUP/USDT",
    price: 0.179,
    change_24h: -1.1,
    change_7d: -8.4,
    volume_24h: "84M",
    has_alert: true,
    alerts_24h: 2,
    sr_count: 5,
  },
  {
    symbol: "PYTH/USDT",
    price: 0.412,
    change_24h: 1.4,
    change_7d: 6.2,
    volume_24h: "112M",
    has_alert: false,
    alerts_24h: 0,
    sr_count: 4,
  },
];

export default function MarketsPage() {
  return (
    <>
      <PageHeader
        title="Markets"
        description="All tracked symbols. Click a row to open chart, indicators, and live signals."
      />

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[var(--color-border)] text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-medium">
          <div className="col-span-3">Symbol</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h</div>
          <div className="col-span-2 text-right">7d</div>
          <div className="col-span-2 text-right">24h Vol</div>
          <div className="col-span-1 text-right">Alerts</div>
        </div>
        <ul className="divide-y divide-[var(--color-border)]">
          {MARKETS.map((m) => (
            <li key={m.symbol}>
              <Link
                href={`/app/markets/${encodeURIComponent(m.symbol)}`}
                className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-[var(--color-elevated)]/50 transition-colors"
              >
                <div className="col-span-3 flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold">
                    {m.symbol.split("/")[0].slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.symbol}</div>
                    {m.has_alert && (
                      <div className="text-[10px] text-primary uppercase tracking-wider">
                        Strategy active
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right tabular text-sm font-medium">
                  $
                  {m.price < 1
                    ? m.price.toFixed(4)
                    : m.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </div>
                <div
                  className={`col-span-2 text-right tabular text-sm font-medium flex items-center justify-end gap-1 ${
                    m.change_24h >= 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {m.change_24h >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {fmtPct(m.change_24h)}
                </div>
                <div
                  className={`col-span-2 text-right tabular text-sm ${
                    m.change_7d >= 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {fmtPct(m.change_7d)}
                </div>
                <div className="col-span-2 text-right tabular text-sm text-[var(--color-muted-foreground)]">
                  ${m.volume_24h}
                </div>
                <div className="col-span-1 text-right">
                  {m.alerts_24h > 0 ? (
                    <Badge variant="primary">{m.alerts_24h}</Badge>
                  ) : (
                    <span className="text-[var(--color-subtle-foreground)]">—</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
