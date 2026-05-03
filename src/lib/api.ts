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

// ── Backtests — POST to FastAPI; backend persists to Supabase ────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

// ── Marketplace (read-only public table) ──────────────────────────

export function useMarketplace() {
  return useQuery<MarketplaceStrategy[]>({
    queryKey: ["marketplace"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("marketplace_strategies")
        .select("*")
        .order("subscribers", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MarketplaceStrategy[];
    },
  });
}

export function useMarketplaceStrategy(id: string) {
  return useQuery<MarketplaceStrategy | null>({
    queryKey: ["marketplace", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("marketplace_strategies")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as MarketplaceStrategy | null;
    },
    enabled: !!id,
  });
}
