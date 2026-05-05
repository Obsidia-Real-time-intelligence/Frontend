import type { Metadata } from "next";
import { MarketingNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "About — Obsidia",
  description:
    "Obsidia is the honest strategy marketplace for Solana traders. Backtest with real fees, publish audited strategies, and execute with live alerts.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:py-28">
          <div className="mono-tag">→ About Obsidia</div>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.04]">
            The <Italic>honest</Italic> strategy
            <br />
            marketplace for Solana traders.
          </h1>
          <p className="mt-8 text-lg text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
            Obsidia lets traders compose strategies with a no-code DSL,
            backtest them on real-fee OHLCV with no lookahead, and publish
            them to a marketplace where every alert and fill is auditable
            — explained by an AI co-pilot that shows its work.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[var(--color-border)] pt-6">
            <Meta label="Stage" value="Public beta" />
            <Meta label="First market" value="Solana retail" />
            <Meta label="Founder" value="Lopinti Abhijeeth Baba" />
            <Meta label="Track" value="DeFi infra · Trader tooling" />
          </div>
        </div>
      </section>

      {/* ── 02 Problem ───────────────────────────────────────────────── */}
      <Section num="02" name="The problem">
        <SectionHeader
          eyebrow="The problem"
          title={
            <>
              The same overfit backtest, recycled across
              <br />
              every Solana trading channel.
            </>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ProblemCell head="TradingView" body="Strategies tested on closing prices, no fees, no slippage." />
          <ProblemCell head="Telegram alpha" body="Bots delete losing calls. No proof of past performance." tinted />
          <ProblemCell head="Crypto X" body="Top traders ranked by retweets, not P&L." tinted />
          <ProblemCell head="Discord groups" body="Cherry-picked screenshots. No ledger." tinted />
          <ProblemCell head="Drift / Jupiter" body="No native way to track or verify a strategy's edge over time." tinted />
          <ProblemCell head="Onboarding" body="Each new tool re-asks for keys, channels, and trades." tinted />
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-[var(--color-border)] pt-10">
          <Stat
            num="6+"
            text="Disconnected tools every retail Solana trader stitches together — most asking for the same data."
          />
          <Stat
            num="0"
            text="Audited proof-of-edge between alpha groups. Every claim is a screenshot."
          />
          <Stat
            num="1"
            text="Retail trader holding the bag when the &quot;200% backtest&quot; goes -8% in production."
          />
        </div>
      </Section>

      {/* ── 03 Why it's a trust problem ─────────────────────────────── */}
      <Section num="03" name="Why it's a trust problem" alt>
        <SectionHeader
          eyebrow="Why this is a trust problem, not a UX problem"
          title={<>Public alpha, <Italic>private numbers</Italic>.</>}
        />
        <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-12">
          <div>
            <Point
              n="01"
              head="Backtests fudge fees and slippage"
              body="Most strategies look great on paper because the math skips fills. Add real Jupiter Perps fees and slippage and the edge often disappears."
            />
            <Point
              n="02"
              head="No proof of past calls"
              body="Telegram bots, Discord channels, X traders — all delete or omit losing calls. No one keeps an honest ledger."
            />
            <Point
              n="03"
              head="Ranking by attention, not performance"
              body={`"Top trader" usually means most retweets. There is no neutral leaderboard backed by audited fills.`}
            />
            <Point
              n="04"
              head="Retail absorbs the risk"
              body="The trader copying the call eats the fees, slippage, and downside. The publisher gets the upside in followers either way."
            />
          </div>
          <aside className="rounded-lg bg-[var(--color-elevated)] border border-[var(--color-border)] p-7 self-start">
            <p className="font-serif italic text-xl leading-relaxed text-foreground">
              I built a bot that returned 200% in a backtest. In production
              it lost 8% in two weeks.{" "}
              <span className="text-primary">
                The math wasn't wrong — the assumptions were.
              </span>{" "}
              That is the gap Obsidia is built to close.
            </p>
            <div className="mt-6 mono-tag">— Lopinti Abhijeeth Baba · Founder</div>
          </aside>
        </div>
      </Section>

      {/* ── 04 Solution ─────────────────────────────────────────────── */}
      <Section num="04" name="Solution">
        <SectionHeader
          eyebrow="Solution"
          title={
            <>
              One DSL. One audited backtester.
              <br />
              <Italic>One alert pipeline that shows its work.</Italic>
            </>
          }
        />
        <div className="grid md:grid-cols-3 gap-4">
          <Pillar
            kicker="Honest backtester"
            title="Real fees, no lookahead"
            body="24 months of OHLCV at six timeframes, with Jupiter Perps and Drift fees baked in. Trade ledgers, equity curves, and drawdown — auditable down to the bar."
          />
          <Pillar
            kicker="DSL marketplace"
            title="Composable strategies"
            body="A no-code DSL describes entry, exit, sizing, and fees. Authors publish; subscribers pay monthly for live signals — performance ranked by audited fills, not screenshots."
          />
          <Pillar
            kicker="AI co-pilot"
            title="Every signal, explained"
            body="Each alert lands on Telegram, Discord, and email with a plain-English rationale: which signals fired, the multi-timeframe context, the historical pattern resolution."
          />
        </div>
      </Section>

      {/* ── 05 How it works ─────────────────────────────────────────── */}
      <Section num="05" name="How it works" alt>
        <SectionHeader
          eyebrow="How it works"
          title={
            <>
              Compose. Backtest. Publish. Execute.
              <br />
              With proof at every step.
            </>
          }
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Step
            n="01 / Compose"
            title="No-code DSL builder"
            body="Stack entry conditions (RSI, BB-position, MTF alignment), choose exit type, sizing, leverage, venue. Save as a portable JSON spec."
            footer="Input · entry · exit · sizing · fees"
          />
          <Step
            n="02 / Backtest"
            title="Real fees, no lookahead"
            body="Run against 24 months of OHLCV with Jupiter / Drift fees and slippage. Inspect every fill, equity curve, and drawdown."
            footer="Output · trade ledger · equity · stats"
          />
          <Step
            n="03 / Publish"
            title="Marketplace listing"
            body="Optionally publish to the marketplace. Audited backtest, fee model, and live-trade history visible to every subscriber."
            footer="Pricing · monthly subscription"
          />
          <Step
            n="04 / Execute"
            title="Alerts → one-click trade"
            body="Live alerts on Telegram, Discord, email — each with AI rationale. Paper-trade or one-click execute on Drift / Jupiter Perps."
            footer="Output · live alerts · executed fills"
          />
        </div>
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/[0.05] px-6 py-5 grid sm:grid-cols-[180px_1fr] gap-6 items-center">
          <div className="mono-tag text-primary">
            Compounding
            <br />
            effect
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            Every published strategy expands the canonical OHLCV + fee
            corpus. Every fill teaches the backtester. Every subscriber
            tightens the ranking — the marketplace gets harder to clone
            with every active week.
          </p>
        </div>
      </Section>

      {/* ── 06 Deep-tech core ───────────────────────────────────────── */}
      <Section num="06" name="Architecture">
        <SectionHeader
          eyebrow="The deep-tech core"
          title={
            <>
              An umbrella DSL engine,
              <br />
              with vertical strategy agents that own their domain.
            </>
          }
        />
        <div className="rounded-lg bg-[var(--color-elevated)] border border-[var(--color-border)] px-6 py-5 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="mono-tag text-primary">Layer 0 · Umbrella</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              DSL Backtester + Orchestrator
            </div>
          </div>
          <div className="text-sm text-[var(--color-muted-foreground)] sm:text-right max-w-xl leading-relaxed">
            Owns the full pipeline — DSL parsing, OHLCV ingestion, no-lookahead
            simulation, fee + slippage application, persistence to Supabase,
            alert fan-out across channels.
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Agent id="A.01" name="Confluence" body="Multi-signal scoring (RSI, MACD, MTF, sweeps, fear/greed)." />
          <Agent id="A.02" name="Mean Reversion" body="BB-band fades on Jupiter Perps with structured exits." />
          <Agent id="A.03" name="Realtime Spike" body="Tick-level scalp on sharp moves with stop and target rails." />
          <Agent id="A.04" name="AI Analyst" body="Order-flow + macro synthesis into a directional call with rationale." />
          <Agent id="A.05" name="Risk Sizing" body="Notional, % equity, ATR-risk; leverage bounded per plan." />
          <Agent id="A.06" name="Alert Router" body="Telegram + Discord + email fan-out with AI-generated rationale." />
          <Agent id="A.07" name="Strategy Auditor" body="Independent re-runs of subscribed strategies on stored OHLCV." />
          <Agent id="A.08" name="Memory" body="Per-user trade ledger, win/loss patterns, plan limits." />
        </div>
      </Section>

      {/* ── 07 Beachhead ────────────────────────────────────────────── */}
      <Section num="07" name="Wedge" alt>
        <SectionHeader
          eyebrow="Beachhead"
          title={
            <>
              Solana retail traders on Drift + Jupiter.
              <br />
              <Italic>One chain, deeply.</Italic>
            </>
          }
        />
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h4 className="text-base font-semibold mb-5">Why Solana first</h4>
            <ul className="space-y-4">
              {[
                "The most liquid retail-perps surface in DeFi today, with strong native UX (Phantom, Jupiter, Drift).",
                "Real fee + slippage data is reachable through public RPC and exchange WebSockets — no proprietary feed required.",
                "Stablecoin rails (USDC, USDG) and SPL primitives are mature enough to support marketplace payouts.",
                "Aligned with Solana Foundation's grant priorities — DeFi infra and trader tooling for the long-tail user.",
              ].map((line, i) => (
                <li key={i} className="text-sm leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-0 text-primary">—</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] p-7">
            <div className="mono-tag mb-5">Initial wedge specification</div>
            <SpecRow k="Geography" v={<><Italic>Solana</Italic>, then Solana-adjacent EVM (Base, Arbitrum) via the same DSL</>} />
            <SpecRow k="User" v="Retail / prosumer traders, $1k–$50k account size" />
            <SpecRow k="Venues" v="Drift Protocol · Jupiter Perps · Hyperliquid (planned)" />
            <SpecRow k="Buyer" v="Subscribers paying monthly per strategy; creators paid per subscriber" />
            <SpecRow k="Pricing" v="Free · Pro $19 · Trader $49 · Quant $99/mo + creator payouts" last />
          </div>
        </div>
      </Section>

      {/* ── 08 Defensibility ────────────────────────────────────────── */}
      <Section num="08" name="Moat">
        <SectionHeader
          eyebrow="Defensibility"
          title={
            <>
              A frontend is easy to copy.
              <br />
              The execution layer underneath is not.
            </>
          }
        />
        <div className="space-y-3">
          <Moat id="M.01" name="Real-fee OHLCV corpus" body="24 months × 6 timeframes × N venues, with fee + slippage models per venue — sharpens with every new strategy a creator publishes." />
          <Moat id="M.02" name="Composable DSL graph" body="Strategies are JSON specs. Reusable, forkable, comparable side-by-side — operational know-how as code, not a black box." />
          <Moat id="M.03" name="Audited backtest engine" body="Independent re-runs on stored OHLCV produce reproducible numbers. Creator can't quietly fudge results between subscriber updates." />
          <Moat id="M.04" name="Closed-loop signal data" body="Every alert + fill + subscriber outcome feeds the marketplace ranking. Generic LLMs can copy a UI but not the labelled outcome data." />
          <Moat id="M.05" name="Trust + audit surfaces" body="Consent for data sharing, transparent fee model, public trade ledger. A retrofit for ad-hoc Telegram alpha groups; native here." />
        </div>
      </Section>

      {/* ── 09 Where we are today ───────────────────────────────────── */}
      <Section num="09" name="Stage" alt>
        <SectionHeader
          eyebrow="Where we are today"
          title="Public beta. Sharp thesis. Real trades on the books."
        />
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h4 className="mono-tag mb-4">Current stage</h4>
            <div className="rounded-lg border-l-2 border-primary bg-[var(--color-card)] px-6 py-5 text-sm leading-relaxed">
              Frontend live at{" "}
              <span className="text-primary">obsidia.app</span> on Vercel.
              Backend on Railway running 24/7 paper trading. 4 in-house
              strategies active, 155 closed trades on file, full Supabase
              persistence and live alerts via Telegram + Discord + email.
            </div>
          </div>
          <div>
            <h4 className="mono-tag mb-4">Initial validation</h4>
            <div className="space-y-1">
              <ValidationRow k="Founder lived experience" v="Three years building algo systems. Lost real money to overfit backtests — the precise pain Obsidia is built to remove." />
              <ValidationRow k="Operating learning" v="155 paper trades across 4 strategy archetypes confirm the value of fee-honest backtests." />
              <ValidationRow k="Adjacent paid demand" v="GMGN, Photon, BullX prove Solana traders pay for tooling. Backtest + audit is the unmet gap." />
              <ValidationRow k="Sharper thesis" v={`Repositioned from "honest backtester" to "strategy marketplace" — recurring revenue, network effects, defensible category.`} last />
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--color-border)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          <Milestone n="M 1–2" text="Public launch, first 1k waitlist signups, design partner outreach." />
          <Milestone n="M 3–4" text="Paid tier live. First 10 creator-published strategies on the marketplace." />
          <Milestone n="M 5–6" text="Independent strategy auditor live. 50 creators, 500 subscribers." />
          <Milestone n="M 7–8" text="One-click execute on Drift + Jupiter Perps. Live-fee data feed." />
          <Milestone n="M 9–10" text="Multi-chain (Base, Arbitrum) via the same DSL. Pre-seed prep." />
        </div>
      </Section>

      <Footer />
    </div>
  );
}

/* ── small primitives ───────────────────────────────────────────────── */

function Italic({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-serif italic text-primary font-normal">
      {children}
    </span>
  );
}

function Section({
  num,
  name,
  alt,
  children,
}: {
  num: string;
  name: string;
  alt?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`relative border-b border-[var(--color-border)] py-20 sm:py-24 ${
        alt ? "bg-[var(--color-surface)]/40" : ""
      }`}
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="mono-tag mb-3">
          <span className="text-primary">{num}</span> · {name}
        </div>
        {children}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className="mb-12">
      <div className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)] mb-3">
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
        {title}
      </h2>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono-tag mb-1">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

function ProblemCell({
  head,
  body,
  tinted,
}: {
  head: string;
  body: string;
  tinted?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-4 min-h-[120px] ${
        tinted
          ? "bg-[var(--color-warning)]/[0.06] border-[var(--color-warning)]/20"
          : "bg-[var(--color-card)] border-[var(--color-border)]"
      }`}
    >
      <div className="mono-tag mb-3">{head}</div>
      <div
        className={`text-sm leading-relaxed ${
          tinted ? "text-[var(--color-warning)]/90" : "text-foreground"
        }`}
      >
        {body}
      </div>
    </div>
  );
}

function Stat({ num, text }: { num: string; text: string }) {
  return (
    <div>
      <div className="font-serif italic text-5xl text-primary mb-3">{num}</div>
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}

function Point({
  n,
  head,
  body,
}: {
  n: string;
  head: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-5 py-5 border-b border-[var(--color-border)] last:border-b-0">
      <div className="mono-tag text-primary pt-1">{n}</div>
      <div>
        <div className="text-base font-semibold mb-1.5">{head}</div>
        <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          {body}
        </div>
      </div>
    </div>
  );
}

function Pillar({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] p-7 min-h-[220px]">
      <div className="mono-tag text-primary mb-4">{kicker}</div>
      <div className="text-xl font-semibold mb-3 leading-tight">{title}</div>
      <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
        {body}
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  footer,
}: {
  n: string;
  title: string;
  body: string;
  footer: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] p-5 flex flex-col">
      <div className="mono-tag text-primary mb-3">{n}</div>
      <div className="text-base font-semibold mb-2 leading-tight">{title}</div>
      <div className="text-xs text-[var(--color-muted-foreground)] leading-relaxed flex-1">
        {body}
      </div>
      <div className="mono-tag mt-4 pt-3 border-t border-[var(--color-border)]">
        {footer}
      </div>
    </div>
  );
}

function Agent({
  id,
  name,
  body,
}: {
  id: string;
  name: string;
  body: string;
}) {
  return (
    <div className="rounded-md bg-[var(--color-card)] border border-[var(--color-border)] p-4">
      <div className="mono-tag text-primary mb-2">{id}</div>
      <div className="text-base font-semibold mb-1">{name}</div>
      <div className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
        {body}
      </div>
    </div>
  );
}

function SpecRow({
  k,
  v,
  last,
}: {
  k: string;
  v: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[110px_1fr] gap-5 py-3 ${
        last ? "" : "border-b border-[var(--color-border)]"
      }`}
    >
      <div className="mono-tag pt-0.5">{k}</div>
      <div className="text-sm leading-relaxed">{v}</div>
    </div>
  );
}

function Moat({
  id,
  name,
  body,
}: {
  id: string;
  name: string;
  body: string;
}) {
  return (
    <div className="rounded-md bg-[var(--color-card)] border border-[var(--color-border)] border-l-2 border-l-primary px-5 py-4 grid grid-cols-[60px_220px_1fr] gap-5 items-center">
      <div className="mono-tag text-primary">{id}</div>
      <div className="text-sm font-semibold">{name}</div>
      <div className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
        {body}
      </div>
    </div>
  );
}

function ValidationRow({
  k,
  v,
  last,
}: {
  k: string;
  v: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[160px_1fr] gap-5 py-3 ${
        last ? "" : "border-b border-[var(--color-border)]"
      }`}
    >
      <div className="mono-tag text-primary pt-0.5">{k}</div>
      <div className="text-sm leading-relaxed">{v}</div>
    </div>
  );
}

function Milestone({ n, text }: { n: string; text: string }) {
  return (
    <div>
      <div className="mono-tag text-primary mb-1.5">{n}</div>
      <div className="text-xs text-foreground leading-relaxed">{text}</div>
    </div>
  );
}
