import Link from "next/link";
import { requireHousehold } from "@/lib/household";
import { addCategory, deleteCategory } from "./actions";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase, household } = await requireHousehold();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("household_id", household.id)
    .order("type")
    .order("name");

  const expenseCategories = categories?.filter((c) => c.type === "expense") ?? [];
  const incomeCategories = categories?.filter((c) => c.type === "income") ?? [];

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
          <h1 className="text-xl font-semibold mt-2">Categories</h1>
          <p className="text-neutral-400 text-sm">{household.name}</p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form
          action={addCategory}
          className="flex gap-2 items-end bg-neutral-900 border border-neutral-800 rounded-md p-3"
        >
          <div className="flex-1">
            <label htmlFor="name" className="block text-xs mb-1 text-neutral-400">
              New category
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Pet Supplies"
              className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-xs mb-1 text-neutral-400">
              Type
            </label>
            <select
              id="type"
              name="type"
              className="rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-3 py-2"
          >
            Add
          </button>
        </form>

        <div>
          <h2 className="text-sm font-medium text-neutral-400 mb-2">Expense</h2>
          <ul className="divide-y divide-neutral-800 rounded-md border border-neutral-800 overflow-hidden">
            {expenseCategories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between px-3 py-2 bg-neutral-900"
              >
                <span className="text-sm">{c.name}</span>
                <form action={deleteCategory.bind(null, c.id)}>
                  <DeleteCategoryButton />
                </form>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium text-neutral-400 mb-2">Income</h2>
          <ul className="divide-y divide-neutral-800 rounded-md border border-neutral-800 overflow-hidden">
            {incomeCategories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between px-3 py-2 bg-neutral-900"
              >
                <span className="text-sm">{c.name}</span>
                <form action={deleteCategory.bind(null, c.id)}>
                  <DeleteCategoryButton />
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
