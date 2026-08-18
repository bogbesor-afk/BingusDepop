import { SupabaseClient } from "@supabase/supabase-js";

export type MonthlyPoint = {
  label: string;
  revenue: number;
  spent: number;
};

export type StockLevel = { name: string; stock: number };

export type ForecastPoint = {
  label: string;
  revenue?: number;
  profit?: number;
  projectedProfit?: number;
};

export type RestockSuggestion = {
  id: string;
  name: string;
  stock: number;
  leadTimeDays: number;
  dailyVelocity: number;
  daysLeft: number;
  suggestedQty: number;
  suggestedCost: number;
  affordable: boolean;
};

export type DashboardData = {
  totalRevenue: number;
  totalSpent: number;
  cashProfit: number;
  inventoryValue: number;
  monthly: MonthlyPoint[];
  stockLevels: StockLevel[];
  forecast: ForecastPoint[];
  estimatedNextMonthRevenue: number;
  estimatedNextMonthProfit: number;
  restockSuggestions: RestockSuggestion[];
};

function monthLabel(dateStr: string) {
  const [year, month] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  });
}

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  const [{ data: items }, { data: purchases }, { data: sales }] =
    await Promise.all([
      supabase
        .from("items")
        .select("id, name, cost_per_unit, lead_time_days")
        .eq("user_id", userId),
      supabase
        .from("purchases")
        .select("item_id, quantity, unit_cost, purchased_at")
        .eq("user_id", userId),
      supabase
        .from("sales")
        .select("item_id, quantity, unit_price, sold_at")
        .eq("user_id", userId),
    ]);

  const itemList = items ?? [];
  const purchaseList = purchases ?? [];
  const saleList = sales ?? [];

  const totalRevenue = saleList.reduce(
    (sum, s) => sum + s.quantity * Number(s.unit_price),
    0
  );
  const totalSpent = purchaseList.reduce(
    (sum, p) => sum + p.quantity * Number(p.unit_cost),
    0
  );
  const cashProfit = totalRevenue - totalSpent;

  const stockByItem = new Map<string, number>();
  const soldLast30ByItem = new Map<string, number>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  for (const item of itemList) {
    stockByItem.set(item.id, 0);
    soldLast30ByItem.set(item.id, 0);
  }
  for (const p of purchaseList) {
    stockByItem.set(p.item_id, (stockByItem.get(p.item_id) ?? 0) + p.quantity);
  }
  for (const s of saleList) {
    stockByItem.set(s.item_id, (stockByItem.get(s.item_id) ?? 0) - s.quantity);
    if (s.sold_at >= thirtyDaysAgoStr) {
      soldLast30ByItem.set(
        s.item_id,
        (soldLast30ByItem.get(s.item_id) ?? 0) + s.quantity
      );
    }
  }

  const inventoryValue = itemList.reduce(
    (sum, item) =>
      sum + (stockByItem.get(item.id) ?? 0) * Number(item.cost_per_unit),
    0
  );

  const monthlyMap = new Map<string, MonthlyPoint>();
  for (const p of purchaseList) {
    const key = monthKey(p.purchased_at);
    const point = monthlyMap.get(key) ?? {
      label: monthLabel(p.purchased_at),
      revenue: 0,
      spent: 0,
    };
    point.spent += p.quantity * Number(p.unit_cost);
    monthlyMap.set(key, point);
  }
  for (const s of saleList) {
    const key = monthKey(s.sold_at);
    const point = monthlyMap.get(key) ?? {
      label: monthLabel(s.sold_at),
      revenue: 0,
      spent: 0,
    };
    point.revenue += s.quantity * Number(s.unit_price);
    monthlyMap.set(key, point);
  }
  const sortedMonthKeys = [...monthlyMap.keys()].sort((a, b) =>
    a.localeCompare(b)
  );
  const monthly = sortedMonthKeys.slice(-6).map((k) => monthlyMap.get(k)!);

  const stockLevels: StockLevel[] = itemList.map((item) => ({
    name: item.name,
    stock: stockByItem.get(item.id) ?? 0,
  }));

  // Simple linear-trend forecast: project the next 3 months' profit forward
  // from the average month-over-month change in recent actual profit.
  // Clearly labeled "Projected" in the UI — this is not a real ML forecast.
  const actualProfitSeries = monthly.map((m) => m.revenue - m.spent);
  let trendPerMonth = 0;
  if (actualProfitSeries.length >= 2) {
    trendPerMonth =
      (actualProfitSeries[actualProfitSeries.length - 1] -
        actualProfitSeries[0]) /
      (actualProfitSeries.length - 1);
  }
  const lastProfit =
    actualProfitSeries.length > 0
      ? actualProfitSeries[actualProfitSeries.length - 1]
      : 0;

  const forecast: ForecastPoint[] = monthly.map((m, i) => ({
    label: m.label,
    revenue: m.revenue,
    profit: actualProfitSeries[i],
    projectedProfit: i === monthly.length - 1 ? actualProfitSeries[i] : undefined,
  }));

  const now = new Date();
  const futureMonths = 3;
  for (let i = 1; i <= futureMonths; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    forecast.push({
      label: futureDate.toLocaleDateString("en-US", { month: "short" }),
      projectedProfit: lastProfit + trendPerMonth * i,
    });
  }

  const estimatedNextMonthProfit =
    monthly.length > 0 ? lastProfit + trendPerMonth : 0;
  const avgMonthlyRevenue =
    monthly.length > 0
      ? monthly.reduce((sum, m) => sum + m.revenue, 0) / monthly.length
      : 0;
  const estimatedNextMonthRevenue = avgMonthlyRevenue;

  const restockSuggestions: RestockSuggestion[] = itemList
    .map((item) => {
      const stock = stockByItem.get(item.id) ?? 0;
      const dailyVelocity = (soldLast30ByItem.get(item.id) ?? 0) / 30;
      const leadTimeDays = item.lead_time_days ?? 14;
      const daysLeft = dailyVelocity > 0 ? stock / dailyVelocity : Infinity;
      const reorderPoint = dailyVelocity * leadTimeDays;
      const targetStock = Math.ceil(dailyVelocity * (leadTimeDays + 30));
      const suggestedQty = Math.max(0, targetStock - stock);
      const suggestedCost = suggestedQty * Number(item.cost_per_unit);
      return {
        id: item.id,
        name: item.name,
        stock,
        leadTimeDays,
        dailyVelocity,
        daysLeft,
        suggestedQty,
        suggestedCost,
        affordable: suggestedCost <= cashProfit,
        _shouldReorder: dailyVelocity > 0 && stock <= reorderPoint && suggestedQty > 0,
      };
    })
    .filter((s) => s._shouldReorder)
    .map(({ _shouldReorder, ...rest }) => rest)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    totalRevenue,
    totalSpent,
    cashProfit,
    inventoryValue,
    monthly,
    stockLevels,
    forecast,
    estimatedNextMonthRevenue,
    estimatedNextMonthProfit,
    restockSuggestions,
  };
}
