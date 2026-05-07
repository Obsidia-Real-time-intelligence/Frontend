/**
 * Client-side S/R detector — port of obsidia-backend/src/sr_detector.py.
 *
 * Algorithm:
 *   1. find_pivots: a bar is a pivot high if its high beats the n bars on
 *      either side; pivot low symmetric. Wider n → fewer, more significant
 *      pivots.
 *   2. cluster: collapse pivots within tol_pct% of each other into a single
 *      zone. The cluster's center is the mean of its constituent prices.
 *   3. score: touches × (0.5 + 0.3·recency + 0.2·tightness) — favors zones
 *      that were touched recently and are tightly grouped.
 *
 * Kept pure (no React, no fetch) so it can be reused server-side or tested.
 */

export interface Bar {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = "15m" | "1h" | "4h" | "1d";

interface TfParam {
  pivotN: number;
  tolPct: number;
  minTouches: number;
  lookbackBars: number;
}

export const TF_PARAMS: Record<Timeframe, TfParam> = {
  "15m": { pivotN: 10, tolPct: 0.3, minTouches: 2, lookbackBars: 4000 },
  "1h":  { pivotN: 8,  tolPct: 0.5, minTouches: 2, lookbackBars: 2000 },
  "4h":  { pivotN: 6,  tolPct: 0.8, minTouches: 2, lookbackBars: 1000 },
  "1d":  { pivotN: 4,  tolPct: 1.5, minTouches: 2, lookbackBars: 400 },
};

export interface SrZoneRaw {
  /** Stored kind = pivot type at formation. Frontend `classifySr` reclassifies
   *  this against current price for display. */
  kind: "support" | "resistance";
  center: number;
  low: number;
  high: number;
  touches: number;
  lastTouchBar: number;
  ageBars: number;
  score: number;
}

interface Cluster {
  center: number;
  low: number;
  high: number;
  touches: number;
  lastBar: number;
  prices: number[];
}

function findPivots(bars: Bar[], n: number): { highs: [number, number][]; lows: [number, number][] } {
  const highs: [number, number][] = [];
  const lows: [number, number][] = [];
  for (let i = n; i < bars.length - n; i++) {
    const cur = bars[i];
    let isHigh = true;
    let isLow = true;
    for (let j = i - n; j <= i + n && (isHigh || isLow); j++) {
      if (j === i) continue;
      if (bars[j].high >= cur.high) isHigh = false;
      if (bars[j].low <= cur.low) isLow = false;
    }
    if (isHigh) highs.push([i, cur.high]);
    if (isLow) lows.push([i, cur.low]);
  }
  return { highs, lows };
}

function cluster(pivots: [number, number][], tolPct: number): Cluster[] {
  const clusters: Cluster[] = [];
  for (const [bar, price] of pivots) {
    let merged = false;
    for (const c of clusters) {
      if ((Math.abs(price - c.center) / c.center) * 100 <= tolPct) {
        c.prices.push(price);
        c.touches += 1;
        c.lastBar = Math.max(c.lastBar, bar);
        c.low = Math.min(c.low, price);
        c.high = Math.max(c.high, price);
        c.center = c.prices.reduce((a, b) => a + b, 0) / c.prices.length;
        merged = true;
        break;
      }
    }
    if (!merged) {
      clusters.push({
        center: price,
        low: price,
        high: price,
        touches: 1,
        lastBar: bar,
        prices: [price],
      });
    }
  }
  return clusters;
}

function scoreZone(c: Cluster, nBars: number): number {
  const recency = Math.max(0, c.lastBar / nBars); // 0..1, 1 = newest
  const range = (c.high - c.low) / c.center;
  const tightness = Math.max(0, 1 - range * 100); // tighter = closer to 1
  return c.touches * (0.5 + 0.3 * recency + 0.2 * tightness);
}

export function detectSr(bars: Bar[], timeframe: Timeframe): SrZoneRaw[] {
  const p = TF_PARAMS[timeframe];
  const sliced = bars.slice(-p.lookbackBars);
  const n = sliced.length;
  const { highs, lows } = findPivots(sliced, p.pivotN);

  const out: SrZoneRaw[] = [];
  for (const [kind, clusters] of [
    ["resistance", cluster(highs, p.tolPct)],
    ["support", cluster(lows, p.tolPct)],
  ] as const) {
    for (const c of clusters) {
      if (c.touches < p.minTouches) continue;
      out.push({
        kind,
        center: round4(c.center),
        low: round4(c.low),
        high: round4(c.high),
        touches: c.touches,
        lastTouchBar: c.lastBar,
        ageBars: n - 1 - c.lastBar,
        score: round3(scoreZone(c, n)),
      });
    }
  }
  out.sort((a, b) => b.score - a.score || a.center - b.center);
  return out;
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}
function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}
