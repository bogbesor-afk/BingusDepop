import Link from "next/link";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signin" ? "signin" : "signup";
  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">BingusDepop</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Track your inventory, sales, and profit.
          </p>
        </div>

        <h2 className="text-lg font-medium">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

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

        <form action={isSignup ? signUp : signIn} className="space-y-4">
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
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2"
          >
            {isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-neutral-400 text-center">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login?mode=signin"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link
                href="/login?mode=signup"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
