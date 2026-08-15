import { SupabaseClient } from "@supabase/supabase-js";

export type MonthlyPoint = {
  label: string;
  revenue: number;
  spent: number;
};

export type StockLevel = { name: string; stock: number };
export type TopSeller = { name: string; revenue: number };

export type RestockSuggestion = {
  id: string;
  name: string;
  stock: number;
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
  topSellers: TopSeller[];
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
        .select("id, name, cost_per_unit")
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
  const revenueByItem = new Map<string, number>();
  const soldLast30ByItem = new Map<string, number>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  for (const item of itemList) {
    stockByItem.set(item.id, 0);
    revenueByItem.set(item.id, 0);
    soldLast30ByItem.set(item.id, 0);
  }
  for (const p of purchaseList) {
    stockByItem.set(p.item_id, (stockByItem.get(p.item_id) ?? 0) + p.quantity);
  }
  for (const s of saleList) {
    stockByItem.set(s.item_id, (stockByItem.get(s.item_id) ?? 0) - s.quantity);
    revenueByItem.set(
      s.item_id,
      (revenueByItem.get(s.item_id) ?? 0) + s.quantity * Number(s.unit_price)
    );
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
  const monthly = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, point]) => point);

  const stockLevels: StockLevel[] = itemList.map((item) => ({
    name: item.name,
    stock: stockByItem.get(item.id) ?? 0,
  }));

  const topSellers: TopSeller[] = itemList
    .map((item) => ({
      name: item.name,
      revenue: revenueByItem.get(item.id) ?? 0,
    }))
    .filter((t) => t.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const restockSuggestions: RestockSuggestion[] = itemList
    .map((item) => {
      const stock = stockByItem.get(item.id) ?? 0;
      const dailyVelocity = (soldLast30ByItem.get(item.id) ?? 0) / 30;
      const daysLeft = dailyVelocity > 0 ? stock / dailyVelocity : Infinity;
      const targetStock = Math.ceil(dailyVelocity * 30);
      const suggestedQty = Math.max(0, targetStock - stock);
      const suggestedCost = suggestedQty * Number(item.cost_per_unit);
      return {
        id: item.id,
        name: item.name,
        stock,
        dailyVelocity,
        daysLeft,
        suggestedQty,
        suggestedCost,
        affordable: suggestedCost <= cashProfit,
      };
    })
    .filter((s) => s.dailyVelocity > 0 && s.daysLeft < 14 && s.suggestedQty > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    totalRevenue,
    totalSpent,
    cashProfit,
    inventoryValue,
    monthly,
    stockLevels,
    topSellers,
    restockSuggestions,
  };
}
