"use client";

import { PageHeader } from "@/components/shell/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmtPct, fmtUsd, timeAgo } from "@/lib/utils";
import { MOCK_TRADES } from "@/lib/mock";

export default function TradesPage() {
  const trades = MOCK_TRADES;
  const wins = trades.filter((t) => t.pnl_usd > 0);
  const total = trades.reduce((s, t) => s + t.pnl_usd, 0);

  return (
    <>
      <PageHeader
        title="Trades"
        description="Combined paper-trade ledger across all your strategies."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard
          label="Total P&L"
          value={fmtUsd(total, true)}
          delta={{
            value: fmtPct((total / 8500) * 100),
            direction: total >= 0 ? "up" : "down",
          }}
        />
        <KPICard
          label="Trades"
          value={String(trades.length)}
          hint="All-time"
        />
        <KPICard
          label="Win rate"
          value={`${((wins.length / trades.length) * 100).toFixed(1)}%`}
          hint={`${wins.length} wins / ${trades.length - wins.length} losses`}
        />
        <KPICard label="Avg trade" value={fmtUsd(total / trades.length, true)} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="paper">Paper</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Side</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Exit</TableHead>
                    <TableHead className="text-right">PnL</TableHead>
                    <TableHead className="text-right">PnL %</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Closed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge
                          variant={t.side === "long" ? "success" : "danger"}
                        >
                          {t.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${t.entry_price.toFixed(2)}</TableCell>
                      <TableCell>${t.exit_price.toFixed(2)}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          t.pnl_usd >= 0
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]"
                        }`}
                      >
                        {fmtUsd(t.pnl_usd, true)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          t.pnl_pct >= 0
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]"
                        }`}
                      >
                        {fmtPct(t.pnl_pct)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.exit_reason === "tp"
                              ? "success"
                              : t.exit_reason === "sl"
                                ? "danger"
                                : "default"
                          }
                        >
                          {t.exit_reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[var(--color-muted-foreground)]">
                        {timeAgo(t.exit_time)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="paper">
            <EmptyState text="All current trades are paper. Connect a wallet to execute live." />
          </TabsContent>
          <TabsContent value="live">
            <EmptyState text="No live trades yet. Upgrade to Trader plan to enable on-chain execution." />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
      <p className="text-sm text-[var(--color-muted-foreground)]">{text}</p>
    </div>
  );
}
