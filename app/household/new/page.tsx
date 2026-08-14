import { createHousehold } from "./actions";

export default async function NewHouseholdPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Set up your household</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Give your shared budget a name and add your partner&apos;s email
            — they&apos;ll be linked automatically the moment they sign up
            with that email.
          </p>
        </div>

        {params.error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {params.error}
          </p>
        )}

        <form action={createHousehold} className="space-y-4">
          <div>
            <label htmlFor="householdName" className="block text-sm mb-1">
              Household name
            </label>
            <input
              id="householdName"
              name="householdName"
              type="text"
              required
              placeholder="e.g. The Smiths"
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="partnerEmail" className="block text-sm mb-1">
              Partner&apos;s email (optional)
            </label>
            <input
              id="partnerEmail"
              name="partnerEmail"
              type="email"
              placeholder="partner@example.com"
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
          >
            Create household
          </button>
        </form>
      </div>
    </main>
  );
}
