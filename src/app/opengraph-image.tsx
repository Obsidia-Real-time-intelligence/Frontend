import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Obsidia — The honest backtester for Solana traders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0B0F14",
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(168, 85, 247, 0.25), transparent 60%)," +
            "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(217, 70, 239, 0.15), transparent 60%)",
          padding: "80px",
          color: "#E6EDF3",
          fontFamily: "Inter, system-ui",
        }}
      >
        {/* Top row — logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#A855F7",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ◆
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
            Obsidia
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            The honest backtester
            <br />
            for Solana traders.
          </div>

          <div
            style={{
              fontSize: 26,
              color: "#9BA3AF",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            5 years of data · real Jupiter Perps fees · no-lookahead MTF · open source.
          </div>

          {/* Trust strip */}
          <div
            style={{
              display: "flex",
              gap: 32,
              fontSize: 16,
              color: "#9BA3AF",
              marginTop: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#22C55E" }}>●</span> 5yr × 6 timeframes
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#22C55E" }}>●</span> 0.14% RT fees baked in
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#22C55E" }}>●</span> AI co-pilot
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#22C55E" }}>●</span> obsidia.fi
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
