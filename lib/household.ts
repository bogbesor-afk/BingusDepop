import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireHousehold() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    redirect("/household/new");
  }

  const { data: household } = await supabase
    .from("households")
    .select("id, name")
    .eq("id", membership.household_id)
    .single();

  if (!household) {
    redirect("/household/new");
  }

  return { supabase, user, household };
}
