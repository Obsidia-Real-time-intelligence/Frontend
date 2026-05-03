"use client";

import { useEffect, useId, useRef } from "react";

interface TVAdvancedProps {
  /** TradingView symbol, e.g. "BINANCE:SOLUSDT" */
  symbol: string;
  /** "1","5","15","30","60","240","D" */
  interval?: string;
  height?: number;
  /** Optional list of indicator IDs (TV studies). */
  studies?: string[];
}

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

/**
 * TradingView Advanced Charts embed — full toolbar, indicators, drawing tools.
 * Themed to match the Obsidia palette.
 */
export function TVAdvanced({
  symbol,
  interval = "15",
  height = 580,
  studies = [
    "BB@tv-basicstudies",
    "RSI@tv-basicstudies",
  ],
}: TVAdvancedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // useId is hydration-safe — same value on server and client.
  // Strip colons because TradingView treats them as CSS selectors.
  const reactId = useId().replace(/:/g, "");
  const containerId = `tva_${reactId}`;

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
        style: "1", // candles
        locale: "en",
        toolbar_bg: "#0B0F14",
        backgroundColor: "#0B0F14",
        gridColor: "#1F2630",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        withdateranges: true,
        details: false,
        studies,
        container_id: containerId,
        // Color overrides to match Obsidia
        overrides: {
          "paneProperties.background": "#0B0F14",
          "paneProperties.backgroundType": "solid",
          "paneProperties.vertGridProperties.color": "#1F2630",
          "paneProperties.horzGridProperties.color": "#1F2630",
          "scalesProperties.lineColor": "#1F2630",
          "scalesProperties.textColor": "#9BA3AF",
          "mainSeriesProperties.candleStyle.upColor": "#22C55E",
          "mainSeriesProperties.candleStyle.downColor": "#EF4444",
          "mainSeriesProperties.candleStyle.borderUpColor": "#22C55E",
          "mainSeriesProperties.candleStyle.borderDownColor": "#EF4444",
          "mainSeriesProperties.candleStyle.wickUpColor": "#22C55E",
          "mainSeriesProperties.candleStyle.wickDownColor": "#EF4444",
        },
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
  }, [symbol, interval, containerId, studies]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      style={{ height }}
      className="w-full overflow-hidden"
    />
  );
}
