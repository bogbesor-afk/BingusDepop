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

const gridColor = "#e5e5e5";
const textColor = "#737373";
const sage = "#8A9A5B";
const darkGreen = "#3B4A3B";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: 6,
  fontSize: 12,
  color: "#171717",
};

export function TrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke={textColor} fontSize={12} />
        <YAxis stroke={textColor} fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={sage}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="spent"
          name="Spent on stock"
          stroke={darkGreen}
          strokeWidth={2}
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
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="stock" name="In stock" fill={sage} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke={textColor} fontSize={12} />
        <YAxis stroke={textColor} fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={sage}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Cash profit"
          stroke={darkGreen}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="projectedProfit"
          name="Projected profit"
          stroke={darkGreen}
          strokeWidth={2}
          strokeDasharray="5 5"
          strokeOpacity={0.6}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
