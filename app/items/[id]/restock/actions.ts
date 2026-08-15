"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function logPurchase(itemId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const quantity = formData.get("quantity") as string;
  const unitCost = formData.get("unitCost") as string;
  const purchasedAt = formData.get("purchasedAt") as string;

  const { error } = await supabase.from("purchases").insert({
    user_id: user.id,
    item_id: itemId,
    quantity,
    unit_cost: unitCost,
    purchased_at: purchasedAt,
  });

  if (error) {
    redirect(
      `/items/${itemId}/restock?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect("/items");
}
