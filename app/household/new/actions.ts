"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createHousehold(formData: FormData) {
  const householdName = (formData.get("householdName") as string).trim();
  const partnerEmail = (formData.get("partnerEmail") as string)
    .trim()
    .toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .insert({ name: householdName })
    .select()
    .single();

  if (householdError || !household) {
    redirect(
      `/household/new?error=${encodeURIComponent(
        householdError?.message ?? "Could not create household"
      )}`
    );
  }

  const members: {
    household_id: string;
    user_id: string | null;
    invited_email: string;
    status: string;
  }[] = [
    {
      household_id: household.id,
      user_id: user.id,
      invited_email: user.email!,
      status: "active",
    },
  ];

  if (partnerEmail && partnerEmail !== user.email?.toLowerCase()) {
    members.push({
      household_id: household.id,
      user_id: null,
      invited_email: partnerEmail,
      status: "invited",
    });
  }

  const { error: membersError } = await supabase
    .from("household_members")
    .insert(members);

  if (membersError) {
    redirect(
      `/household/new?error=${encodeURIComponent(membersError.message)}`
    );
  }

  redirect("/");
}
