import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function Nav({ active }: { active: "dashboard" | "items" }) {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-neutral-100">BingusDepop</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className={
                active === "dashboard"
                  ? "text-white font-medium"
                  : "text-neutral-400 hover:text-neutral-200"
              }
            >
              Dashboard
            </Link>
            <Link
              href="/items"
              className={
                active === "items"
                  ? "text-white font-medium"
                  : "text-neutral-400 hover:text-neutral-200"
              }
            >
              Inventory
            </Link>
          </nav>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
