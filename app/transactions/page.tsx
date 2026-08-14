import Link from "next/link";
import { requireHousehold } from "@/lib/household";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TransactionsPage() {
  const { supabase, household } = await requireHousehold();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, amount, type, description, date, categories(name)")
    .eq("household_id", household.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = transactions ?? [];
  const income = rows
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = rows
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const net = income - expenses;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            ← Back to dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-xl font-semibold">{household.name}</h1>
            <Link
              href="/transactions/new"
              className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-3 py-1.5"
            >
              Add transaction
            </Link>
          </div>
        </div>

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

        {rows.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No transactions yet. Add your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-800 rounded-md border border-neutral-800 overflow-hidden">
            {rows.map((t) => (
              <li key={t.id} className="bg-neutral-900">
                <Link
                  href={`/transactions/${t.id}/edit`}
                  className="flex items-center justify-between px-3 py-3 hover:bg-neutral-800"
                >
                  <div>
                    <p className="text-sm">
                      {(t.categories as unknown as { name: string } | null)
                        ?.name ?? "Uncategorized"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDate(t.date)}
                      {t.description ? ` · ${t.description}` : ""}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      t.type === "income"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {currency.format(Number(t.amount))}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
