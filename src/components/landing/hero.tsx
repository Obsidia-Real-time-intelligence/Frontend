import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/auth/google-button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      {/* subtle grid background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="flex flex-col items-start gap-6 max-w-3xl">
          <Badge variant="primary" className="text-[10px]">
            <span className="size-1.5 rounded-full bg-primary inline-block" />
            Now in private beta
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.05]">
            The honest backtester
            <br />
            for Solana traders.
          </h1>

          <p className="text-base sm:text-lg text-[var(--color-muted-foreground)] max-w-xl leading-relaxed">
            Bring your strategy. We test it on 5 years of real-fee data, alert
            you when it fires live, and explain what's happening across 16+
            signals — so you can stop guessing and start trading from data.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
            <Button asChild size="lg" className="sm:min-w-[180px]">
              <Link href="/waitlist">
                Join waitlist
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <div className="sm:min-w-[220px]">
              <GoogleButton next="/app/dashboard" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-muted-foreground)] pt-4">
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-[var(--color-success)]" />
              5yr × 6 timeframes of OHLCV
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-[var(--color-success)]" />
              Real Jupiter / Drift fees baked in
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-[var(--color-success)]" />
              No-lookahead MTF
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-[var(--color-success)]" />
              Open source
            </span>
          </div>
        </div>

        {/* Hero terminal preview */}
        <div className="mt-16 sm:mt-20">
          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}

function HeroTerminal() {
  return (
    <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[var(--color-danger)]/70" />
          <span className="size-2.5 rounded-full bg-[var(--color-warning)]/70" />
          <span className="size-2.5 rounded-full bg-[var(--color-success)]/70" />
        </div>
        <div className="text-[11px] tabular text-[var(--color-muted-foreground)]">
          obsidia.fi / dashboard / SOL-USDT
        </div>
        <div />
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-[var(--color-border)]">
        <KpiBlock label="Strategies live" value="7" delta={null} />
        <KpiBlock label="Paper PnL (30d)" value="+$1,247" delta="+14.7%" positive />
        <KpiBlock label="Win rate (avg)" value="58.4%" delta="+2.1pp" positive />
      </div>

      <div className="p-5 md:p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
            SOL/USDT — 15m
          </div>
          <SparkChart />
        </div>
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            AI brief · 6/10
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            SOL at $84.06. Last 15m bar dropped 2.4% on elevated volume. RSI 32,
            oversold. 4H trend remains bullish.{" "}
            <span className="text-[var(--color-success)]">
              Bounce setup forming
            </span>{" "}
            — historical pattern resolves up 61% within 1h.
          </p>
          <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
            <Row label="Entry" value="$84.06" />
            <Row label="Stop" value="$80.33" mono color="text-[var(--color-danger)]" />
            <Row label="Target" value="$86.50" mono color="text-[var(--color-success)]" />
            <Row label="R:R" value="2.6" mono />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiBlock({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string | null;
  positive?: boolean;
}) {
  return (
    <div className="bg-[var(--color-card)] p-4">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2 tabular">
        <span className="text-xl font-semibold text-foreground">{value}</span>
        {delta && (
          <span
            className={
              positive
                ? "text-xs text-[var(--color-success)]"
                : "text-xs text-[var(--color-danger)]"
            }
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--color-muted-foreground)]">{label}</span>
      <span className={`tabular ${mono ? "font-mono" : ""} ${color ?? "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function SparkChart() {
  // Generate a stable, decorative SVG "candle-ish" sparkline.
  const points = [
    72, 73, 71, 74, 76, 75, 78, 79, 77, 80, 82, 81, 83, 85, 86, 84, 83, 80, 78,
    81, 83, 84, 85, 84,
  ];
  const w = 600;
  const h = 140;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const x = (i: number) => (i / (points.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g)" />
      <path d={path} stroke="#A855F7" strokeWidth="1.5" fill="none" />
      {points.map((v, i) =>
        i % 4 === 0 ? (
          <circle key={i} cx={x(i)} cy={y(v)} r="2" fill="#A855F7" />
        ) : null
      )}
    </svg>
  );
}
