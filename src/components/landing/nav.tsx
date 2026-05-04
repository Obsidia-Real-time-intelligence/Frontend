import Link from "next/link";
import { Logo } from "@/components/shell/logo";
import { Button } from "@/components/ui/button";
import { CommunityLinks } from "@/components/shell/community-links";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--color-muted-foreground)]">
          <Link href="/#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link
            href="https://x.com/trade_obsidia"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            Twitter
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <CommunityLinks />
          <div className="hidden sm:block w-px h-5 bg-[var(--color-border)] mx-1" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/waitlist">Join waitlist</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
