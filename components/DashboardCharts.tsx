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
import type {
  MonthlyPoint,
  StockLevel,
  TopSeller,
} from "@/lib/dashboard";

const gridColor = "#262626";
const textColor = "#a3a3a3";

export function TrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke={textColor} fontSize={12} />
        <YAxis stroke={textColor} fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #262626",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#34d399"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="spent"
          name="Spent on stock"
          stroke="#f87171"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StockChart({ data }: { data: StockLevel[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
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
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #262626",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="stock" name="In stock" fill="#60a5fa" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopSellersChart({ data }: { data: TopSeller[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis type="number" stroke={textColor} fontSize={12} />
        <YAxis
          dataKey="name"
          type="category"
          stroke={textColor}
          fontSize={11}
          width={110}
        />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #262626",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="revenue" name="Revenue" fill="#34d399" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
