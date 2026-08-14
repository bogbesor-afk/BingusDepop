"use server";

import { redirect } from "next/navigation";
import { requireHousehold } from "@/lib/household";

export async function addCategory(formData: FormData) {
  const { supabase, household } = await requireHousehold();

  const name = (formData.get("name") as string).trim();
  const type = formData.get("type") as string;

  if (!name || (type !== "income" && type !== "expense")) {
    redirect(
      `/categories?error=${encodeURIComponent("Enter a name and type")}`
    );
  }

  const { error } = await supabase.from("categories").insert({
    household_id: household.id,
    name,
    type,
  });

  if (error) {
    redirect(`/categories?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/categories");
}

export async function deleteCategory(id: string) {
  const { supabase, household } = await requireHousehold();

  await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("household_id", household.id);

  redirect("/categories");
}
