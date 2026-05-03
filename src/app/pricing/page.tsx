import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Tier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Try the platform. Best for hobbyist quants.",
    features: [
      "3 saved strategies",
      "1 year of historical data",
      "1 alert per day",
      "Daily AI brief",
      "Paper trading only",
    ],
    cta: "Sign up free",
    ctaHref: "/waitlist",
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/ month",
    description: "For active traders running strategies daily.",
    features: [
      "Unlimited strategies",
      "5 years of historical data, all timeframes",
      "Real-time alerts (Telegram + Discord + email)",
      "All 16+ signals & MTF alignment",
      "Backtest with real Jupiter / Drift fees",
      "Paper trading ledger",
    ],
    cta: "Start Pro",
    ctaHref: "/api/checkout?plan=pro",
    highlighted: true,
  },
  {
    name: "Trader",
    price: "$99",
    cadence: "/ month",
    description: "For traders ready to execute on-chain.",
    features: [
      "Everything in Pro",
      "AI co-pilot brief on every alert",
      "One-click execution on Drift / Jupiter",
      "API access (10k req/day)",
      "Priority alert delivery",
      "Custom strategy review (1×/mo)",
    ],
    cta: "Start Trader",
    ctaHref: "/api/checkout?plan=trader",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <MarketingNav />

      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
              Honest pricing.
              <br />
              No annual gotchas.
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              Cancel any time. The Free tier stays free. We don't make money
              when you trade — we make money when our backtester is honest
              enough that you keep paying for it.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {TIERS.map((t) => (
              <PricingCard key={t.name} tier={t} />
            ))}
          </div>

          <div className="mt-12 text-center text-xs text-[var(--color-muted-foreground)]">
            Need a Quant tier ($299/mo) or enterprise?{" "}
            <Link href="mailto:hello@obsidia.fi" className="text-primary hover:underline">
              Email us
            </Link>
            .
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PricingCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border p-6 flex flex-col",
        tier.highlighted
          ? "border-primary/40 bg-[var(--color-card)] shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
          : "border-[var(--color-border)] bg-[var(--color-card)]"
      )}
    >
      {tier.highlighted && (
        <div className="absolute -top-2.5 left-6">
          <Badge variant="primary">Most popular</Badge>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {tier.name}
        </h3>
        <div className="flex items-baseline gap-1.5 tabular">
          <span className="text-4xl font-semibold tracking-tight text-foreground">
            {tier.price}
          </span>
          <span className="text-sm text-[var(--color-muted-foreground)]">
            {tier.cadence}
          </span>
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
          {tier.description}
        </p>
      </div>

      <Button
        asChild
        size="lg"
        variant={tier.highlighted ? "default" : "secondary"}
        className="mt-6 w-full"
      >
        <Link href={tier.ctaHref}>{tier.cta}</Link>
      </Button>

      <ul className="mt-8 space-y-2.5">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs">
            <Check className="size-3.5 shrink-0 text-primary mt-0.5" strokeWidth={2.5} />
            <span className="text-foreground">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
