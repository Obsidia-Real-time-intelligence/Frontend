/**
 * Internal vs external S/R classification (ICT / Smart-Money style).
 *
 * Stored `kind` in sr_zones reflects the pivot type at formation (pivot high
 * → "resistance", pivot low → "support"). After a breakout polarity flips,
 * so we reclassify against the live price first.
 *
 * Then within each side:
 *   - External resistance = highest level above price (the macro ceiling)
 *   - External support    = lowest level below price (the macro floor)
 *   - Everything else is Internal — pivots inside the macro range.
 *
 * Display order is ceiling → floor: external R, internal Rs (highest first),
 * internal Ss (highest first), external S. Reading top-to-bottom matches a
 * vertical price ladder, which is what traders expect.
 */

export type SrSide = "resistance" | "support";
export type SrScope = "external" | "internal";

export interface SrInput {
  center: number | string;
  kind: string;
  touches: number;
}

export interface SrClassified<T extends SrInput> {
  row: T;
  side: SrSide;
  scope: SrScope;
  /** Signed % distance from current price. Positive = above. */
  distancePct: number;
}

export function classifySr<T extends SrInput>(
  zones: T[],
  currentPrice: number | undefined
): SrClassified<T>[] {
  if (!currentPrice || zones.length === 0) return [];

  const withSide = zones.map((row) => {
    const center = Number(row.center);
    const side: SrSide = center >= currentPrice ? "resistance" : "support";
    const distancePct = ((center - currentPrice) / currentPrice) * 100;
    return { row, side, distancePct, center };
  });

  const resistances = withSide
    .filter((z) => z.side === "resistance")
    .sort((a, b) => a.center - b.center); // ascending: closest to price first
  const supports = withSide
    .filter((z) => z.side === "support")
    .sort((a, b) => b.center - a.center); // descending: closest to price first

  // External = the furthest level on each side (the boundary).
  const extResIdx = resistances.length - 1;
  const extSupIdx = supports.length - 1;

  const classified: SrClassified<T>[] = [];

  // External R at top
  if (extResIdx >= 0)
    classified.push({
      row: resistances[extResIdx].row,
      side: "resistance",
      scope: "external",
      distancePct: resistances[extResIdx].distancePct,
    });

  // Internal Rs, highest first (still descending from external toward price)
  for (let i = extResIdx - 1; i >= 0; i--)
    classified.push({
      row: resistances[i].row,
      side: "resistance",
      scope: "internal",
      distancePct: resistances[i].distancePct,
    });

  // Internal Ss, closest to price first (highest-priced support first)
  for (let i = 0; i < extSupIdx; i++)
    classified.push({
      row: supports[i].row,
      side: "support",
      scope: "internal",
      distancePct: supports[i].distancePct,
    });

  // External S at bottom
  if (extSupIdx >= 0)
    classified.push({
      row: supports[extSupIdx].row,
      side: "support",
      scope: "external",
      distancePct: supports[extSupIdx].distancePct,
    });

  return classified;
}
