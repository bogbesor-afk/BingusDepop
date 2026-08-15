import Link from "next/link";
import { Nav } from "@/components/Nav";
import { addItem } from "./actions";

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Nav active="items" />
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div>
          <Link
            href="/items"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            ← Back to inventory
          </Link>
          <h1 className="text-xl font-semibold mt-2">Add an item</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Set the cost once — you won&apos;t need to enter it again when
            you restock.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form action={addItem} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm mb-1">
              Item name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Vintage Denim Jacket"
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="costPerUnit" className="block text-sm mb-1">
              Cost per unit (what you pay the manufacturer)
            </label>
            <input
              id="costPerUnit"
              name="costPerUnit"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="salePriceDefault" className="block text-sm mb-1">
              Usual Depop sale price (optional)
            </label>
            <input
              id="salePriceDefault"
              name="salePriceDefault"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
          >
            Add item
          </button>
        </form>
      </main>
    </div>
  );
}
