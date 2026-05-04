"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Play, Save, Sparkles, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Section, FormRow } from "@/components/strategy/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

export interface BuilderInitial {
  name?: string;
  description?: string;
  symbol?: string;
  timeframe?: Timeframe;
  side?: "long" | "short";
  entry?: Condition[];
  maxHold?: number;
  slPct?: string;
  tpPct?: string;
  sizingType?: "fixed_notional" | "fixed_pct" | "atr_risk";
  notional?: number;
  leverage?: number;
  venue?: StrategyDSL["fees"]["venue"];
  feeRate?: number;
  slippage?: number;
}

export interface SubmitPayload {
  name: string;
  description: string;
  dsl: StrategyDSL;
}

export interface StrategyBuilderFormProps {
  initial?: BuilderInitial;
  /** Heading and primary-action button label. */
  mode: "create" | "edit";
  /** Where Cancel goes. */
  cancelHref: string;
  /** Save handler. Returns when persistence is complete. */
  onSave: (payload: SubmitPayload) => Promise<void>;
  /** Backtest handler — receives the *current* DSL. Optional. */
  onBacktest?: (payload: SubmitPayload) => Promise<void>;
  isSaving?: boolean;
  isBacktesting?: boolean;
  /** Optional banner shown above the form (e.g. "system strategy"). */
  banner?: React.ReactNode;
}

export function StrategyBuilderForm({
  initial = {},
  mode,
  cancelHref,
  onSave,
  onBacktest,
  isSaving,
  isBacktesting,
  banner,
}: StrategyBuilderFormProps) {
  const [name, setName] = useState(initial.name ?? "Untitled strategy");
  const [description, setDescription] = useState(initial.description ?? "");
  const [symbol, setSymbol] = useState(initial.symbol ?? "SOL/USDT");
  const [timeframe, setTimeframe] = useState<Timeframe>(
    initial.timeframe ?? "15m"
  );
  const [side, setSide] = useState<"long" | "short">(initial.side ?? "long");
  const [entry, setEntry] = useState<Condition[]>(
    initial.entry ?? [{ type: "bar_return", operator: "<=", value: -0.02 }]
  );
  const [maxHold, setMaxHold] = useState(initial.maxHold ?? 4);
  const [slPct, setSlPct] = useState<string>(initial.slPct ?? "");
  const [tpPct, setTpPct] = useState<string>(initial.tpPct ?? "");
  const [sizingType, setSizingType] = useState<
    "fixed_notional" | "fixed_pct" | "atr_risk"
  >(initial.sizingType ?? "fixed_notional");
  const [notional, setNotional] = useState(initial.notional ?? 8500);
  const [leverage, setLeverage] = useState(initial.leverage ?? 1);
  const [venue, setVenue] = useState<StrategyDSL["fees"]["venue"]>(
    initial.venue ?? "jupiter_perps"
  );
  const [feeRate, setFeeRate] = useState(initial.feeRate ?? 0.07);
  const [slippage, setSlippage] = useState(initial.slippage ?? 0.05);

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

  function payload(): SubmitPayload {
    return { name, description, dsl: buildDsl() };
  }

  const headerTitle = mode === "edit" ? `Edit · ${name}` : name || "New strategy";
  const headerDesc =
    mode === "edit"
      ? `${symbol} · ${timeframe}`
      : "Compose entry conditions, risk, and execution. Run a backtest before saving live.";
  const cancelLabel = mode === "edit" ? "Cancel" : "Cancel";
  const saveLabel = mode === "edit" ? "Save changes" : "Save strategy";

  return (
    <>
      <PageHeader
        title={headerTitle}
        description={headerDesc}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href={cancelHref}>
                <ArrowLeft className="size-4" />
                {cancelLabel}
              </Link>
            </Button>
            {onBacktest && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onBacktest(payload())}
                disabled={isBacktesting}
              >
                <Play className="size-4" />
                {isBacktesting ? "Running…" : "Run backtest"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onSave(payload())}
              disabled={isSaving}
            >
              <Save className="size-4" />
              {isSaving ? "Saving…" : saveLabel}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {banner}

          <Section title="Basics" description="Symbol, timeframe, name.">
            <FormRow label="Strategy name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SOL Bounce after -2%"
              />
            </FormRow>
            <FormRow label="Description" hint="Shown to subscribers.">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this strategy does, in one paragraph."
                rows={3}
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
              <Tabs
                value={side}
                onValueChange={(v) => setSide(v as "long" | "short")}
              >
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
                      setEntry((prev) =>
                        prev.map((x, j) => (j === i ? c2 : x))
                      )
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
            <FormRow
              label="Leverage"
              hint="1x = spot. Higher = more risk + faster blow-up."
            >
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
        onValueChange={(v) =>
          onChange({ ...cond, type: v as Condition["type"] })
        }
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
        onValueChange={(v) =>
          onChange({ ...cond, operator: v as Condition["operator"] })
        }
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

/**
 * Parse an existing DSL into the form's initial state. Tolerates partial /
 * legacy DSLs (e.g. system strategies with only {kind, engine}) — falls back
 * to defaults for any missing field.
 */
export function dslToInitial(
  dsl: unknown,
  fallback?: { symbol?: string; timeframe?: Timeframe; name?: string; description?: string }
): BuilderInitial {
  const d = (dsl ?? {}) as Partial<StrategyDSL>;

  const slPct = d.exit?.stop_loss_pct;
  const tpPct = d.exit?.take_profit_pct;

  return {
    name: d.name ?? fallback?.name,
    description: fallback?.description,
    symbol: d.symbol ?? fallback?.symbol,
    timeframe: (d.timeframe ?? fallback?.timeframe) as Timeframe | undefined,
    side: d.entry?.side,
    entry: d.entry?.conditions,
    maxHold: d.exit?.max_hold_bars,
    slPct: slPct != null ? String(slPct * 100) : "",
    tpPct: tpPct != null ? String(tpPct * 100) : "",
    sizingType: d.sizing?.type,
    notional: d.sizing?.notional_usd,
    leverage: d.sizing?.leverage,
    venue: d.fees?.venue,
    feeRate: d.fees?.fee_per_fill_pct,
    slippage: d.fees?.slippage_pct,
  };
}
