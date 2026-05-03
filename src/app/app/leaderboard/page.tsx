"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { fmtPct, fmtUsd } from "@/lib/utils";
import { MOCK_LEADERBOARD, MOCK_CREATORS } from "@/lib/mock";
import type { LeaderRow, CreatorRow } from "@/lib/mock";

type Window = "24h" | "7d" | "30d";

export default function LeaderboardPage() {
  const [window, setWindow] = useState<Window>("30d");

  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => {
    const get = (r: LeaderRow) =>
      window === "24h"
        ? r.return_pct_24h
        : window === "7d"
          ? r.return_pct_7d
          : r.return_pct_30d;
    return get(b) - get(a);
  });

  const top3 = sorted.slice(0, 3);

  return (
    <>
      <PageHeader
        title="Leaderboard"
        description="Top strategies by return — verified, backtested with real fees, no lookahead."
        actions={
          <div className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-0.5">
            {(["24h", "7d", "30d"] as const).map((w) => (
              <button
                key={w}
                onClick={() => setWindow(w)}
                className={`px-3 h-7 text-xs rounded-sm transition-colors ${
                  window === w
                    ? "bg-[var(--color-elevated)] text-foreground"
                    : "text-[var(--color-muted-foreground)] hover:text-foreground"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        }
      />

      {/* Podium — top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {top3.map((row, i) => (
          <PodiumCard key={row.strategy_id} row={row} place={i + 1} window={window} />
        ))}
      </div>

      <Tabs defaultValue="strategies">
        <TabsList>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="creators">Creators</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies">
          <StrategyLeaderboard rows={sorted} window={window} />
        </TabsContent>

        <TabsContent value="creators">
          <CreatorLeaderboard rows={MOCK_CREATORS} />
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-[10px] text-center text-[var(--color-muted-foreground)] leading-relaxed">
        All performance figures are net of real Jupiter Perps fees (0.14% RT) +
        0.05% slippage on every fill. Verified strategies have passed our
        no-lookahead audit. Past performance does not guarantee future results.
      </p>
    </>
  );
}

// ── Podium ─────────────────────────────────────────────────────────

function PodiumCard({
  row,
  place,
  window,
}: {
  row: LeaderRow;
  place: number;
  window: Window;
}) {
  const ret =
    window === "24h"
      ? row.return_pct_24h
      : window === "7d"
        ? row.return_pct_7d
        : row.return_pct_30d;
  const positive = ret >= 0;

  const Icon = place === 1 ? Crown : place === 2 ? Medal : Award;
  const tone =
    place === 1
      ? "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5"
      : place === 2
        ? "border-[var(--color-muted-foreground)]/30"
        : "border-[var(--color-warning)]/20";

  const iconColor =
    place === 1
      ? "text-[var(--color-warning)]"
      : place === 2
        ? "text-[var(--color-muted-foreground)]"
        : "text-[#CD7F32]"; // bronze

  return (
    <div
      className={`relative rounded-lg border p-5 bg-[var(--color-card)] ${tone}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`grid h-10 w-10 place-items-center rounded-md border-2 ${
          place === 1
            ? "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10"
            : "border-[var(--color-border)] bg-[var(--color-elevated)]"
        }`}>
          <Icon className={`size-5 ${iconColor}`} strokeWidth={2} />
        </div>
        <span className="text-3xl font-semibold tabular text-[var(--color-muted-foreground)] tracking-tight">
          #{place}
        </span>
      </div>
      <Link
        href={`/app/marketplace/m_${row.rank}`}
        className="block hover:text-primary"
      >
        <div className="text-sm font-semibold tracking-tight truncate">
          {row.strategy_name}
        </div>
      </Link>
      <div className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1.5 mt-0.5">
        {row.creator}
        {row.verified && (
          <ShieldCheck className="size-3 text-primary" />
        )}
        <span>·</span>
        <span>{row.symbol}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {window} return
        </span>
        <span
          className={`tabular text-2xl font-semibold tracking-tight ${
            positive
              ? "text-[var(--color-success)]"
              : "text-[var(--color-danger)]"
          }`}
        >
          {fmtPct(ret)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <Mini label="WR" value={`${row.win_rate.toFixed(0)}%`} />
        <Mini label="Sharpe" value={row.sharpe.toFixed(2)} />
        <Mini label="MDD" value={`${row.max_drawdown_pct.toFixed(1)}%`} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-elevated)]/50 border border-[var(--color-border)] px-2 py-1.5 text-center">
      <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div className="tabular font-medium text-foreground mt-0.5">{value}</div>
    </div>
  );
}

// ── Strategies leaderboard ─────────────────────────────────────────

function StrategyLeaderboard({
  rows,
  window,
}: {
  rows: LeaderRow[];
  window: Window;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Strategy</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">{window} return</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
            <TableHead className="text-right">Sharpe</TableHead>
            <TableHead className="text-right">MDD</TableHead>
            <TableHead className="text-right">Trades</TableHead>
            <TableHead className="text-right">Subs</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const ret =
              window === "24h"
                ? row.return_pct_24h
                : window === "7d"
                  ? row.return_pct_7d
                  : row.return_pct_30d;
            const positive = ret >= 0;
            return (
              <TableRow key={row.strategy_id}>
                <TableCell>
                  <RankBadge place={i + 1} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/app/marketplace/m_${row.rank}`}
                    className="hover:text-primary"
                  >
                    <div className="font-medium text-foreground flex items-center gap-1.5">
                      {row.strategy_name}
                      {row.verified && (
                        <ShieldCheck className="size-3 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--color-muted-foreground)]">
                      {row.creator}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-[var(--color-muted-foreground)]">
                  {row.symbol}
                  <div className="text-[10px] uppercase">{row.timeframe}</div>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    positive
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    {positive ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {fmtPct(ret)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {row.win_rate.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {row.sharpe.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-[var(--color-muted-foreground)]">
                  {row.max_drawdown_pct.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right text-[var(--color-muted-foreground)]">
                  {row.trades}
                </TableCell>
                <TableCell className="text-right text-[var(--color-muted-foreground)]">
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Users className="size-3" />
                    {row.subscribers}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/app/marketplace/m_${row.rank}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Creators leaderboard ───────────────────────────────────────────

function CreatorLeaderboard({ rows }: { rows: CreatorRow[] }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead className="text-right">Strategies</TableHead>
            <TableHead className="text-right">Avg 30d return</TableHead>
            <TableHead className="text-right">Subscribers</TableHead>
            <TableHead className="text-right">AUM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={row.handle}>
              <TableCell>
                <RankBadge place={i + 1} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] text-[11px] font-semibold uppercase">
                    {row.handle.charAt(1).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground flex items-center gap-1.5">
                      {row.handle}
                      {row.verified && (
                        <ShieldCheck className="size-3 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {row.strategies_count}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  row.avg_return_30d >= 0
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-danger)]"
                }`}
              >
                {fmtPct(row.avg_return_30d)}
              </TableCell>
              <TableCell className="text-right text-[var(--color-muted-foreground)]">
                {row.total_subscribers.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-[var(--color-muted-foreground)]">
                {fmtUsd(row.total_aum_usd)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RankBadge({ place }: { place: number }) {
  if (place === 1)
    return (
      <Crown className="size-4 text-[var(--color-warning)]" strokeWidth={2.5} />
    );
  if (place === 2)
    return <Medal className="size-4 text-[var(--color-muted-foreground)]" />;
  if (place === 3) return <Award className="size-4 text-[#CD7F32]" />;
  return (
    <span className="tabular text-[var(--color-muted-foreground)] text-xs">
      {place}
    </span>
  );
}
