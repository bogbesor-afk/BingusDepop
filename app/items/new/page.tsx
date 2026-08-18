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
    <div className="min-h-screen bg-white text-neutral-900">
      <Nav active="items" />
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div>
          <Link
            href="/items"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Back to inventory
          </Link>
          <h1 className="text-xl font-semibold mt-2">Add an item</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Set the cost and sale price once — restocking never asks for
            cost again, and logging a sale becomes a single click.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
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
              className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="salePriceDefault" className="block text-sm mb-1">
              Depop sale price
            </label>
            <input
              id="salePriceDefault"
              name="salePriceDefault"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Used automatically every time you tap &quot;Log sale&quot;.
            </p>
          </div>
          <div>
            <label htmlFor="leadTimeDays" className="block text-sm mb-1">
              Shipping / lead time from manufacturer (days)
            </label>
            <input
              id="leadTimeDays"
              name="leadTimeDays"
              type="number"
              step="1"
              min="0"
              defaultValue={14}
              className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-neutral-500 mt-1">
              How long a new order takes to arrive — used to time restock
              recommendations.
            </p>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2"
          >
            Add item
          </button>
        </form>
      </main>
    </div>
  );
}
