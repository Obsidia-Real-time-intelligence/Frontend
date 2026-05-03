import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format USD with sign + 2 decimals */
export function fmtUsd(n: number, signed = false) {
  const formatted = `$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  if (!signed) return formatted;
  return n >= 0 ? `+${formatted}` : `-${formatted}`;
}

/** Format a percentage like +12.34% / -1.23% */
export function fmtPct(n: number, digits = 2) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

/** Compact ago: 3m / 2h / 5d */
export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
