const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";
let scriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => { remove?: () => void };
    };
  }
}

/**
 * Load tv.js once per page. Repeated calls return the same promise — never
 * appends multiple <script> tags, even under React StrictMode.
 */
export function loadTVScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.TradingView?.widget) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TV_SCRIPT_SRC}"]`
    );
    if (existing) {
      if (window.TradingView?.widget) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("tv-load")), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.src = TV_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("tv-load"));
    document.head.appendChild(s);
  });

  return scriptPromise;
}
