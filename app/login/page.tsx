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
    <main className="min-h-screen flex items-center justify-center bg-white text-neutral-900 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bingus<span className="text-red-600">Depop</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Track your inventory, sales, and profit.
          </p>
        </div>

        <h2 className="text-lg font-medium">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

        {params.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {params.error}
          </p>
        )}
        {params.message && (
          <p className="text-sm text-neutral-700 bg-neutral-100 border border-neutral-200 rounded-md px-3 py-2">
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
              className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2"
          >
            {isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-neutral-500 text-center">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login?mode=signin"
                className="text-red-600 hover:text-red-500"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link
                href="/login?mode=signup"
                className="text-red-600 hover:text-red-500"
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
