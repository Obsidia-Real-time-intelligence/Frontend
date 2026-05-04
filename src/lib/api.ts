/**
 * Data layer — Supabase-direct queries via React Query.
 *
 * Strategies + Alerts go straight from the browser to Supabase using RLS to
 * scope rows to the signed-in user. The FastAPI backend will later WRITE
 * backtest results and fired alerts into the same tables; this layer
 * READS them. No need for a custom API server for user data.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  Strategy,
  StrategyDSL,
  BacktestResult,
  Alert,
  KPI,
  MarketplaceStrategy,
} from "./types";

// ── KPIs ──────────────────────────────────────────────────────────

export function useKpis() {
  return useQuery<KPI>({
    queryKey: ["kpis"],
    queryFn: async () => {
      const supabase = createClient();
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();

      const [{ count: total_strategies }, { count: active_alerts }, { data: trades }] =
        await Promise.all([
          supabase
            .from("strategies")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .gte("fired_at", since),
          supabase
            .from("trades_paper")
            .select("pnl_usd, created_at")
            .gte(
              "created_at",
              new Date(Date.now() - 30 * 86400_000).toISOString()
            ),
        ]);

      const paper_pnl_usd = (trades ?? []).reduce(
        (sum, t) => sum + (t.pnl_usd ?? 0),
        0
      );
      const paper_pnl_pct = (paper_pnl_usd / 8500) * 100;

      return {
        total_strategies: total_strategies ?? 0,
        active_alerts: active_alerts ?? 0,
        paper_pnl_usd,
        paper_pnl_pct,
      };
    },
    refetchInterval: 30_000,
  });
}

// ── Strategies ────────────────────────────────────────────────────

export function useStrategies() {
  return useQuery<Strategy[]>({
    queryKey: ["strategies"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Strategy[];
    },
  });
}

export function useStrategy(id: string) {
  return useQuery<Strategy | null>({
    queryKey: ["strategies", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Strategy | null;
    },
    enabled: !!id,
  });
}

export function useCreateStrategy() {
  const qc = useQueryClient();
  return useMutation<Strategy, Error, StrategyDSL>({
    mutationFn: async (dsl) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const { data, error } = await supabase
        .from("strategies")
        .insert({
          user_id: user.id,
          name: dsl.name,
          symbol: dsl.symbol,
          timeframe: dsl.timeframe,
          status: "draft",
          dsl_json: dsl,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Strategy;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["strategies"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
}

export function useUpdateStrategyStatus() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; status: "live" | "paused" | "draft" }
  >({
    mutationFn: async ({ id, status }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("strategies")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["strategies"] });
      qc.invalidateQueries({ queryKey: ["strategies", id] });
    },
  });
}

export function useDeleteStrategy() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const supabase = createClient();
      const { error } = await supabase.from("strategies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

// ── Alerts ────────────────────────────────────────────────────────

export function useAlerts(limit = 50) {
  return useQuery<Alert[]>({
    queryKey: ["alerts", limit],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("alerts")
        .select("*, strategies(name)")
        .order("fired_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ((data ?? []) as unknown as Array<Alert & { strategies?: { name: string } }>).map(
        (a) => ({
          ...a,
          strategy_name: a.strategies?.name ?? a.strategy_name ?? "—",
        })
      );
    },
    refetchInterval: 15_000,
  });
}

export function useAlert(id: string) {
  return useQuery<Alert | null>({
    queryKey: ["alerts", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("alerts")
        .select("*, strategies(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as unknown as Alert & { strategies?: { name: string } };
      return { ...row, strategy_name: row.strategies?.name ?? "—" };
    },
    enabled: !!id,
  });
}

// ── FastAPI integration — real data from the running orchestrator ───────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ── Bot scoreboard (Rule-Based vs AI Trader head-to-head) ───────────────

export interface BotScoreboardSide {
  name: string;
  balance_sol: number;
  return_pct: number;
  total_trades: number;
  win_rate: number;
}

export interface BotScoreboard {
  leader: "rules" | "ai" | "tied";
  lead_margin_pct: number;
  rules: BotScoreboardSide;
  ai: BotScoreboardSide;
}

export function useBotScoreboard() {
  return useQuery<BotScoreboard>({
    queryKey: ["bot", "scoreboard"],
    queryFn: () => apiGet<BotScoreboard>("/api/scoreboard"),
    refetchInterval: 30_000,
  });
}

// ── Bot status (confluence score, tier, AI analysis) ────────────────────

export interface BotStatus {
  score: number;
  tier: "green" | "yellow" | "orange" | "red";
  direction: "long" | "short" | "neutral";
  active_signals: Array<{ name: string; score: number; details?: string }>;
  ticker: { last?: number; change_24h?: number } | null;
  last_update: string | null;
  mtf: Record<string, unknown>;
  ai_analysis: {
    direction?: string;
    confidence_pct?: number;
    rationale?: string;
    [key: string]: unknown;
  } | null;
}

export function useBotStatus() {
  return useQuery<BotStatus>({
    queryKey: ["bot", "status"],
    queryFn: () => apiGet<BotStatus>("/api/status"),
    refetchInterval: 15_000,
  });
}

// ── Spike strategy live stats ────────────────────────────────────────────

export interface SpikeStats {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl_sol: number;
  total_pnl_usd: number;
  has_position: boolean;
  current_price: number;
  running_high: number;
}

export function useSpikeStats() {
  return useQuery<SpikeStats>({
    queryKey: ["bot", "spike"],
    queryFn: () => apiGet<SpikeStats>("/api/spike"),
    refetchInterval: 15_000,
  });
}

// ── MR strategy live stats ───────────────────────────────────────────────

export interface MrStats {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl_usdc: number;
  has_position: boolean;
}

export function useMrStats() {
  return useQuery<MrStats>({
    queryKey: ["bot", "mr"],
    queryFn: () => apiGet<MrStats>("/api/mr"),
    refetchInterval: 15_000,
  });
}

export interface BacktestRunArgs {
  dsl: StrategyDSL;
  strategy_id?: string;     // if running a saved strategy
  max_months?: number;
}

export function useRunBacktest() {
  const qc = useQueryClient();
  return useMutation<BacktestResult & { backtest_id?: string | null }, Error, BacktestRunArgs>({
    mutationFn: async ({ dsl, strategy_id, max_months }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const res = await fetch(`${API_URL}/api/backtests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dsl,
          user_id: user?.id ?? null,
          strategy_id: strategy_id ?? null,
          max_months: max_months ?? 24,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Backtest failed (${res.status}): ${body}`);
      }
      const json = await res.json();
      return { ...json.result, backtest_id: json.backtest_id };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["strategies"] });
      if (vars.strategy_id) {
        qc.invalidateQueries({ queryKey: ["strategies", vars.strategy_id] });
        qc.invalidateQueries({ queryKey: ["backtests", vars.strategy_id] });
      }
    },
  });
}

/** Read one backtest row from Supabase by id. */
export function useBacktestResult(id: string | null | undefined) {
  return useQuery<BacktestResult | null>({
    queryKey: ["backtests", "result", id],
    queryFn: async () => {
      if (!id) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("backtests")
        .select("result_json")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data?.result_json as BacktestResult) ?? null;
    },
    enabled: !!id,
  });
}

/** Get the most recent full backtest result_json for a strategy. */
export function useLatestBacktest(strategyId: string | null | undefined) {
  return useQuery<BacktestResult | null>({
    queryKey: ["backtests", "latest", strategyId],
    queryFn: async () => {
      if (!strategyId) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("backtests")
        .select("result_json")
        .eq("strategy_id", strategyId)
        .order("ran_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data?.result_json as BacktestResult) ?? null;
    },
    enabled: !!strategyId,
  });
}

/** List backtests for a saved strategy. */
export function useBacktestsForStrategy(strategyId: string | null | undefined) {
  return useQuery({
    queryKey: ["backtests", "for-strategy", strategyId],
    queryFn: async () => {
      if (!strategyId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("backtests")
        .select("id, ran_at, return_pct, win_rate, sharpe, max_drawdown_pct, trade_count")
        .eq("strategy_id", strategyId)
        .order("ran_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!strategyId,
  });
}

// ── S/R zones (populated hourly by sr_refresher worker) ──────────

export interface SrZone {
  id: string;
  symbol: string;
  timeframe: string;
  kind: "support" | "resistance";
  center: number;
  low: number;
  high: number;
  touches: number;
  score: number | null;
  computed_at: string;
}

export function useSrZones(symbol: string, timeframe: string) {
  return useQuery<SrZone[]>({
    queryKey: ["sr-zones", symbol, timeframe],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sr_zones")
        .select("*")
        .eq("symbol", symbol)
        .eq("timeframe", timeframe)
        .order("score", { ascending: false, nullsFirst: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as SrZone[];
    },
    refetchInterval: 60_000,
  });
}

// ── Leaderboard (Supabase view) ──────────────────────────────────

export interface LeaderboardRow {
  strategy_id: string;
  strategy_name: string;
  symbol: string;
  timeframe: string;
  creator: string;
  creator_avatar: string | null;
  creator_verified: boolean;
  strategy_verified: boolean;
  return_pct_30d: number | null;
  win_rate: number | null;
  sharpe: number | null;
  max_drawdown_pct: number | null;
  trade_count: number | null;
  subscribers: number;
  price_usd_monthly: number | null;
  last_fired_at: string | null;
  created_at: string;
}

export function useLeaderboard() {
  return useQuery<LeaderboardRow[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leaderboard_strategies")
        .select("*")
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LeaderboardRow[];
    },
    refetchInterval: 5 * 60_000,
  });
}

// ── Trades (paper-trade ledger) ──────────────────────────────────

export interface PaperTrade {
  id: string;
  strategy_id: string | null;
  symbol: string;
  side: "long" | "short";
  entry_price: number;
  exit_price: number | null;
  pnl_usd: number | null;
  pnl_pct: number | null;
  exit_reason: "tp" | "sl" | "time" | "manual" | null;
  is_live: boolean;
  opened_at: string;
  closed_at: string | null;
}

export function useTrades(strategyId?: string) {
  return useQuery<PaperTrade[]>({
    queryKey: ["trades", strategyId ?? "all"],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("trades_paper")
        .select("*")
        .order("opened_at", { ascending: false })
        .limit(100);
      if (strategyId) q = q.eq("strategy_id", strategyId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PaperTrade[];
    },
    refetchInterval: 30_000,
  });
}

// ── Marketplace — backed by leaderboard_strategies view ────────────
// Public strategies surface via the leaderboard view (which already joins
// strategies + profiles + subscriber count). We adapt the row shape to
// the MarketplaceStrategy interface the UI expects.

function leaderRowToMarketplaceStrategy(row: LeaderboardRow): MarketplaceStrategy {
  return {
    id: row.strategy_id,
    name: row.strategy_name,
    creator: row.creator,
    creator_avatar: row.creator_avatar ?? undefined,
    description: "", // strategy descriptions not yet exposed in view
    return_pct_30d: row.return_pct_30d ?? 0,
    return_pct_total: row.return_pct_30d ?? 0,
    risk_score: row.max_drawdown_pct
      ? Math.min(10, Math.max(1, Math.round(row.max_drawdown_pct / 3)))
      : 5,
    subscribers: row.subscribers,
    price_usd_monthly: row.price_usd_monthly ?? 0,
    symbols: [row.symbol],
    timeframe: row.timeframe as MarketplaceStrategy["timeframe"],
  };
}

export function useMarketplace() {
  return useQuery<MarketplaceStrategy[]>({
    queryKey: ["marketplace"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leaderboard_strategies")
        .select("*")
        .order("subscribers", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => leaderRowToMarketplaceStrategy(r as LeaderboardRow));
    },
    refetchInterval: 60_000,
  });
}

export function useMarketplaceStrategy(id: string) {
  return useQuery<MarketplaceStrategy | null>({
    queryKey: ["marketplace", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leaderboard_strategies")
        .select("*")
        .eq("strategy_id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? leaderRowToMarketplaceStrategy(data as LeaderboardRow) : null;
    },
    enabled: !!id,
  });
}
