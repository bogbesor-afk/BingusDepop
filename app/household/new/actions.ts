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

  // Generated up front (rather than reading it back after insert) because
  // right after creation the user isn't an active member yet, so the
  // "view your household" policy would block reading the new row back.
  const householdId = crypto.randomUUID();

  const { error: householdError } = await supabase
    .from("households")
    .insert({ id: householdId, name: householdName });

  if (householdError) {
    redirect(
      `/household/new?error=${encodeURIComponent(householdError.message)}`
    );
  }

  const { error: selfError } = await supabase.from("household_members").insert({
    household_id: householdId,
    user_id: user.id,
    invited_email: user.email!,
    status: "active",
  });

  if (selfError) {
    redirect(`/household/new?error=${encodeURIComponent(selfError.message)}`);
  }

  if (partnerEmail && partnerEmail !== user.email?.toLowerCase()) {
    const { error: partnerError } = await supabase
      .from("household_members")
      .insert({
        household_id: householdId,
        user_id: null,
        invited_email: partnerEmail,
        status: "invited",
      });

    if (partnerError) {
      redirect(
        `/household/new?error=${encodeURIComponent(partnerError.message)}`
      );
    }
  }

  redirect("/");
}
