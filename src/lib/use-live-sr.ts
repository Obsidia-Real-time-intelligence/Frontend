"use client";

import { useQuery } from "@tanstack/react-query";
import { detectSr, type Bar, type Timeframe, TF_PARAMS } from "./sr-detector";

const BINANCE_INTERVAL: Record<Timeframe, string> = {
  "15m": "15m",
  "1h":  "1h",
  "4h":  "4h",
  "1d":  "1d",
};

const REFETCH_MS: Record<Timeframe, number> = {
  "15m": 60_000,        // poll every minute; bar closes every 15m
  "1h":  5 * 60_000,
  "4h":  15 * 60_000,
  "1d":  60 * 60_000,
};

function symbolToBinance(symbol: string): string {
  // "SOL/USDT" → "SOLUSDT"
  return symbol.replace("/", "").toUpperCase();
}

async function fetchBinanceKlines(symbol: string, tf: Timeframe): Promise<Bar[]> {
  const interval = BINANCE_INTERVAL[tf];
  const limit = Math.min(1000, TF_PARAMS[tf].lookbackBars);
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbolToBinance(
    symbol
  )}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`binance klines ${res.status}`);
  const raw = (await res.json()) as Array<
    [number, string, string, string, string, string, ...unknown[]]
  >;
  return raw.map(([openTimeMs, open, high, low, close]) => ({
    time: Math.floor(openTimeMs / 1000),
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
  }));
}

/**
 * Live S/R levels computed in the browser from Binance klines.
 * Returns the same shape as the legacy `sr_zones` Supabase rows so it can
 * be passed straight into <SrList />. The polarity flip + internal/external
 * classification happens at display time using the live tick price.
 */
export interface LiveSrZone {
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

export function useLiveSr(symbol: string, timeframe: Timeframe) {
  return useQuery<LiveSrZone[]>({
    queryKey: ["live-sr", symbol, timeframe],
    queryFn: async () => {
      const bars = await fetchBinanceKlines(symbol, timeframe);
      const zones = detectSr(bars, timeframe);
      const computedAt = new Date().toISOString();
      return zones.map((z, i) => ({
        id: `${symbol}-${timeframe}-${i}`,
        symbol,
        timeframe,
        kind: z.kind,
        center: z.center,
        low: z.low,
        high: z.high,
        touches: z.touches,
        score: z.score,
        computed_at: computedAt,
      }));
    },
    staleTime: REFETCH_MS[timeframe] / 2,
    refetchInterval: REFETCH_MS[timeframe],
    refetchOnWindowFocus: true,
  });
}
