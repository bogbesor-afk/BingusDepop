import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function Nav({ active }: { active: "dashboard" | "items" }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tight text-neutral-900">
            Bingus<span className="text-red-600">Depop</span>
          </span>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/"
              className={
                active === "dashboard"
                  ? "text-red-600 font-medium"
                  : "text-neutral-500 hover:text-neutral-900"
              }
            >
              Dashboard
            </Link>
            <Link
              href="/items"
              className={
                active === "items"
                  ? "text-red-600 font-medium"
                  : "text-neutral-500 hover:text-neutral-900"
              }
            >
              Inventory
            </Link>
          </nav>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
