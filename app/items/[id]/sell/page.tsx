import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getItemsWithStock } from "@/lib/inventory";
import { Nav } from "@/components/Nav";
import { logSale } from "./actions";

export default async function SellPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();

  const items = await getItemsWithStock(supabase, user.id);
  const item = items.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  const logSaleWithId = logSale.bind(null, id);
  const today = new Date().toISOString().slice(0, 10);

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
          <h1 className="text-xl font-semibold mt-2">
            Log a sale — {item.name}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            {item.stock} currently in stock
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form action={logSaleWithId} className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm mb-1">
              Quantity sold
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              step="1"
              min="1"
              required
              defaultValue={1}
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="unitPrice" className="block text-sm mb-1">
              Sale price per unit
            </label>
            <input
              id="unitPrice"
              name="unitPrice"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={item.sale_price_default ?? undefined}
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="soldAt" className="block text-sm mb-1">
              Date
            </label>
            <input
              id="soldAt"
              name="soldAt"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
          >
            Log sale
          </button>
        </form>
      </main>
    </div>
  );
}
