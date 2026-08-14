"use server";

import { redirect } from "next/navigation";
import { requireHousehold } from "@/lib/household";

export async function addTransaction(formData: FormData) {
  const { supabase, user, household } = await requireHousehold();

  const categoryId = formData.get("categoryId") as string;
  const amount = formData.get("amount") as string;
  const date = formData.get("date") as string;
  const description =
    (formData.get("description") as string)?.trim() || null;

  const { data: category } = await supabase
    .from("categories")
    .select("type")
    .eq("id", categoryId)
    .eq("household_id", household.id)
    .single();

  if (!category) {
    redirect(
      `/transactions/new?error=${encodeURIComponent("Pick a category")}`
    );
  }

  const { error } = await supabase.from("transactions").insert({
    household_id: household.id,
    category_id: categoryId,
    added_by_user_id: user.id,
    amount,
    type: category.type,
    description,
    date,
  });

  if (error) {
    redirect(`/transactions/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/transactions");
}
