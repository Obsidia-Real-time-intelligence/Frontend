"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Users, Search, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtPct } from "@/lib/utils";
import { useMarketplace } from "@/lib/api";
import type { MarketplaceStrategy } from "@/lib/types";

export default function MarketplacePage() {
  const { data: strategies = [], isLoading } = useMarketplace();

  return (
    <>
      <PageHeader
        title="Marketplace"
        description="Subscribe to verified strategies from top traders. Backtested, transparent, audited."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-subtle-foreground)]" />
          <Input
            type="text"
            placeholder="Search strategies, creators…"
            className="pl-8"
          />
        </div>
        <Tabs defaultValue="all" className="sm:ml-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="top">Top performers</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
          <Loader2 className="size-4 animate-spin mr-2" />
          <span className="text-sm">Loading marketplace…</span>
        </div>
      )}

      {!isLoading && strategies.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No public strategies yet. The marketplace fills as creators publish strategies.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/app/strategies/new">Create one</Link>
          </Button>
        </div>
      )}

      {!isLoading && strategies.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strategies.map((s) => (
            <MarketplaceCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </>
  );
}

function MarketplaceCard({ s }: { s: MarketplaceStrategy }) {
  const positive = s.return_pct_30d >= 0;
  return (
    <Link
      href={`/app/marketplace/${s.id}`}
      className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-elevated)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground tracking-tight truncate">
            {s.name}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
            {s.creator}
          </p>
        </div>
        <Badge variant="outline">{s.timeframe}</Badge>
      </div>

      <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed mb-4">
        {s.description}
      </p>

      <div className="grid grid-cols-3 gap-3 py-3 border-t border-[var(--color-border)]">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            30d
          </div>
          <div
            className={`tabular text-sm font-medium flex items-center gap-1 ${
              positive
                ? "text-[var(--color-success)]"
                : "text-[var(--color-danger)]"
            }`}
          >
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {fmtPct(s.return_pct_30d)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Risk
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1 rounded-sm ${
                  i < s.risk_score
                    ? s.risk_score >= 7
                      ? "bg-[var(--color-danger)]"
                      : s.risk_score >= 4
                        ? "bg-[var(--color-warning)]"
                        : "bg-[var(--color-success)]"
                    : "bg-[var(--color-border-strong)]"
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] text-[var(--color-muted-foreground)] tabular mt-0.5">
            {s.risk_score}/10
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Subs
          </div>
          <div className="tabular text-sm font-medium text-foreground flex items-center gap-1">
            <Users className="size-3 text-[var(--color-muted-foreground)]" />
            {s.subscribers}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <div className="tabular text-sm font-semibold">
          ${s.price_usd_monthly}
          <span className="text-[var(--color-muted-foreground)] font-normal text-xs">
            /mo
          </span>
        </div>
        <Button size="sm" className="group-hover:bg-primary group-hover:text-white">
          Subscribe
        </Button>
      </div>
    </Link>
  );
}
