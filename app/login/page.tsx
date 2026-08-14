import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Bingusbread</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Track your household finances together.
          </p>
        </div>

        {params.error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {params.error}
          </p>
        )}
        {params.message && (
          <p className="text-sm text-emerald-400 bg-emerald-950/50 border border-emerald-900 rounded-md px-3 py-2">
            {params.message}
          </p>
        )}

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              formAction={signIn}
              className="flex-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
            >
              Sign in
            </button>
            <button
              formAction={signUp}
              className="flex-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium py-2"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
