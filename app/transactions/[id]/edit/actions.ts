"use server";

import { redirect } from "next/navigation";
import { requireHousehold } from "@/lib/household";

export async function updateTransaction(id: string, formData: FormData) {
  const { supabase, household } = await requireHousehold();

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
      `/transactions/${id}/edit?error=${encodeURIComponent(
        "Pick a category"
      )}`
    );
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      category_id: categoryId,
      amount,
      type: category.type,
      description,
      date,
    })
    .eq("id", id)
    .eq("household_id", household.id);

  if (error) {
    redirect(
      `/transactions/${id}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect("/transactions");
}

export async function deleteTransaction(id: string) {
  const { supabase, household } = await requireHousehold();

  await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("household_id", household.id);

  redirect("/transactions");
}
