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
  // Asymmetric right-edge handling: a bar qualifies as a pivot if it beats
  // the `n` bars to its left AND all available bars to its right (even if
  // that's < n at the right edge). Without this, the last `n` bars can
  // never form a pivot — so a fresh swing high never shows up as resistance
  // until it's already in the rear-view mirror. We still require ≥1 right
  // neighbor (the very last bar can't be a pivot since there's nothing
  // ahead of it yet).
  for (let i = n; i < bars.length - 1; i++) {
    const cur = bars[i];
    const rightWindow = Math.min(n, bars.length - 1 - i);
    let isHigh = true;
    let isLow = true;
    // Strict on the left: must strictly beat the n bars before it.
    for (let j = i - n; j < i && (isHigh || isLow); j++) {
      if (bars[j].high >= cur.high) isHigh = false;
      if (bars[j].low <= cur.low) isLow = false;
    }
    // Right side allows ties (≥), so a still-forming pivot near the edge
    // doesn't get disqualified by an equal-high candle ahead of it.
    for (let j = i + 1; j <= i + rightWindow && (isHigh || isLow); j++) {
      if (bars[j].high > cur.high) isHigh = false;
      if (bars[j].low < cur.low) isLow = false;
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
  if (n === 0) return [];

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

  // Range anchors: when price is trending into fresh highs/lows, no pivot
  // confirms above/below current price even though traders clearly see
  // the recent extreme as resistance/support. Always include the range
  // high and range low over the lookback window as anchor zones, unless
  // an existing pivot zone already sits within tol_pct of them.
  let rangeHi = sliced[0].high;
  let rangeHiBar = 0;
  let rangeLo = sliced[0].low;
  let rangeLoBar = 0;
  for (let i = 1; i < n; i++) {
    if (sliced[i].high > rangeHi) {
      rangeHi = sliced[i].high;
      rangeHiBar = i;
    }
    if (sliced[i].low < rangeLo) {
      rangeLo = sliced[i].low;
      rangeLoBar = i;
    }
  }
  const anchorHigh: SrZoneRaw = {
    kind: "resistance",
    center: round4(rangeHi),
    low: round4(rangeHi),
    high: round4(rangeHi),
    touches: 1,
    lastTouchBar: rangeHiBar,
    ageBars: n - 1 - rangeHiBar,
    score: round3(scoreZone(
      { center: rangeHi, low: rangeHi, high: rangeHi, touches: 1, lastBar: rangeHiBar, prices: [rangeHi] },
      n
    )),
  };
  const anchorLow: SrZoneRaw = {
    kind: "support",
    center: round4(rangeLo),
    low: round4(rangeLo),
    high: round4(rangeLo),
    touches: 1,
    lastTouchBar: rangeLoBar,
    ageBars: n - 1 - rangeLoBar,
    score: round3(scoreZone(
      { center: rangeLo, low: rangeLo, high: rangeLo, touches: 1, lastBar: rangeLoBar, prices: [rangeLo] },
      n
    )),
  };
  for (const anchor of [anchorHigh, anchorLow]) {
    const dup = out.find(
      (z) =>
        z.kind === anchor.kind &&
        (Math.abs(z.center - anchor.center) / anchor.center) * 100 <= p.tolPct
    );
    if (!dup) out.push(anchor);
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
