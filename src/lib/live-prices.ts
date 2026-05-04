/**
 * Live price WebSocket hook — dual-source (Binance primary, Coinbase fallback).
 *
 * Binance reliably streams every major pair we care about. Coinbase is opened
 * after 4s of silence as a safety net (e.g. if Binance is geo-blocked). Both
 * feeds write into the same ticks map, so whichever delivers first wins.
 *
 * Symbol format throughout the app: "SOL/USDT". The hook handles all remapping.
 */
"use client";

import { useEffect, useState } from "react";

const BINANCE_WS = "wss://stream.binance.com:9443/stream";
const COINBASE_WS = "wss://ws-feed.exchange.coinbase.com";
const FALLBACK_DELAY_MS = 4000;

export interface Tick {
  symbol: string;
  price: number;
  open_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  change_24h_pct: number;
  ts: number;
}

const COINBASE_MAP: Record<string, string> = {
  "SOL/USDT": "SOL-USD",
  "BTC/USDT": "BTC-USD",
  "ETH/USDT": "ETH-USD",
  "JUP/USDT": "JUP-USD",
  "PYTH/USDT": "PYTH-USD",
  "SOL/USD": "SOL-USD",
  "BTC/USD": "BTC-USD",
  "ETH/USD": "ETH-USD",
};
const COINBASE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(COINBASE_MAP).map(([k, v]) => [v, k])
);

function toBinance(symbol: string): string {
  // "SOL/USDT" → "solusdt"
  return symbol.replace("/", "").toLowerCase();
}
function fromBinance(s: string): string {
  // "SOLUSDT" → "SOL/USDT"
  const upper = s.toUpperCase();
  if (upper.endsWith("USDT")) return `${upper.slice(0, -4)}/USDT`;
  if (upper.endsWith("USD")) return `${upper.slice(0, -3)}/USD`;
  return upper;
}
function toCoinbase(symbol: string): string {
  return (
    COINBASE_MAP[symbol] ?? symbol.replace("/", "-").replace("USDT", "USD")
  );
}
function fromCoinbase(id: string): string {
  return COINBASE_REVERSE[id] ?? id.replace("-USD", "/USDT");
}

export function useLivePrices(symbols: string[]): Record<string, Tick> {
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (typeof window === "undefined" || symbols.length === 0) return;

    let cancelled = false;
    let gotAnyTick = false;
    let binanceWs: WebSocket | null = null;
    let coinbaseWs: WebSocket | null = null;
    let binanceRetry: ReturnType<typeof setTimeout> | null = null;
    let coinbaseRetry: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const updateTick = (
      canonical: string,
      price: number,
      open24: number,
      vol: number,
      high: number,
      low: number
    ) => {
      gotAnyTick = true;
      const tick: Tick = {
        symbol: canonical,
        price,
        open_24h: open24,
        volume_24h: vol,
        high_24h: high,
        low_24h: low,
        change_24h_pct: open24 > 0 ? ((price - open24) / open24) * 100 : 0,
        ts: Date.now(),
      };
      setTicks((prev) => ({ ...prev, [canonical]: tick }));
    };

    function connectBinance() {
      const streams = symbols.map((s) => `${toBinance(s)}@ticker`).join("/");
      const url = `${BINANCE_WS}?streams=${streams}`;
      const ws = new WebSocket(url);
      binanceWs = ws;

      ws.onmessage = (event) => {
        try {
          const wrapped = JSON.parse(event.data);
          const m = wrapped.data ?? wrapped;
          if (m.e !== "24hrTicker" || !m.s) return;
          updateTick(
            fromBinance(m.s),
            parseFloat(m.c),
            parseFloat(m.o),
            parseFloat(m.v),
            parseFloat(m.h),
            parseFloat(m.l)
          );
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        binanceRetry = setTimeout(connectBinance, 2000);
      };
      ws.onerror = () => ws.close();
    }

    function connectCoinbase() {
      const ids = symbols.map(toCoinbase);
      const ws = new WebSocket(COINBASE_WS);
      coinbaseWs = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "subscribe",
            product_ids: ids,
            channels: ["ticker"],
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const m = JSON.parse(event.data);
          if (m.type !== "ticker" || !m.product_id) return;
          updateTick(
            fromCoinbase(m.product_id),
            parseFloat(m.price),
            parseFloat(m.open_24h),
            parseFloat(m.volume_24h),
            parseFloat(m.high_24h),
            parseFloat(m.low_24h)
          );
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        coinbaseRetry = setTimeout(connectCoinbase, 2000);
      };
      ws.onerror = () => ws.close();
    }

    // Open Binance immediately. If no tick lands within FALLBACK_DELAY_MS,
    // also open Coinbase as a redundant feed.
    connectBinance();
    fallbackTimer = setTimeout(() => {
      if (!cancelled && !gotAnyTick) connectCoinbase();
    }, FALLBACK_DELAY_MS);

    return () => {
      cancelled = true;
      if (binanceRetry) clearTimeout(binanceRetry);
      if (coinbaseRetry) clearTimeout(coinbaseRetry);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      binanceWs?.close();
      coinbaseWs?.close();
    };
  }, [symbolsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return ticks;
}

export function useLivePrice(symbol: string): Tick | null {
  const ticks = useLivePrices([symbol]);
  return ticks[symbol] ?? null;
}
