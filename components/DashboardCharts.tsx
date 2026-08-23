"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { MonthlyPoint, StockLevel, ForecastPoint } from "@/lib/dashboard";

const gridColor = "#d4d4d4";
const textColor = "#404040";
const sage = "#8A9A5B";
const darkGreen = "#3B4A3B";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #d4d4d4",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  color: "#171717",
};

const legendStyle = { fontSize: 12, fontWeight: 600, color: textColor };

export function TrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          stroke={textColor}
          fontSize={12}
          fontWeight={600}
        />
        <YAxis stroke={textColor} fontSize={12} fontWeight={600} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={legendStyle} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={sage}
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="spent"
          name="Spent on Stock"
          stroke={darkGreen}
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StockChart({ data }: { data: StockLevel[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke={textColor}
          fontSize={11}
          fontWeight={600}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          stroke={textColor}
          fontSize={12}
          fontWeight={600}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="stock" name="In Stock" fill={sage} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          stroke={textColor}
          fontSize={12}
          fontWeight={600}
        />
        <YAxis stroke={textColor} fontSize={12} fontWeight={600} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={legendStyle} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={sage}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Cash Profit"
          stroke={darkGreen}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="projectedProfit"
          name="Projected Profit"
          stroke={darkGreen}
          strokeWidth={2.5}
          strokeDasharray="5 5"
          strokeOpacity={0.6}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
