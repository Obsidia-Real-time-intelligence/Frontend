"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Save, Sparkles, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Section, FormRow } from "@/components/strategy/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCreateStrategy, useRunBacktest } from "@/lib/api";
import type { Condition, StrategyDSL, Timeframe } from "@/lib/types";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1d"];
const SYMBOLS = ["SOL/USDT", "BTC/USDT", "ETH/USDT", "JUP/USDT", "PYTH/USDT"];
const VENUES = [
  { value: "jupiter_perps", label: "Jupiter Perps (0.14% RT)" },
  { value: "drift", label: "Drift Protocol (0.10% RT)" },
  { value: "hyperliquid", label: "Hyperliquid (0.09% RT)" },
  { value: "binance_spot", label: "Binance Spot (0.20% RT)" },
];
const CONDITION_TYPES: Condition["type"][] = [
  "bar_return",
  "cumul_return",
  "rsi",
  "bb_position",
  "ema_position",
  "volume_z",
  "sr_proximity",
  "divergence",
];

export default function StrategyBuilderPage() {
  const router = useRouter();
  const create = useCreateStrategy();
  const runBacktest = useRunBacktest();

  // Form state
  const [name, setName] = useState("Untitled strategy");
  const [symbol, setSymbol] = useState("SOL/USDT");
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");
  const [side, setSide] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState<Condition[]>([
    { type: "bar_return", operator: "<=", value: -0.02 },
  ]);
  const [maxHold, setMaxHold] = useState(4);
  const [slPct, setSlPct] = useState<string>("");
  const [tpPct, setTpPct] = useState<string>("");
  const [sizingType, setSizingType] = useState<"fixed_notional" | "fixed_pct" | "atr_risk">("fixed_notional");
  const [notional, setNotional] = useState(8500);
  const [leverage, setLeverage] = useState(1);
  const [venue, setVenue] = useState<StrategyDSL["fees"]["venue"]>("jupiter_perps");
  const [feeRate, setFeeRate] = useState(0.07);
  const [slippage, setSlippage] = useState(0.05);

  function buildDsl(): StrategyDSL {
    return {
      name,
      symbol,
      timeframe,
      entry: { side, conditions: entry },
      exit: {
        type: "time_or_target",
        max_hold_bars: maxHold,
        stop_loss_pct: slPct ? Number(slPct) / 100 : null,
        take_profit_pct: tpPct ? Number(tpPct) / 100 : null,
      },
      sizing: {
        type: sizingType,
        ...(sizingType === "fixed_notional" ? { notional_usd: notional } : {}),
        leverage,
      },
      fees: {
        venue,
        fee_per_fill_pct: feeRate,
        slippage_pct: slippage,
      },
    };
  }

  async function handleBacktest() {
    const dsl = buildDsl();
    try {
      const result = await runBacktest.mutateAsync({ dsl });
      // Stash result in sessionStorage so the results page can render it
      sessionStorage.setItem("obsidia.lastBacktest", JSON.stringify(result));
      sessionStorage.setItem("obsidia.lastBacktestDsl", JSON.stringify(dsl));
      router.push("/app/strategies/new/results");
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSave() {
    const dsl = buildDsl();
    try {
      const created = await create.mutateAsync(dsl);
      router.push(`/app/strategies/${created.id}`);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <PageHeader
        title={name || "New strategy"}
        description="Compose entry conditions, risk, and execution. Run a backtest before saving live."
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/strategies">
                <ArrowLeft className="size-4" />
                Cancel
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBacktest}
              disabled={runBacktest.isPending}
            >
              <Play className="size-4" />
              {runBacktest.isPending ? "Running…" : "Run backtest"}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={create.isPending}>
              <Save className="size-4" />
              Save strategy
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Section title="Basics" description="Symbol, timeframe, name.">
            <FormRow label="Strategy name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SOL Bounce after -2%"
              />
            </FormRow>
            <FormRow label="Symbol">
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYMBOLS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Timeframe">
              <div className="flex flex-wrap gap-1.5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 h-8 text-xs rounded-md border transition-colors ${
                      timeframe === tf
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-elevated)]"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </FormRow>
          </Section>

          <Section
            title="Entry conditions"
            description="Triggers that must all be true for the strategy to fire."
          >
            <FormRow label="Direction">
              <Tabs value={side} onValueChange={(v) => setSide(v as "long" | "short")}>
                <TabsList>
                  <TabsTrigger value="long">Long</TabsTrigger>
                  <TabsTrigger value="short">Short</TabsTrigger>
                </TabsList>
              </Tabs>
            </FormRow>

            <div>
              <Label className="mb-3 block">Conditions ({entry.length})</Label>
              <div className="space-y-2">
                {entry.map((c, i) => (
                  <ConditionRow
                    key={i}
                    cond={c}
                    onChange={(c2) =>
                      setEntry((prev) => prev.map((x, j) => (j === i ? c2 : x)))
                    }
                    onRemove={() =>
                      setEntry((prev) => prev.filter((_, j) => j !== i))
                    }
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEntry((prev) => [
                      ...prev,
                      { type: "rsi", operator: "<=", value: 30 },
                    ])
                  }
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--color-border)] bg-transparent px-3 text-xs text-[var(--color-muted-foreground)] hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="size-3.5" />
                  Add condition
                </button>
              </div>
            </div>
          </Section>

          <Section
            title="Exit conditions"
            description="When to close the position. Time exit always applies."
          >
            <FormRow label="Max hold (bars)" hint="Force-close after N bars.">
              <Input
                type="number"
                value={maxHold}
                onChange={(e) => setMaxHold(Number(e.target.value))}
                min={1}
              />
            </FormRow>
            <FormRow label="Stop loss %" hint="Optional. Leave blank for no stop.">
              <Input
                type="number"
                value={slPct}
                onChange={(e) => setSlPct(e.target.value)}
                placeholder="e.g. 1.5"
                step="0.1"
              />
            </FormRow>
            <FormRow label="Take profit %" hint="Optional.">
              <Input
                type="number"
                value={tpPct}
                onChange={(e) => setTpPct(e.target.value)}
                placeholder="e.g. 2.5"
                step="0.1"
              />
            </FormRow>
          </Section>

          <Section
            title="Risk &amp; sizing"
            description="Position size and leverage. Choose carefully."
          >
            <FormRow label="Sizing model">
              <Select
                value={sizingType}
                onValueChange={(v) => setSizingType(v as typeof sizingType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_notional">Fixed notional ($)</SelectItem>
                  <SelectItem value="fixed_pct">% of equity</SelectItem>
                  <SelectItem value="atr_risk">ATR risk-based</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Notional (USD)">
              <Input
                type="number"
                value={notional}
                onChange={(e) => setNotional(Number(e.target.value))}
              />
            </FormRow>
            <FormRow label="Leverage" hint="1x = spot. Higher = more risk + faster blow-up.">
              <Input
                type="number"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                min={1}
                max={10}
                step={0.5}
              />
            </FormRow>
          </Section>

          <Section title="Fees &amp; venue">
            <FormRow label="Venue">
              <Select
                value={venue}
                onValueChange={(v) => setVenue(v as typeof venue)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENUES.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Fee per fill (%)">
              <Input
                type="number"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value))}
                step="0.005"
              />
            </FormRow>
            <FormRow label="Slippage (%)">
              <Input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                step="0.005"
              />
            </FormRow>
          </Section>
        </div>

        {/* Sticky preview rail */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <div className="text-sm font-semibold tracking-tight">Preview</div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <KV k="Symbol" v={symbol} />
              <KV k="Timeframe" v={timeframe} />
              <KV k="Direction" v={side} />
              <KV k="Conditions" v={String(entry.length)} />
              <KV k="Hold" v={`≤ ${maxHold} bars`} />
              <KV k="SL" v={slPct ? `${slPct}%` : "none"} />
              <KV k="TP" v={tpPct ? `${tpPct}%` : "none"} />
              <KV k="Notional" v={`$${notional.toLocaleString()}`} />
              <KV k="Leverage" v={`${leverage}x`} />
              <KV k="Fee RT" v={`${(feeRate * 2).toFixed(2)}%`} />
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap gap-1.5">
              <Badge variant="primary">DSL valid</Badge>
              {leverage > 3 && <Badge variant="warning">High leverage</Badge>}
              {!slPct && leverage > 1 && (
                <Badge variant="danger">No stop + leverage</Badge>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function ConditionRow({
  cond,
  onChange,
  onRemove,
}: {
  cond: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
      <Select
        value={cond.type}
        onValueChange={(v) => onChange({ ...cond, type: v as Condition["type"] })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONDITION_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={cond.operator}
        onValueChange={(v) => onChange({ ...cond, operator: v as Condition["operator"] })}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[">", ">=", "==", "<=", "<"].map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        className="w-28"
        value={cond.value}
        onChange={(e) => onChange({ ...cond, value: Number(e.target.value) })}
        step="0.01"
      />
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
        <X className="size-4" />
      </Button>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-muted-foreground)]">{k}</span>
      <span className="tabular text-foreground font-medium">{v}</span>
    </div>
  );
}
