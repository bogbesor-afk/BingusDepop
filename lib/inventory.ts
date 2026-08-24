import { SupabaseClient } from "@supabase/supabase-js";

export type ItemStock = {
  id: string;
  name: string;
  cost_per_unit: number;
  sale_price_default: number | null;
  image_url: string | null;
  purchased: number;
  sold: number;
  stock: number;
  totalCost: number;
  totalRevenue: number;
};

export async function getItemsWithStock(
  supabase: SupabaseClient,
  userId: string
): Promise<ItemStock[]> {
  const [{ data: items }, { data: purchases }, { data: sales }] =
    await Promise.all([
      supabase
        .from("items")
        .select("id, name, cost_per_unit, sale_price_default, image_url")
        .eq("user_id", userId)
        .order("name"),
      supabase
        .from("purchases")
        .select("item_id, quantity, unit_cost")
        .eq("user_id", userId),
      supabase
        .from("sales")
        .select("item_id, quantity, unit_price")
        .eq("user_id", userId),
    ]);

  return (items ?? []).map((item) => {
    const itemPurchases = (purchases ?? []).filter(
      (p) => p.item_id === item.id
    );
    const itemSales = (sales ?? []).filter((s) => s.item_id === item.id);

    const purchased = itemPurchases.reduce((sum, p) => sum + p.quantity, 0);
    const sold = itemSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalCost = itemPurchases.reduce(
      (sum, p) => sum + p.quantity * Number(p.unit_cost),
      0
    );
    const totalRevenue = itemSales.reduce(
      (sum, s) => sum + s.quantity * Number(s.unit_price),
      0
    );

    return {
      id: item.id,
      name: item.name,
      cost_per_unit: Number(item.cost_per_unit),
      sale_price_default:
        item.sale_price_default != null
          ? Number(item.sale_price_default)
          : null,
      image_url: item.image_url ?? null,
      purchased,
      sold,
      stock: purchased - sold,
      totalCost,
      totalRevenue,
    };
  });
}
