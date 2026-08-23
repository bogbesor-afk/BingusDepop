import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { Nav } from "@/components/Nav";
import { TrendChart, StockChart, ForecastChart } from "@/components/DashboardCharts";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const data = await getDashboardData(supabase, user.id);

  const hasAnyData = data.monthly.length > 0 || data.stockLevels.length > 0;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Nav active="dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Link
            href="/items"
            className="rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-3 py-1.5"
          >
            Go to Inventory
          </Link>
        </div>

        {!hasAnyData ? (
          <p className="text-sm text-neutral-500">
            No data yet.{" "}
            <Link href="/items/new" className="text-red-600 hover:text-red-500">
              Add your first item
            </Link>{" "}
            to start tracking.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
            {/* Left: graphs */}
            <div className="space-y-6">
              <ChartCard title="Revenue vs. Spending (Last 6 Months)">
                <TrendChart data={data.monthly} />
              </ChartCard>

              <ChartCard title="Sales &amp; Projected Gain">
                <ForecastChart data={data.forecast} />
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-neutral-100">
                  <EstimateChip
                    label="Est. Next Month Revenue"
                    value={currency.format(data.estimatedNextMonthRevenue)}
                  />
                  <EstimateChip
                    label="Est. Next Month Profit"
                    value={currency.format(data.estimatedNextMonthProfit)}
                    tone={data.estimatedNextMonthProfit >= 0 ? "positive" : "negative"}
                  />
                </div>
              </ChartCard>

              <ChartCard title="Current Stock by Item">
                <StockChart data={data.stockLevels} />
              </ChartCard>
            </div>

            {/* Right: data */}
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-neutral-700 mb-2">
                  General Stats
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Revenue" value={currency.format(data.totalRevenue)} tone="positive" />
                  <StatCard label="Spent" value={currency.format(data.totalSpent)} tone="negative" />
                  <StatCard
                    label="Cash Profit"
                    value={currency.format(data.cashProfit)}
                    tone={data.cashProfit >= 0 ? "positive" : "negative"}
                  />
                  <StatCard label="Inventory Value" value={currency.format(data.inventoryValue)} tone="neutral" />
                </div>
              </div>

              {data.restockSuggestions.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                  <h2 className="text-sm font-semibold text-red-700">
                    Restock Recommendations
                  </h2>
                  <p className="text-xs text-neutral-500 -mt-2">
                    Rule-based on your sales pace and each item&apos;s
                    shipping time — not real AI.
                  </p>
                  <div className="space-y-2">
                    {data.restockSuggestions.map((s) => (
                      <div
                        key={s.id}
                        className="text-sm bg-white border border-neutral-200 rounded-md px-3 py-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{s.name}</span>
                          <span
                            className={`text-xs ${
                              s.affordable ? "text-neutral-500" : "text-red-600"
                            }`}
                          >
                            ~{currency.format(s.suggestedCost)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {s.stock} left ·{" "}
                          {s.daysLeft === Infinity
                            ? "not selling"
                            : `~${Math.floor(s.daysLeft)}d left`}{" "}
                          · ships in ~{s.leadTimeDays}d
                        </p>
                        <p className="text-xs mt-1">
                          Buy <span className="font-medium">{s.suggestedQty}</span> more
                          {!s.affordable && (
                            <span className="text-red-600"> · exceeds current cash profit</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm p-4">
      <h2 className="text-sm font-semibold text-neutral-700 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function EstimateChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "text-[#8A9A5B]"
      : tone === "negative"
      ? "text-[#3B4A3B]"
      : "text-neutral-900";

  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
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
      ? "text-[#8A9A5B]"
      : tone === "negative"
      ? "text-[#3B4A3B]"
      : "text-neutral-900";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${toneClass}`}>{value}</p>
    </div>
  );
}
