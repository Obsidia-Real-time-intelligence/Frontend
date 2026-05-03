"use client";

import Link from "next/link";
import { use } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TVWidget } from "@/components/charts/tv-widget";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import { MOCK_ALERTS } from "@/lib/mock";

const SYMBOL_TO_TV: Record<string, string> = {
  "SOL/USDT": "BINANCE:SOLUSDT",
  "BTC/USDT": "BINANCE:BTCUSDT",
  "ETH/USDT": "BINANCE:ETHUSDT",
  "JUP/USDT": "BINANCE:JUPUSDT",
};

export default function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const alert = MOCK_ALERTS.find((a) => a.id === id) ?? MOCK_ALERTS[0];
  const isLong = alert.side === "long";
  const Arrow = isLong ? ArrowUpRight : ArrowDownRight;
  const tvSymbol = SYMBOL_TO_TV[alert.symbol] ?? "BINANCE:SOLUSDT";

  const rr =
    Math.abs(alert.suggested_tp - alert.suggested_entry) /
    Math.abs(alert.suggested_entry - alert.suggested_sl);

  return (
    <>
      <PageHeader
        title={`${alert.strategy_name} fired`}
        description={`${alert.symbol} · ${timeAgo(alert.fired_at)} · ${alert.side.toUpperCase()} setup`}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/alerts">
              <ArrowLeft className="size-4" />
              Back to alerts
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2 -mt-4 mb-4">
        <div
          className={`grid h-7 w-7 place-items-center rounded-md border ${
            isLong
              ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]"
              : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
          }`}
        >
          <Arrow className="size-3.5" strokeWidth={2.5} />
        </div>
        <Badge variant={isLong ? "success" : "danger"}>
          {alert.side.toUpperCase()}
        </Badge>
        <Badge
          variant={
            alert.ai_confidence >= 7
              ? "success"
              : alert.ai_confidence >= 5
                ? "primary"
                : "default"
          }
        >
          AI {alert.ai_confidence}/10
        </Badge>
        <span className="text-xs text-[var(--color-muted-foreground)] ml-2">
          R:R = {rr.toFixed(2)}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
        {/* Chart */}
        <div className="space-y-4">
          <TVWidget symbol={tvSymbol} interval="15" height={520} />

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-primary" />
              <div className="text-sm font-semibold tracking-tight">
                AI explanation
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {alert.ai_summary}
            </p>
          </div>
        </div>

        {/* Trade panel */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <div className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">
              Suggested trade
            </div>
            <div className="text-3xl font-semibold tabular tracking-tight">
              ${alert.suggested_entry.toFixed(2)}
            </div>

            <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
              <Param label="Direction" value={alert.side.toUpperCase()} mono />
              <Param
                label="Entry"
                value={`$${alert.suggested_entry.toFixed(2)}`}
                mono
              />
              <Param
                label="Stop loss"
                value={`$${alert.suggested_sl.toFixed(2)}`}
                color="text-[var(--color-danger)]"
                mono
              />
              <Param
                label="Take profit"
                value={`$${alert.suggested_tp.toFixed(2)}`}
                color="text-[var(--color-success)]"
                mono
              />
              <Param label="R:R" value={rr.toFixed(2)} mono />
              <Param
                label="Trigger price"
                value={`$${alert.price.toFixed(2)}`}
                mono
              />
              <Param label="Fired" value={timeAgo(alert.fired_at)} />
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--color-border)] space-y-2">
              <Button size="lg" className="w-full">
                Paper-trade this setup
              </Button>
              <Button size="lg" variant="secondary" className="w-full">
                Execute on Drift
              </Button>
              <CopyButton
                text={`${alert.side.toUpperCase()} ${alert.symbol} @ $${alert.suggested_entry.toFixed(2)} | SL $${alert.suggested_sl.toFixed(2)} | TP $${alert.suggested_tp.toFixed(2)}`}
              />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <div className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)] mb-3">
              Risk warning
            </div>
            <p className="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
              This is a strategy signal, not financial advice. Past
              performance does not guarantee future results. Always size
              positions based on your own risk tolerance.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Param({
  label,
  value,
  color,
  mono,
}: {
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--color-muted-foreground)]">{label}</span>
      <span
        className={`tabular ${mono ? "font-mono" : ""} ${color ?? "text-foreground"} font-medium`}
      >
        {value}
      </span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="w-full text-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy as text"}
    </Button>
  );
}
