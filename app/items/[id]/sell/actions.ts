"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function logSale(itemId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const quantity = formData.get("quantity") as string;
  const unitPrice = formData.get("unitPrice") as string;
  const soldAt = formData.get("soldAt") as string;

  const { error } = await supabase.from("sales").insert({
    user_id: user.id,
    item_id: itemId,
    quantity,
    unit_price: unitPrice,
    sold_at: soldAt,
  });

  if (error) {
    redirect(`/items/${itemId}/sell?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/items");
}
