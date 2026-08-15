import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { Nav } from "@/components/Nav";
import { TrendChart, StockChart, TopSellersChart } from "@/components/DashboardCharts";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const data = await getDashboardData(supabase, user.id);

  const hasAnyData =
    data.monthly.length > 0 || data.stockLevels.length > 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Nav active="dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Link
            href="/items"
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-3 py-1.5"
          >
            Go to inventory
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Revenue (sales)" value={currency.format(data.totalRevenue)} tone="positive" />
          <StatCard label="Spent (restocking)" value={currency.format(data.totalSpent)} tone="negative" />
          <StatCard
            label="Cash profit"
            value={currency.format(data.cashProfit)}
            tone={data.cashProfit >= 0 ? "positive" : "negative"}
          />
          <StatCard label="Inventory value" value={currency.format(data.inventoryValue)} tone="neutral" />
        </div>

        {data.restockSuggestions.length > 0 && (
          <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4 space-y-3">
            <h2 className="text-sm font-medium text-amber-300">
              🔔 Restock suggestions
            </h2>
            <p className="text-xs text-neutral-400 -mt-2">
              Based on your sales pace over the last 30 days — not real AI,
              just simple math on your own data.
            </p>
            <div className="space-y-2">
              {data.restockSuggestions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-sm bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2"
                >
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-neutral-400 text-xs ml-2">
                      {s.stock} left ·{" "}
                      {s.daysLeft === Infinity
                        ? "not selling"
                        : `~${Math.floor(s.daysLeft)} days of stock`}
                    </span>
                  </div>
                  <div className="text-right">
                    <p>
                      Buy <span className="font-medium">{s.suggestedQty}</span>{" "}
                      more
                    </p>
                    <p
                      className={`text-xs ${
                        s.affordable ? "text-neutral-400" : "text-red-400"
                      }`}
                    >
                      ~{currency.format(s.suggestedCost)}
                      {!s.affordable && " · exceeds current cash profit"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasAnyData ? (
          <p className="text-sm text-neutral-400">
            No data yet.{" "}
            <Link href="/items/new" className="text-emerald-400 hover:text-emerald-300">
              Add your first item
            </Link>{" "}
            to start tracking.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <h2 className="text-sm font-medium text-neutral-400 mb-2">
                Revenue vs. spending (last 6 months)
              </h2>
              <TrendChart data={data.monthly} />
            </div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <h2 className="text-sm font-medium text-neutral-400 mb-2">
                Current stock by item
              </h2>
              <StockChart data={data.stockLevels} />
            </div>
            {data.topSellers.length > 0 && (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 lg:col-span-2">
                <h2 className="text-sm font-medium text-neutral-400 mb-2">
                  Top sellers by revenue
                </h2>
                <TopSellersChart data={data.topSellers} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
      ? "text-red-400"
      : "text-neutral-100";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className={`text-lg sm:text-2xl font-semibold mt-1 ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}
