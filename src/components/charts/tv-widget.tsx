"use client";

import { useEffect, useId } from "react";
import { loadTVScript } from "@/lib/tradingview-loader";

interface TVWidgetProps {
  symbol: string;
  interval?: string;
  height?: number;
}

export function TVWidget({
  symbol,
  interval = "15",
  height = 480,
}: TVWidgetProps) {
  const reactId = useId().replace(/:/g, "");
  const containerId = `tv_${reactId}`;

  useEffect(() => {
    let cancelled = false;
    let widget: { remove?: () => void } | null = null;

    loadTVScript()
      .then(() => {
        if (cancelled || !window.TradingView?.widget) return;
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = "";
        widget = new window.TradingView.widget({
          autosize: true,
          symbol,
          interval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0B0F14",
          backgroundColor: "#11161C",
          gridColor: "#1F2630",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          save_image: false,
          container_id: containerId,
          studies: ["RSI@tv-basicstudies"],
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      try {
        widget?.remove?.();
      } catch {
        // widget may already be detached
      }
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = "";
    };
  }, [symbol, interval, containerId]);

  return (
    <div
      id={containerId}
      style={{ height }}
      className="w-full rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]"
    />
  );
}
