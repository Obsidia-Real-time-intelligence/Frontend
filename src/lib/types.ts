/**
 * Shared types between the FastAPI backend (src/) and this frontend.
 * Mirrors the Strategy DSL spec in docs/IMPLEMENTATION.md.
 */

export type Side = "long" | "short";
export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
export type Plan = "Free" | "Pro" | "Trader" | "Quant";

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  timeframe: Timeframe;
  status: "draft" | "live" | "paused";
  description?: string;
  dsl_json: StrategyDSL;
  created_at: string;
  last_fired_at?: string | null;
  // aggregate stats from latest backtest
  return_pct?: number;
  win_rate?: number;
  sharpe?: number;
  max_drawdown_pct?: number;
}

export interface StrategyDSL {
  name: string;
  symbol: string;
  timeframe: Timeframe;
  entry: {
    side: Side;
    conditions: Condition[];
  };
  exit: {
    type: "time_or_target" | "htf_target_or_time";
    max_hold_bars: number;
    stop_loss_pct?: number | null;
    take_profit_pct?: number | null;
    stop_loss_atr?: number;
  };
  sizing: {
    type: "fixed_notional" | "fixed_pct" | "atr_risk";
    notional_usd?: number;
    pct?: number;
    risk_usd?: number;
    leverage: number;
  };
  fees: {
    venue: "jupiter_perps" | "drift" | "hyperliquid" | "binance_spot";
    fee_per_fill_pct: number;
    slippage_pct: number;
  };
  filters?: Record<string, unknown>;
  htf_filter?: HTFFilter;
}

export interface Condition {
  type:
    | "bar_return"
    | "cumul_return"
    | "rsi"
    | "bb_position"
    | "ema_position"
    | "volume_z"
    | "sr_proximity"
    | "divergence";
  operator: "<" | "<=" | "==" | ">=" | ">";
  value: number;
  lookback?: number;
}

export interface HTFFilter {
  timeframe: Timeframe;
  bias_source: "sr_zone_proximity" | "ema" | "structure" | "order_block" | "fib";
  bias_rules: Array<Record<string, unknown>>;
  target_source?: "next_htf_level" | "htf_atr_multiple";
  alignment_check?: {
    trigger_size_atr?: number;
    rule?: string;
  };
}

export interface Backtest {
  id: string;
  strategy_id: string;
  ran_at: string;
  result: BacktestResult;
}

export interface BacktestResult {
  trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl_pct: number;
  max_drawdown_pct: number;
  profit_factor: number;
  sharpe: number;
  avg_win_pct: number;
  avg_loss_pct: number;
  longest_losing_streak: number;
  avg_hold_bars?: number;
  equity_curve: Array<{ t: string; equity: number }>;
  trade_ledger: Array<{
    side: "long" | "short";
    entry_time: string;
    exit_time: string;
    entry_price: number;
    exit_price: number;
    pnl_pct: number;
    pnl_usd: number;
    exit_reason: "tp" | "sl" | "time" | "manual";
  }>;
}

export interface Trade {
  id: string;
  strategy_id: string;
  side: Side;
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  pnl_pct: number;
  pnl_usd: number;
  exit_reason: "tp" | "sl" | "time" | "manual";
}

export interface Alert {
  id: string;
  strategy_id: string;
  strategy_name: string;
  symbol: string;
  side: Side;
  fired_at: string;
  price: number;
  suggested_entry: number;
  suggested_sl: number;
  suggested_tp: number;
  ai_summary: string;
  ai_confidence: number; // 0..10
  read?: boolean;
}

export interface MarketplaceStrategy {
  id: string;
  name: string;
  creator: string;
  creator_avatar?: string;
  description: string;
  return_pct_30d: number;
  return_pct_total: number;
  risk_score: number; // 1-10
  subscribers: number;
  price_usd_monthly: number;
  symbols: string[];
  timeframe: Timeframe;
}

export interface KPI {
  total_strategies: number;
  active_alerts: number;
  paper_pnl_usd: number;
  paper_pnl_pct: number;
}
