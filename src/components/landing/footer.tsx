import Link from "next/link";
import { Logo } from "@/components/shell/logo";

const LINKS = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/app/marketplace", label: "Marketplace" },
    { href: "/docs", label: "Docs" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "https://x.com/trade_obsidia", label: "Twitter" },
  ],
  Resources: [
    { href: "/changelog", label: "Changelog" },
    {
      href: "https://github.com/anthropics/obsidia",
      label: "GitHub",
    },
    { href: "/security", label: "Security" },
    { href: "/status", label: "Status" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/disclaimer", label: "Risk disclosure" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-3">
            <Logo />
            <p className="text-xs text-[var(--color-muted-foreground)] max-w-xs leading-relaxed">
              The honest backtester for Solana traders. Open-source by default.
              Real fees. No lookahead.
            </p>
            <p className="text-[10px] text-[var(--color-subtle-foreground)] pt-3 max-w-xs leading-relaxed">
              Trading involves risk. Past performance does not guarantee future
              results. Strategies on Obsidia are educational tools, not financial
              advice.
            </p>
          </div>

          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] mb-3">
                {heading}
              </div>
              <ul className="space-y-2">
                {items.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-xs text-foreground hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[var(--color-subtle-foreground)] uppercase tracking-wider">
          <div>© 2026 Obsidia Labs · Built on Solana</div>
          <div>Bangalore · San Francisco</div>
        </div>
      </div>
    </footer>
  );
}
