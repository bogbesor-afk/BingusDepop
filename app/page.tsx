import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function toDateString(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

  const now = new Date();
  const monthStart = toDateString(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("id, amount, type, date, description, categories(name)")
    .eq("household_id", membership.household_id)
    .gte("date", monthStart)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = monthTransactions ?? [];
  const income = rows
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = rows
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const net = income - expenses;

  const expenseByCategory = new Map<string, number>();
  for (const t of rows) {
    if (t.type !== "expense") continue;
    const name =
      (t.categories as unknown as { name: string } | null)?.name ??
      "Uncategorized";
    expenseByCategory.set(name, (expenseByCategory.get(name) ?? 0) + Number(t.amount));
  }
  const breakdown = [...expenseByCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name,
      amount,
      percent: expenses > 0 ? (amount / expenses) * 100 : 0,
    }));

  const recent = rows.slice(0, 5);

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

        <div className="flex gap-3">
          <Link
            href="/transactions/new"
            className="flex-1 text-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
          >
            Add transaction
          </Link>
          <Link
            href="/transactions"
            className="flex-1 text-center rounded-md bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium py-2"
          >
            All transactions
          </Link>
          <Link
            href="/categories"
            className="flex-1 text-center rounded-md bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium py-2"
          >
            Categories
          </Link>
        </div>

        <div>
          <h2 className="text-sm font-medium text-neutral-400 mb-2">
            {monthLabel}
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-3">
              <p className="text-xs text-neutral-400">Income</p>
              <p className="text-sm font-medium text-emerald-400 mt-1">
                {currency.format(income)}
              </p>
            </div>
            <div className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-3">
              <p className="text-xs text-neutral-400">Expenses</p>
              <p className="text-sm font-medium text-red-400 mt-1">
                {currency.format(expenses)}
              </p>
            </div>
            <div className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-3">
              <p className="text-xs text-neutral-400">Net</p>
              <p
                className={`text-sm font-medium mt-1 ${
                  net >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {currency.format(net)}
              </p>
            </div>
          </div>
        </div>

        {breakdown.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-neutral-400 mb-2">
              Spending by category
            </h2>
            <div className="space-y-2">
              {breakdown.map((b) => (
                <div key={b.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{b.name}</span>
                    <span className="text-neutral-400">
                      {currency.format(b.amount)} ({b.percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${b.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-neutral-400">
              Recent activity
            </h2>
            <Link
              href="/transactions"
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No transactions yet this month.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-800 rounded-md border border-neutral-800 overflow-hidden">
              {recent.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-3 py-2 bg-neutral-900"
                >
                  <span className="text-sm">
                    {(t.categories as unknown as { name: string } | null)
                      ?.name ?? "Uncategorized"}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      t.type === "income"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {currency.format(Number(t.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
