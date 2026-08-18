"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function addItem(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = (formData.get("name") as string).trim();
  const costPerUnit = formData.get("costPerUnit") as string;
  const salePriceDefault = formData.get("salePriceDefault") as string;
  const leadTimeDays = formData.get("leadTimeDays") as string;

  if (!name || !salePriceDefault) {
    redirect(
      `/items/new?error=${encodeURIComponent(
        "Enter a name and a sale price — the sale price is used so Log Sale can be a single click"
      )}`
    );
  }

  const { error } = await supabase.from("items").insert({
    user_id: user.id,
    name,
    cost_per_unit: costPerUnit || 0,
    sale_price_default: salePriceDefault,
    lead_time_days: leadTimeDays || 14,
  });

  if (error) {
    redirect(`/items/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/items");
}
