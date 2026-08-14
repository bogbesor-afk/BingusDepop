import Link from "next/link";
import { requireHousehold } from "@/lib/household";
import { addTransaction } from "./actions";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, household } = await requireHousehold();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("household_id", household.id)
    .order("type")
    .order("name");

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <Link
            href="/transactions"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            ← Back to transactions
          </Link>
          <h1 className="text-2xl font-semibold mt-2">Add a transaction</h1>
          <p className="text-neutral-400 text-sm mt-1">{household.name}</p>
        </div>

        {params.error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {params.error}
          </p>
        )}

        {!categories || categories.length === 0 ? (
          <p className="text-sm text-neutral-400">
            This household has no categories yet.
          </p>
        ) : (
          <form action={addTransaction} className="space-y-4">
            <div>
              <label htmlFor="categoryId" className="block text-sm mb-1">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <optgroup label="Expense">
                  {categories
                    .filter((c) => c.type === "expense")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Income">
                  {categories
                    .filter((c) => c.type === "income")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm mb-1">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm mb-1">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={today}
                className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm mb-1">
                Description (optional)
              </label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="e.g. Weekly grocery run"
                className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
            >
              Add transaction
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
