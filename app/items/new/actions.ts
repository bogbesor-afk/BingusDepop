"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function addItem(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = (formData.get("name") as string).trim();
  const costPerUnit = formData.get("costPerUnit") as string;
  const salePriceDefault = formData.get("salePriceDefault") as string;
  const leadTimeDays = formData.get("leadTimeDays") as string;
  const photo = formData.get("photo") as File | null;

  if (!name || !salePriceDefault) {
    redirect(
      `/items/new?error=${encodeURIComponent(
        "Enter a name and a sale price — the sale price is used so Log Sale can be a single click"
      )}`
    );
  }

  let imageUrl: string | null = null;
  if (photo && photo.size > 0) {
    const extension = photo.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("item-photos")
      .upload(path, photo, { contentType: photo.type });

    if (uploadError) {
      redirect(`/items/new?error=${encodeURIComponent(uploadError.message)}`);
    }

    imageUrl = supabase.storage.from("item-photos").getPublicUrl(path).data
      .publicUrl;
  }

  const { error } = await supabase.from("items").insert({
    user_id: user.id,
    name,
    cost_per_unit: costPerUnit || 0,
    sale_price_default: salePriceDefault,
    lead_time_days: leadTimeDays || 14,
    image_url: imageUrl,
  });

  if (error) {
    redirect(`/items/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/items");
}
