import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getItemsWithStock } from "@/lib/inventory";
import { Nav } from "@/components/Nav";
import { logQuickSale } from "./actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function ItemsPage() {
  const { supabase, user } = await requireUser();
  const items = await getItemsWithStock(supabase, user.id);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Nav active="items" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Inventory</h1>
          <Link
            href="/items/new"
            className="rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-3 py-1.5"
          >
            Add item
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No items yet. Add the first type of item you buy in bulk to get
            started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 bg-white shadow-sm p-4 space-y-3"
              >
                <div>
                  <h2 className="font-medium">{item.name}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Cost {currency.format(item.cost_per_unit)} / unit
                    {item.sale_price_default != null &&
                      ` · Sells for ${currency.format(item.sale_price_default)}`}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-semibold ${
                      item.stock <= 0 ? "text-[#3B4A3B]" : "text-neutral-900"
                    }`}
                  >
                    {item.stock}
                  </span>
                  <span className="text-xs text-neutral-500">in stock</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/items/${item.id}/restock`}
                    className="flex-1 text-center rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-medium py-1.5"
                  >
                    Restock
                  </Link>
                  <form
                    action={logQuickSale.bind(null, item.id)}
                    className="flex-1"
                  >
                    <button
                      type="submit"
                      className="w-full rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-medium py-1.5"
                    >
                      Log sale (+1)
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
