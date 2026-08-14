import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: membership } = await supabase
    .from("household_members")
    .select("id, household_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    // The user may have been added to a household by email before they
    // signed up — link them to it now that we know their user id.
    const { data: pendingInvite } = await supabase
      .from("household_members")
      .select("id, household_id")
      .eq("invited_email", user.email!.toLowerCase())
      .eq("status", "invited")
      .is("user_id", null)
      .maybeSingle();

    if (pendingInvite) {
      await supabase
        .from("household_members")
        .update({ user_id: user.id, status: "active" })
        .eq("id", pendingInvite.id);

      membership = pendingInvite;
    }
  }

  if (!membership) {
    redirect("/household/new");
  }

  const { data: household } = await supabase
    .from("households")
    .select("name")
    .eq("id", membership.household_id)
    .single();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {household?.name ?? "Your household"}
          </h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-neutral-400 hover:text-neutral-200"
            >
              Sign out
            </button>
          </form>
        </div>
        <p className="text-neutral-400 text-sm">
          Signed in as {user.email}. Transaction tracking is coming next.
        </p>
      </div>
    </main>
  );
}
