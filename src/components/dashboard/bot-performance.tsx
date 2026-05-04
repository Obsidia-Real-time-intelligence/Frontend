"use client";

import { Activity, Bot, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  useBotScoreboard,
  useBotStatus,
  useSpikeStats,
  useMrStats,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { fmtPct, fmtUsd } from "@/lib/utils";

const TIER_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  green: "default",
  yellow: "warning",
  orange: "warning",
  red: "danger",
};

const DIRECTION_LABEL: Record<string, string> = {
  long: "BULLISH",
  short: "BEARISH",
  neutral: "NEUTRAL",
};

/**
 * Bot performance — real-time data from the running FastAPI orchestrator.
 * Shows AI confluence, scoreboard (rules vs AI), and the two execution
 * strategies (spike + mean-reversion).
 */
export function BotPerformance() {
  const { data: status } = useBotStatus();
  const { data: scoreboard } = useBotScoreboard();
  const { data: spike } = useSpikeStats();
  const { data: mr } = useMrStats();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* AI Confluence card */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="size-4 text-primary" />
          <div className="text-sm font-semibold tracking-tight">
            AI confluence
          </div>
          {status?.tier && (
            <Badge className="ml-auto" variant={TIER_BADGE[status.tier] ?? "default"}>
              {status.tier}
            </Badge>
          )}
        </div>

        {!status ? (
          <p className="text-xs text-[var(--color-muted-foreground)] py-3">
            Bot is starting up…
          </p>
        ) : (
          <>
            <div className="flex items-baseline gap-3 tabular">
              <span className="text-3xl font-semibold tracking-tight">
                {status.score}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                / 10 confluence score
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant={
                  status.direction === "long"
                    ? "success"
                    : status.direction === "short"
                      ? "danger"
                      : "default"
                }
              >
                {DIRECTION_LABEL[status.direction] ?? status.direction.toUpperCase()}
              </Badge>
              {status.ai_analysis?.confidence_pct != null && (
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  AI confidence {Math.round(status.ai_analysis.confidence_pct)}%
                </span>
              )}
            </div>

            {status.active_signals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                  {status.active_signals.length} active signals
                </div>
                <ul className="space-y-1">
                  {status.active_signals.slice(0, 4).map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-foreground">{s.name}</span>
                      <span className="tabular text-[var(--color-muted-foreground)]">
                        +{s.score}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {status.ai_analysis?.rationale && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-3 text-primary" />
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-semibold">
                    AI rationale
                  </div>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed line-clamp-4">
                  {status.ai_analysis.rationale}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rules vs AI scoreboard */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="size-4 text-primary" />
          <div className="text-sm font-semibold tracking-tight">
            Rules vs AI
          </div>
          {scoreboard && (
            <Badge
              className="ml-auto"
              variant={
                scoreboard.leader === "tied"
                  ? "default"
                  : scoreboard.leader === "rules"
                    ? "primary"
                    : "success"
              }
            >
              {scoreboard.leader === "tied"
                ? "tied"
                : `${scoreboard.leader} leads`}
            </Badge>
          )}
        </div>

        {!scoreboard ? (
          <p className="text-xs text-[var(--color-muted-foreground)] py-3">
            Loading…
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <SideBlock side={scoreboard.rules} accent="text-primary" />
              <SideBlock side={scoreboard.ai} accent="text-[var(--color-success)]" />
            </div>
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--color-muted-foreground)]">
                Lead margin
              </span>
              <span className="tabular font-medium">
                {fmtPct(scoreboard.lead_margin_pct)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Spike + MR strategy stats */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="size-4 text-primary" />
          <div className="text-sm font-semibold tracking-tight">
            Strategy execution
          </div>
        </div>

        <div className="space-y-4">
          {spike && (
            <StrategyBlock
              label="Realtime Spike"
              trades={spike.total_trades}
              winRate={spike.win_rate}
              pnl={spike.total_pnl_usd}
              hasPosition={spike.has_position}
              hint={
                spike.has_position
                  ? `Live · running high $${spike.running_high.toFixed(2)}`
                  : `Idle · current $${spike.current_price.toFixed(2)}`
              }
            />
          )}

          {mr && (
            <StrategyBlock
              label="Mean Reversion (perps)"
              trades={mr.total_trades}
              winRate={mr.win_rate}
              pnl={mr.total_pnl_usdc}
              hasPosition={mr.has_position}
              hint={mr.has_position ? "Live position open" : "Idle"}
            />
          )}

          {!spike && !mr && (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Waiting for bot…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SideBlock({
  side,
  accent,
}: {
  side: { name: string; balance_sol: number; return_pct: number; total_trades: number; win_rate: number };
  accent: string;
}) {
  const positive = side.return_pct >= 0;
  return (
    <div>
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${accent}`}>
        {side.name}
      </div>
      <div className="tabular mt-1">
        <span className="text-base font-semibold">
          {side.balance_sol.toFixed(2)}
          <span className="text-[10px] text-[var(--color-muted-foreground)] font-normal ml-1">
            SOL
          </span>
        </span>
      </div>
      <div
        className={`tabular text-xs font-medium ${
          positive
            ? "text-[var(--color-success)]"
            : "text-[var(--color-danger)]"
        }`}
      >
        {fmtPct(side.return_pct)}
      </div>
      <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">
        {side.total_trades} trades · {side.win_rate.toFixed(0)}% WR
      </div>
    </div>
  );
}

function StrategyBlock({
  label,
  trades,
  winRate,
  pnl,
  hasPosition,
  hint,
}: {
  label: string;
  trades: number;
  winRate: number;
  pnl: number;
  hasPosition: boolean;
  hint: string;
}) {
  const positive = pnl >= 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {hasPosition && (
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[var(--color-success)]">
            <span className="size-1 rounded-full bg-[var(--color-success)] animate-pulse" />
            in trade
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px] tabular">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Trades
          </div>
          <div className="font-medium">{trades}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            WR
          </div>
          <div className="font-medium">{winRate.toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            PnL
          </div>
          <div
            className={`font-medium ${
              positive
                ? "text-[var(--color-success)]"
                : "text-[var(--color-danger)]"
            }`}
          >
            {fmtUsd(pnl, true)}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-[var(--color-muted-foreground)] mt-1">
        {hint}
      </div>
    </div>
  );
}
