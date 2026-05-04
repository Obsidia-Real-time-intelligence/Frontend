"use client";

import { useEffect, useId } from "react";
import { loadTVScript } from "@/lib/tradingview-loader";

interface TVAdvancedProps {
  symbol: string;
  interval?: string;
  height?: number;
  studies?: string[];
}

const DEFAULT_STUDIES = ["BB@tv-basicstudies", "RSI@tv-basicstudies"];

export function TVAdvanced({
  symbol,
  interval = "15",
  height = 580,
  studies = DEFAULT_STUDIES,
}: TVAdvancedProps) {
  const reactId = useId().replace(/:/g, "");
  const containerId = `tva_${reactId}`;
  const studiesKey = studies.join(",");

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
          backgroundColor: "#0B0F14",
          gridColor: "#1F2630",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          withdateranges: true,
          details: false,
          studies: studiesKey.split(","),
          container_id: containerId,
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
  }, [symbol, interval, containerId, studiesKey]);

  return (
    <div
      id={containerId}
      style={{ height }}
      className="w-full overflow-hidden"
    />
  );
}
