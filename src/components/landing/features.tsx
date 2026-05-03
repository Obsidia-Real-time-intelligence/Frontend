import { LineChart, Bell, Sparkles, ShieldCheck, Layers, Code2 } from "lucide-react";

const FEATURES = [
  {
    icon: LineChart,
    title: "Honest backtesting",
    body:
      "5 years of OHLCV across 6 timeframes. Real Jupiter Perps fees (0.14% RT), realistic slippage, and a no-lookahead test suite that proves it. We publicly killed our own 84% WR strategy when it didn't survive.",
    accent: "text-[var(--color-success)]",
  },
  {
    icon: Bell,
    title: "Real-time alerts",
    body:
      "Save a strategy and we run it 24/7. The moment it fires, you get a Telegram, Discord, or email alert with the entry, stop, target, and R:R already calculated.",
    accent: "text-primary",
  },
  {
    icon: Sparkles,
    title: "AI co-pilot",
    body:
      "Every alert ships with a Claude-written brief that synthesizes 16+ signals into plain English. \"This setup is taking direction from 4H support at $82.75. Confluence is 7/10.\"",
    accent: "text-[var(--color-warning)]",
  },
  {
    icon: Layers,
    title: "Multi-timeframe alignment",
    body:
      "First-class HTF/LTF strategy support — pair a daily S/R level with a 1H entry trigger. The only retail backtester that models MTF without future-data leaks.",
  },
  {
    icon: ShieldCheck,
    title: "Solana-native execution",
    body:
      "Direct integration with Jupiter Perps and Drift. Paper-trade for free, then flip a switch to execute live with the same DSL.",
  },
  {
    icon: Code2,
    title: "Open by default",
    body:
      "Strategies you save are yours. Backtesting engine and execution layer are open source. No black boxes, no \"trust us bro\" win-rate claims.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="border-b border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            What you get
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Built for traders who want
            <br />
            data, not hopium.
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            Pine Script promised 84% win rates. None survive real fees. We built
            the infrastructure to find what actually works.
          </p>
        </div>

        <div className="mt-12 grid gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-3 rounded-lg overflow-hidden border border-[var(--color-border)]">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-[var(--color-card)] p-6 hover:bg-[var(--color-elevated)] transition-colors"
              >
                <Icon
                  className={`size-5 mb-4 ${f.accent ?? "text-foreground"}`}
                  strokeWidth={1.5}
                />
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
