"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function logQuickSale(itemId: string) {
  const { supabase, user } = await requireUser();

  const { data: item } = await supabase
    .from("items")
    .select("sale_price_default")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();

  if (!item) {
    redirect("/items");
  }

  await supabase.from("sales").insert({
    user_id: user.id,
    item_id: itemId,
    quantity: 1,
    unit_price: item.sale_price_default ?? 0,
    sold_at: new Date().toISOString().slice(0, 10),
  });

  redirect("/items");
}

export async function deleteItem(itemId: string) {
  const { supabase, user } = await requireUser();

  const { data: item } = await supabase
    .from("items")
    .select("image_url")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();

  await supabase
    .from("items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (item?.image_url) {
    const path = item.image_url.split("/item-photos/")[1];
    if (path) {
      await supabase.storage.from("item-photos").remove([path]);
    }
  }

  redirect("/items");
}
