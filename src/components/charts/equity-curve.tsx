"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Point {
  t: string;
  equity: number;
}

interface EquityCurveProps {
  data: Point[];
  height?: number;
  /** brand = violet primary (default) | green = success | red = danger */
  tone?: "brand" | "green" | "red" | "blue";
}

const TONE = {
  brand: { stroke: "#A855F7", fill: "#A855F7" }, // violet — matches logo
  blue: { stroke: "#A855F7", fill: "#A855F7" },  // alias for older callers
  green: { stroke: "#22C55E", fill: "#22C55E" },
  red: { stroke: "#EF4444", fill: "#EF4444" },
};

export function EquityCurve({
  data,
  height = 280,
  tone = "brand",
}: EquityCurveProps) {
  const colors = TONE[tone];
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.fill} stopOpacity={0.25} />
              <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1F2630" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            cursor={{ stroke: "#2A3340", strokeWidth: 1 }}
            contentStyle={{
              background: "#11161C",
              border: "1px solid #1F2630",
              borderRadius: 6,
              fontSize: 12,
              color: "#E6EDF3",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#9BA3AF", fontSize: 10 }}
            formatter={(v: number) => [`$${v.toLocaleString()}`, "Equity"]}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={colors.stroke}
            strokeWidth={1.5}
            fill={`url(#grad-${tone})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
