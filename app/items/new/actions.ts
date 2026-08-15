"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function addItem(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = (formData.get("name") as string).trim();
  const costPerUnit = formData.get("costPerUnit") as string;
  const salePriceDefault = formData.get("salePriceDefault") as string;

  if (!name) {
    redirect(`/items/new?error=${encodeURIComponent("Enter an item name")}`);
  }

  const { error } = await supabase.from("items").insert({
    user_id: user.id,
    name,
    cost_per_unit: costPerUnit || 0,
    sale_price_default: salePriceDefault || null,
  });

  if (error) {
    redirect(`/items/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/items");
}
