import { notFound } from "next/navigation";
import Link from "next/link";
import { requireHousehold } from "@/lib/household";
import { updateTransaction, deleteTransaction } from "./actions";
import { DeleteButton } from "./DeleteButton";

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase, household } = await requireHousehold();

  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, category_id, amount, date, description")
    .eq("id", id)
    .eq("household_id", household.id)
    .single();

  if (!transaction) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("household_id", household.id)
    .order("type")
    .order("name");

  const updateWithId = updateTransaction.bind(null, id);
  const deleteWithId = deleteTransaction.bind(null, id);

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
          <h1 className="text-2xl font-semibold mt-2">Edit transaction</h1>
          <p className="text-neutral-400 text-sm mt-1">{household.name}</p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form action={updateWithId} className="space-y-4">
          <div>
            <label htmlFor="categoryId" className="block text-sm mb-1">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={transaction.category_id ?? ""}
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <optgroup label="Expense">
                {categories
                  ?.filter((c) => c.type === "expense")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Income">
                {categories
                  ?.filter((c) => c.type === "income")
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
              defaultValue={transaction.amount}
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
              defaultValue={transaction.date}
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
              defaultValue={transaction.description ?? ""}
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
          >
            Save changes
          </button>
        </form>

        <form action={deleteWithId}>
          <DeleteButton />
        </form>
      </div>
    </main>
  );
}
