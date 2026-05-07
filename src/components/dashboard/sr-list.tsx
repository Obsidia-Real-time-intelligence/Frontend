"use client";

import { classifySr, type SrInput } from "@/lib/sr";

interface Props<T extends SrInput> {
  zones: T[];
  currentPrice: number | undefined;
  /** Render at most this many rows (externals always counted). */
  maxRows?: number;
  /** Insert a "current price" divider between resistances and supports. */
  showPriceDivider?: boolean;
  size?: "sm" | "md";
}

/**
 * Vertical S/R ladder: external R at top, internal Rs descending toward
 * price, optional current-price divider, internal Ss descending toward
 * external S at bottom. External rows are bright + bold; internals are
 * dimmer so the macro range pops visually.
 */
export function SrList<T extends SrInput>({
  zones,
  currentPrice,
  maxRows = 8,
  showPriceDivider = true,
  size = "sm",
}: Props<T>) {
  const rows = classifySr(zones, currentPrice);
  if (rows.length === 0) {
    return (
      <p className="text-[11px] text-[var(--color-muted-foreground)] py-2">
        Computing — refreshes hourly via worker.
      </p>
    );
  }

  // Truncate while preserving externals — drop from the middle (deepest internals)
  const trimmed = trimPreservingExternals(rows, maxRows);

  // Find the index where supports start, so we can inject the price divider.
  const firstSupportIdx = trimmed.findIndex((r) => r.side === "support");

  const padY = size === "md" ? "py-1.5" : "py-1";
  const priceFontSize = size === "md" ? "text-sm" : "text-xs";

  return (
    <ul className="space-y-1">
      {trimmed.map((row, i) => {
        const node = (
          <li
            key={`${row.scope}-${row.side}-${i}`}
            className={[
              "flex items-center justify-between rounded-md px-2",
              padY,
              row.side === "resistance"
                ? row.scope === "external"
                  ? "bg-[var(--color-danger)]/15 border border-[var(--color-danger)]/30"
                  : "bg-[var(--color-danger)]/5"
                : row.scope === "external"
                  ? "bg-[var(--color-success)]/15 border border-[var(--color-success)]/30"
                  : "bg-[var(--color-success)]/5",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ScopeBadge scope={row.scope} side={row.side} />
              <span
                className={[
                  "tabular",
                  priceFontSize,
                  row.scope === "external" ? "font-semibold" : "font-medium",
                  row.side === "resistance"
                    ? row.scope === "external"
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-danger)]/70"
                    : row.scope === "external"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-success)]/70",
                ].join(" ")}
              >
                ${Number(row.row.center).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] tabular text-[var(--color-muted-foreground)]">
              <span>
                {row.distancePct >= 0 ? "+" : ""}
                {row.distancePct.toFixed(2)}%
              </span>
              <span>×{row.row.touches}</span>
            </div>
          </li>
        );

        if (
          showPriceDivider &&
          firstSupportIdx > 0 &&
          i === firstSupportIdx &&
          currentPrice
        ) {
          return (
            <div key={`group-${i}`}>
              <div className="flex items-center gap-2 px-2 py-1 my-1">
                <div className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="text-[10px] tabular font-semibold text-foreground">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  current
                </span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
              {node}
            </div>
          );
        }
        return node;
      })}
    </ul>
  );
}

function ScopeBadge({
  scope,
  side,
}: {
  scope: "external" | "internal";
  side: "resistance" | "support";
}) {
  const label = `${scope === "external" ? "EXT" : "INT"} ${side[0].toUpperCase()}`;
  const tone =
    side === "resistance" ? "var(--color-danger)" : "var(--color-success)";
  return (
    <span
      className="text-[9px] tabular uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
      style={{
        color: scope === "external" ? tone : `color-mix(in oklab, ${tone} 65%, transparent)`,
        backgroundColor:
          scope === "external"
            ? `color-mix(in oklab, ${tone} 18%, transparent)`
            : `color-mix(in oklab, ${tone} 8%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

function trimPreservingExternals<R extends { scope: "external" | "internal"; side: "resistance" | "support" }>(
  rows: R[],
  max: number
): R[] {
  if (rows.length <= max) return rows;
  // Always keep externals (first + last). Drop the deepest internals from
  // the middle of the ladder, keeping the ones closest to current price on
  // each side so the macro range stays informative.
  const externals = rows.filter((r) => r.scope === "external");
  const internalRs = rows.filter((r) => r.scope === "internal" && r.side === "resistance");
  const internalSs = rows.filter((r) => r.scope === "internal" && r.side === "support");

  const keepInternals = Math.max(0, max - externals.length);
  // Split budget by what's actually available — when one side is empty
  // (e.g. price near range high → no resistances), give the budget to the
  // other side rather than reserving a slot for nothing.
  const totalInternals = internalRs.length + internalSs.length;
  const halfR = totalInternals
    ? Math.min(internalRs.length, Math.round((keepInternals * internalRs.length) / totalInternals))
    : 0;
  const halfS = Math.min(internalSs.length, keepInternals - halfR);

  // internalRs ladder runs furthest→closest to price (top to middle), so
  // closest-to-price internal Rs are at the END.
  const keptRs = internalRs.slice(-halfR);
  // internalSs ladder runs closest→furthest from price, so closest are at the START.
  const keptSs = internalSs.slice(0, halfS);

  const kept = new Set<R>([...externals, ...keptRs, ...keptSs]);
  return rows.filter((r) => kept.has(r));
}
