"use client";

import { useEffect, useId, useRef } from "react";

interface TVWidgetProps {
  /** TradingView symbol, e.g. "BINANCE:SOLUSDT" */
  symbol: string;
  /** TradingView interval: "1","5","15","60","240","D" */
  interval?: string;
  height?: number;
}

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

export function TVWidget({
  symbol,
  interval = "15",
  height = 480,
}: TVWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const containerId = `tv_${reactId}`;

  useEffect(() => {
    let cancelled = false;

    function mount() {
      if (cancelled || !containerRef.current || !window.TradingView?.widget) return;
      // eslint-disable-next-line new-cap
      new window.TradingView.widget({
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
    }

    if (window.TradingView?.widget) {
      mount();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = mount;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol, interval, containerId]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      style={{ height }}
      className="w-full rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]"
    />
  );
}
