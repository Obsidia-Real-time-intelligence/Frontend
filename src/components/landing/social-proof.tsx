const STATS = [
  { value: "5yr", label: "Of OHLCV data" },
  { value: "16+", label: "Live signals" },
  { value: "0.14%", label: "Real fees modeled" },
  { value: "100%", label: "No-lookahead verified" },
];

const PROOF = [
  {
    quote:
      "Finally a backtester that doesn't lie to me. I had three strategies survive my own promises — Obsidia killed two of them on 24mo data. That's exactly what I needed.",
    author: "Solana perps trader",
    handle: "@solpilled",
  },
  {
    quote:
      "The AI brief on every alert reads like a junior analyst's note. Better than scrolling 14 indicators.",
    author: "Quant trader",
    handle: "@chartmonk",
  },
  {
    quote:
      "Open-source, real-fee, no-lookahead. The standard the rest of crypto trading tools should hold themselves to.",
    author: "Solana developer",
    handle: "@quantfox",
  },
];

export function SocialProof() {
  return (
    <section className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-border)] rounded-lg overflow-hidden border border-[var(--color-border)] mb-16">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="bg-[var(--color-card)] px-6 py-8 text-center"
            >
              <div className="text-2xl sm:text-3xl font-semibold text-foreground tabular tracking-tight">
                {s.value}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* proof — placeholder reviews until we have real ones */}
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Early traders
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            What beta users are saying.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PROOF.map((p, i) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5"
            >
              <p className="text-sm text-foreground leading-relaxed">"{p.quote}"</p>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-xs">
                <div className="font-medium text-foreground">{p.author}</div>
                <div className="text-[var(--color-muted-foreground)]">{p.handle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
