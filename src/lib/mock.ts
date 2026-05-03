/**
 * Mock data for offline UI development. Replace with real API calls
 * once the FastAPI endpoints are wired up.
 */
import type {
  Alert,
  KPI,
  MarketplaceStrategy,
  Strategy,
  Trade,
} from "./types";

export const MOCK_KPIS: KPI = {
  total_strategies: 7,
  active_alerts: 3,
  paper_pnl_usd: 1247.32,
  paper_pnl_pct: 14.7,
};

export const MOCK_STRATEGIES: Strategy[] = [
  {
    id: "s_1",
    user_id: "u_1",
    name: "SOL Bounce after -2%",
    symbol: "SOL/USDT",
    timeframe: "15m",
    status: "live",
    description: "Long after big drops with no SL, fixed 1h exit",
    return_pct: 14.7,
    win_rate: 61.0,
    sharpe: 1.42,
    max_drawdown_pct: 12.4,
    last_fired_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400_000).toISOString(),
    dsl_json: {} as never,
  },
  {
    id: "s_2",
    user_id: "u_1",
    name: "Liquidity Sweep Reversal 4H",
    symbol: "SOL/USDT",
    timeframe: "4h",
    status: "live",
    description: "OmniSweep — pivot break + trend filter",
    return_pct: 6.32,
    win_rate: 44.8,
    sharpe: 0.72,
    max_drawdown_pct: 3.7,
    last_fired_at: new Date(Date.now() - 18 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 21 * 86400_000).toISOString(),
    dsl_json: {} as never,
  },
  {
    id: "s_3",
    user_id: "u_1",
    name: "BTC Range Fade",
    symbol: "BTC/USDT",
    timeframe: "1h",
    status: "paused",
    description: "Mean reversion in defined range",
    return_pct: -2.1,
    win_rate: 51.2,
    sharpe: -0.18,
    max_drawdown_pct: 8.4,
    created_at: new Date(Date.now() - 14 * 86400_000).toISOString(),
    dsl_json: {} as never,
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "a_1",
    strategy_id: "s_1",
    strategy_name: "SOL Bounce after -2%",
    symbol: "SOL/USDT",
    side: "long",
    fired_at: new Date(Date.now() - 6 * 60_000).toISOString(),
    price: 84.06,
    suggested_entry: 84.06,
    suggested_sl: 80.33,
    suggested_tp: 86.5,
    ai_summary:
      "SOL fell 2.4% in the last 15m bar on elevated volume (z=1.8). Historical pattern shows mean reversion in the next hour 61% of the time. RSI 32, oversold. 4H trend remains bullish — confluence supports a long. Monitor for volume confirmation on the bounce.",
    ai_confidence: 7,
    read: false,
  },
  {
    id: "a_2",
    strategy_id: "s_2",
    strategy_name: "Liquidity Sweep Reversal 4H",
    symbol: "SOL/USDT",
    side: "short",
    fired_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
    price: 86.72,
    suggested_entry: 86.72,
    suggested_sl: 88.94,
    suggested_tp: 82.42,
    ai_summary:
      "Pivot sweep detected at $86.72 (×18 touches on 1H). Price wicked above the swing high, then closed back below — classic stop-hunt reversal. 4H trend turning bearish, RSI div present. Target = next major support cluster at $82.42.",
    ai_confidence: 8,
    read: true,
  },
  {
    id: "a_3",
    strategy_id: "s_1",
    strategy_name: "SOL Bounce after -2%",
    symbol: "SOL/USDT",
    side: "long",
    fired_at: new Date(Date.now() - 26 * 3600_000).toISOString(),
    price: 82.41,
    suggested_entry: 82.41,
    suggested_sl: 80.0,
    suggested_tp: 84.5,
    ai_summary:
      "Triggered after 3-bar -3% cumulative drop. Volume profile shows accumulation. Confluence with daily S/R at $82.42 (×8 touches).",
    ai_confidence: 6,
    read: true,
  },
];

export const MOCK_TRADES: Trade[] = Array.from({ length: 18 }).map((_, i) => {
  const days = i + 1;
  const isWin = Math.random() > 0.4;
  const pnl_pct = (isWin ? 1 : -1) * (0.3 + Math.random() * 1.5);
  return {
    id: `t_${i}`,
    strategy_id: "s_1",
    side: Math.random() > 0.4 ? "long" : "short",
    entry_time: new Date(Date.now() - days * 86400_000).toISOString(),
    exit_time: new Date(
      Date.now() - days * 86400_000 + 3600_000
    ).toISOString(),
    entry_price: 80 + Math.random() * 8,
    exit_price: 80 + Math.random() * 8,
    pnl_pct,
    pnl_usd: pnl_pct * 85,
    exit_reason: isWin ? "tp" : Math.random() > 0.5 ? "sl" : "time",
  };
});

/** Synthetic equity curve for charts. */
export function mockEquityCurve(points = 90, seed = 10000) {
  let v = seed;
  return Array.from({ length: points }).map((_, i) => {
    v = v * (1 + (Math.random() - 0.45) * 0.02);
    return {
      t: new Date(Date.now() - (points - i) * 86400_000)
        .toISOString()
        .slice(0, 10),
      equity: Math.round(v * 100) / 100,
    };
  });
}

// ── Leaderboard ───────────────────────────────────────────────────

export interface LeaderRow {
  rank: number;
  strategy_id: string;
  strategy_name: string;
  creator: string;
  symbol: string;
  timeframe: string;
  return_pct_30d: number;
  return_pct_7d: number;
  return_pct_24h: number;
  win_rate: number;
  sharpe: number;
  max_drawdown_pct: number;
  trades: number;
  subscribers: number;
  verified: boolean;
}

export const MOCK_LEADERBOARD: LeaderRow[] = [
  {
    rank: 1,
    strategy_id: "lb_1",
    strategy_name: "MTF Bounce — 4H bias + 15m trigger",
    creator: "@chartmonk",
    symbol: "SOL/USDT",
    timeframe: "15m",
    return_pct_30d: 14.2,
    return_pct_7d: 4.8,
    return_pct_24h: 1.6,
    win_rate: 64.3,
    sharpe: 2.14,
    max_drawdown_pct: 8.1,
    trades: 47,
    subscribers: 218,
    verified: true,
  },
  {
    rank: 2,
    strategy_id: "lb_2",
    strategy_name: "Liquidity Sweep Reversal 4H",
    creator: "@quantfox",
    symbol: "SOL/USDT",
    timeframe: "4h",
    return_pct_30d: 11.7,
    return_pct_7d: 3.2,
    return_pct_24h: -0.4,
    win_rate: 52.9,
    sharpe: 1.42,
    max_drawdown_pct: 12.4,
    trades: 32,
    subscribers: 187,
    verified: true,
  },
  {
    rank: 3,
    strategy_id: "lb_3",
    strategy_name: "BTC Funding Rate Fade",
    creator: "@derivdesk",
    symbol: "BTC/USDT",
    timeframe: "1h",
    return_pct_30d: 9.4,
    return_pct_7d: 2.1,
    return_pct_24h: 0.8,
    win_rate: 58.2,
    sharpe: 1.31,
    max_drawdown_pct: 6.8,
    trades: 84,
    subscribers: 412,
    verified: true,
  },
  {
    rank: 4,
    strategy_id: "lb_4",
    strategy_name: "JUP Breakout Hunter",
    creator: "@solpilled",
    symbol: "JUP/USDT",
    timeframe: "1h",
    return_pct_30d: 8.9,
    return_pct_7d: -1.4,
    return_pct_24h: 0.2,
    win_rate: 41.8,
    sharpe: 0.94,
    max_drawdown_pct: 18.3,
    trades: 62,
    subscribers: 56,
    verified: false,
  },
  {
    rank: 5,
    strategy_id: "lb_5",
    strategy_name: "ETH Mean Reversion 15m",
    creator: "@vwapking",
    symbol: "ETH/USDT",
    timeframe: "15m",
    return_pct_30d: 6.2,
    return_pct_7d: 1.7,
    return_pct_24h: 0.5,
    win_rate: 56.4,
    sharpe: 1.08,
    max_drawdown_pct: 9.2,
    trades: 124,
    subscribers: 89,
    verified: true,
  },
  {
    rank: 6,
    strategy_id: "lb_6",
    strategy_name: "SOL Bounce after -2%",
    creator: "@trade_obsidia",
    symbol: "SOL/USDT",
    timeframe: "15m",
    return_pct_30d: 5.8,
    return_pct_7d: 2.4,
    return_pct_24h: 0.0,
    win_rate: 61.0,
    sharpe: 1.26,
    max_drawdown_pct: 12.4,
    trades: 28,
    subscribers: 142,
    verified: true,
  },
  {
    rank: 7,
    strategy_id: "lb_7",
    strategy_name: "PYTH Volume Squeeze",
    creator: "@oraclefade",
    symbol: "PYTH/USDT",
    timeframe: "30m",
    return_pct_30d: 4.1,
    return_pct_7d: 0.8,
    return_pct_24h: -0.3,
    win_rate: 48.2,
    sharpe: 0.71,
    max_drawdown_pct: 14.7,
    trades: 38,
    subscribers: 31,
    verified: false,
  },
  {
    rank: 8,
    strategy_id: "lb_8",
    strategy_name: "SOL Range Scalper",
    creator: "@scalpgod",
    symbol: "SOL/USDT",
    timeframe: "5m",
    return_pct_30d: 2.7,
    return_pct_7d: -0.6,
    return_pct_24h: 0.1,
    win_rate: 59.8,
    sharpe: 0.62,
    max_drawdown_pct: 7.4,
    trades: 287,
    subscribers: 67,
    verified: true,
  },
  {
    rank: 9,
    strategy_id: "lb_9",
    strategy_name: "BTC Engulfing 4H",
    creator: "@candlepatterns",
    symbol: "BTC/USDT",
    timeframe: "4h",
    return_pct_30d: 1.3,
    return_pct_7d: 0.4,
    return_pct_24h: 0.6,
    win_rate: 44.1,
    sharpe: 0.28,
    max_drawdown_pct: 11.2,
    trades: 21,
    subscribers: 24,
    verified: false,
  },
  {
    rank: 10,
    strategy_id: "lb_10",
    strategy_name: "MOVE Momentum",
    creator: "@trendrider",
    symbol: "JUP/USDT",
    timeframe: "1h",
    return_pct_30d: -3.2,
    return_pct_7d: -1.1,
    return_pct_24h: -0.2,
    win_rate: 38.4,
    sharpe: -0.41,
    max_drawdown_pct: 22.6,
    trades: 53,
    subscribers: 12,
    verified: false,
  },
];

export interface CreatorRow {
  rank: number;
  handle: string;
  strategies_count: number;
  avg_return_30d: number;
  total_subscribers: number;
  total_aum_usd: number;
  verified: boolean;
}

export const MOCK_CREATORS: CreatorRow[] = [
  {
    rank: 1,
    handle: "@chartmonk",
    strategies_count: 4,
    avg_return_30d: 12.4,
    total_subscribers: 384,
    total_aum_usd: 142_300,
    verified: true,
  },
  {
    rank: 2,
    handle: "@quantfox",
    strategies_count: 3,
    avg_return_30d: 9.7,
    total_subscribers: 271,
    total_aum_usd: 96_400,
    verified: true,
  },
  {
    rank: 3,
    handle: "@derivdesk",
    strategies_count: 5,
    avg_return_30d: 7.8,
    total_subscribers: 612,
    total_aum_usd: 218_700,
    verified: true,
  },
  {
    rank: 4,
    handle: "@vwapking",
    strategies_count: 2,
    avg_return_30d: 6.2,
    total_subscribers: 132,
    total_aum_usd: 47_800,
    verified: true,
  },
  {
    rank: 5,
    handle: "@trade_obsidia",
    strategies_count: 3,
    avg_return_30d: 5.4,
    total_subscribers: 198,
    total_aum_usd: 71_200,
    verified: true,
  },
];

export const MOCK_MARKETPLACE: MarketplaceStrategy[] = [
  {
    id: "m_1",
    name: "SOL Liquidity Sweep",
    creator: "@quantfox",
    description:
      "Pivot break + trend filter on 4H. Survives 24mo with real Jupiter Perps fees.",
    return_pct_30d: 4.8,
    return_pct_total: 38.2,
    risk_score: 4,
    subscribers: 218,
    price_usd_monthly: 19,
    symbols: ["SOL/USDT"],
    timeframe: "4h",
  },
  {
    id: "m_2",
    name: "BTC Funding Fade",
    creator: "@derivdesk",
    description:
      "Short BTC perps when funding spikes >0.05%/hr. Mean-reverting edge.",
    return_pct_30d: 2.4,
    return_pct_total: 22.1,
    risk_score: 3,
    subscribers: 412,
    price_usd_monthly: 29,
    symbols: ["BTC/USDT"],
    timeframe: "1h",
  },
  {
    id: "m_3",
    name: "Multi-asset MTF Bounce",
    creator: "@chartmonk",
    description:
      "4H S/R bias + 15m structure shift. MTF-aligned, no lookahead.",
    return_pct_30d: 7.1,
    return_pct_total: 51.4,
    risk_score: 6,
    subscribers: 89,
    price_usd_monthly: 49,
    symbols: ["SOL/USDT", "ETH/USDT"],
    timeframe: "15m",
  },
  {
    id: "m_4",
    name: "JUP Breakout Hunter",
    creator: "@solpilled",
    description:
      "Donchian breakout + volume z-score filter. Captures expansion phases.",
    return_pct_30d: -1.2,
    return_pct_total: 12.0,
    risk_score: 7,
    subscribers: 56,
    price_usd_monthly: 19,
    symbols: ["JUP/USDT"],
    timeframe: "1h",
  },
];
