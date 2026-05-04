/**
 * Live price WebSocket hook — Coinbase Exchange feed (works from any region).
 *
 * Subscribes to the `ticker` channel for the given symbols, exposes the
 * latest price + 24h change + 24h volume. Reconnects automatically.
 *
 * Coinbase symbol format: "SOL-USD", "BTC-USD". We accept Binance-style
 * "SOL/USDT" too and remap.
 */
"use client";

import { useEffect, useState, useRef } from "react";

const WS_URL = "wss://ws-feed.exchange.coinbase.com";

export interface Tick {
  symbol: string;       // canonical (e.g. "SOL/USDT")
  price: number;
  open_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  change_24h_pct: number;
  ts: number;
}

const SYMBOL_MAP: Record<string, string> = {
  "SOL/USDT": "SOL-USD",
  "BTC/USDT": "BTC-USD",
  "ETH/USDT": "ETH-USD",
  "JUP/USDT": "JUP-USD",
  "PYTH/USDT": "PYTH-USD",
  "SOL/USD": "SOL-USD",
  "BTC/USD": "BTC-USD",
  "ETH/USD": "ETH-USD",
};

const REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(SYMBOL_MAP).map(([k, v]) => [v, k])
);

function toCoinbase(symbol: string): string {
  return SYMBOL_MAP[symbol] ?? symbol.replace("/", "-").replace("USDT", "USD");
}

function toCanonical(coinbaseId: string): string {
  return REVERSE[coinbaseId] ?? coinbaseId.replace("-USD", "/USDT");
}

/**
 * Subscribe to live ticks for one or more symbols. Returns a map keyed by
 * canonical symbol. Reconnects on drop.
 */
export function useLivePrices(symbols: string[]): Record<string, Tick> {
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (typeof window === "undefined" || symbols.length === 0) return;

    const ids = symbols.map(toCoinbase);
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

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
          const msg = JSON.parse(event.data);
          if (msg.type !== "ticker" || !msg.product_id) return;
          const canonical = toCanonical(msg.product_id);
          const price = parseFloat(msg.price);
          const open24 = parseFloat(msg.open_24h);
          const tick: Tick = {
            symbol: canonical,
            price,
            open_24h: open24,
            volume_24h: parseFloat(msg.volume_24h),
            high_24h: parseFloat(msg.high_24h),
            low_24h: parseFloat(msg.low_24h),
            change_24h_pct: open24 > 0 ? ((price - open24) / open24) * 100 : 0,
            ts: Date.now(),
          };
          setTicks((prev) => ({ ...prev, [canonical]: tick }));
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (closed) return;
        // Reconnect with backoff
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [symbolsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return ticks;
}

/** Convenience wrapper for a single symbol. */
export function useLivePrice(symbol: string): Tick | null {
  const ticks = useLivePrices([symbol]);
  return ticks[symbol] ?? null;
}
