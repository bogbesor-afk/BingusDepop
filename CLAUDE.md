# CLAUDE.md — BingusDepop

This file tells Claude Code everything it needs to know about this project and how to work with the person building it. Claude Code should read this at the start of every session and update it whenever a significant decision is made.

---

## Who Is Building This

Benjamin has zero coding or technical experience. This project is both a product build and a learning journey. Claude Code should always explain concepts in plain, beginner-friendly language before implementing them. Do not assume any prior knowledge of terminals, file systems, web frameworks, databases, or programming concepts.

**How to explain things:**
- Use everyday analogies, not technical jargon
- Compare new concepts to things that already make sense (a database table is like a spreadsheet, a component is like a reusable template, a terminal command is like a text instruction you give your computer)
- Keep explanations short — 2–4 sentences before showing any code
- If introducing a new concept (e.g. API route, environment variable, foreign key), define it before using it
- Never use an abbreviation without expanding it first
- Do not make multiple large changes at once — one feature, one file, one task per response (this rule was relaxed once, on 2026-08-15, at Benjamin's explicit request to rebuild the whole app in one autonomous pass while he was away — see Build Progress below. Default back to incremental, one-thing-at-a-time delivery unless he asks for a big autonomous push again.)
- After every change, include a "Verify:" step — one sentence telling Benjamin what to check to confirm it worked

---

## What We Are Building

**BingusDepop** helps Benjamin run his Depop reselling business: he buys clothes in bulk from a manufacturer, then resells them on Depop. The app tracks inventory (what he has, what he paid for it) and money (what he's spent vs. earned), and visualizes it so he can actually understand his business at a glance instead of losing track.

**The core workflow (v1, single user — no sharing/household concept):**
1. Add an "item" once — a type of thing he buys in bulk (e.g. "Vintage Denim Jacket") with its cost per unit, so the cost never has to be re-typed
2. Log a **restock** when he buys more of an item (quantity + cost that time, since manufacturer pricing can shift)
3. Log a **sale** when something sells on Depop (quantity + sale price)
4. The **Dashboard** shows revenue, money spent restocking, cash profit, current inventory value, charts (revenue/spend trend, stock levels per item, top sellers), and **restock suggestions** — a rule-based (not real AI/ML) feature that looks at each item's actual sales pace over the last 30 days and flags what's about to run out, how much to buy, what it'll cost, and whether that cost fits within current cash profit

**What it is NOT:**
- Not multi-user / no household or sharing concept — this is Benjamin's own business tracker
- Not real AI — the "restock suggestions" are simple velocity math on his own sales data, clearly labeled as such in the UI so it's never overclaimed as more than it is
- Not doing formal accrual accounting (FIFO/LIFO cost-of-goods-sold) — "cash profit" is simply total revenue minus total spent on restocking, which is more intuitive for a small reseller than strict accounting
- Not mobile-only — must look and work well on both a phone and a full desktop browser, using the available width on each rather than a narrow centered phone-width column everywhere

---

## Tech Stack

| Layer | Tool | What it does in plain English |
|---|---|---|
| Frontend | Next.js (App Router, TypeScript) | The framework that organizes all the app's pages, forms, and logic |
| Styling | Tailwind CSS | Pre-made CSS classes that make things look good without writing custom style sheets |
| Charts | Recharts | React charting library used on the dashboard (line/bar charts) |
| Database | Supabase | An online database that stores items, purchases (restocks), and sales |
| Auth | Supabase Auth | Handles sign-up/login |
| Deployment | Vercel | Publishes the app to the internet |
| Dev Environment | VS Code + Claude Code | Where the code is written and Claude Code is used as the coding assistant |

---

## GitHub Repository

**Remote URL:** `https://github.com/bogbesor-afk/bingusbread.git`
**Branch:** `main`

Note: the GitHub repo, Vercel project, and live URL are still named `bingusbread` — kept as-is during the 2026-08-15 pivot to avoid infra risk (renaming could break the Vercel↔GitHub link or require reconfiguring the live domain) while Benjamin was away. The app itself is branded "BingusDepop" throughout the UI. Renaming the underlying repo/project/domain to match is a easy future task if Benjamin wants it — just ask before doing it, since it changes URLs.

---

## Commit and Push Rules

1. After every day's tasks are complete, commit all changes with a clear message and push to GitHub.
2. After completing any major feature, commit and push immediately — don't wait until end of day.
3. Before starting any risky or large change, commit the current working state first.
4. Commit message format: plain English descriptions of what was done (e.g. `Add restock suggestion logic` not `fix stuff`).
5. Never skip a push when code is working.
6. Deploy to Vercel (`npx vercel deploy --prod`, no global CLI install — see Deployment section) after pushing any user-facing change, since Benjamin actually uses the live site day to day.

---

## Key Product Decisions

- 2026-08-14: original app built as "Bingusbread", a shared household budget tracker. Superseded below.
- **2026-08-15 — full pivot:** Benjamin asked to throw out the household budget concept entirely and rebuild the app as a single-user Depop reselling inventory/profit tracker, called BingusDepop. Only login/signup were kept; everything else (households, categories, transactions) was removed and replaced. He explicitly authorized doing this as one large autonomous pass (schema changes, full rebuild, deploy) while he was away, rather than the usual one-feature-at-a-time approach — see Build Progress.
- Single user, no sharing/household/invite concept
- Restock suggestions are simple rule-based math (sales velocity over last 30 days vs. current stock), explicitly not presented as real AI/ML in the UI copy
- Responsive, full-width layout required — not a narrow mobile-width column on desktop
- Cash-basis profit (revenue − restocking spend), not formal accrual accounting

---

## Database Schema

**items** — One row per type of item Benjamin buys in bulk
- `id` (uuid, primary key)
- `user_id` (uuid, links to auth.users)
- `name` (text)
- `cost_per_unit` (numeric) — default/most recent cost from the manufacturer
- `sale_price_default` (numeric, optional) — usual Depop listing price, pre-fills the sell form
- `created_at` (timestamp)

**purchases** — One row per restock event
- `id` (uuid, primary key)
- `user_id` (uuid, links to auth.users)
- `item_id` (uuid, links to items)
- `quantity` (integer)
- `unit_cost` (numeric) — snapshotted per purchase, since manufacturer pricing can change over time
- `purchased_at` (date)
- `created_at` (timestamp)

**sales** — One row per Depop sale
- `id` (uuid, primary key)
- `user_id` (uuid, links to auth.users)
- `item_id` (uuid, links to items)
- `quantity` (integer)
- `unit_price` (numeric) — snapshotted per sale
- `sold_at` (date)
- `created_at` (timestamp)

Stock on hand and all dashboard stats are **computed**, not stored — `lib/inventory.ts` and `lib/dashboard.ts` derive everything from summing `purchases` and `sales` rows for a given item/user. This avoids any risk of a stored "current stock" number drifting out of sync with the actual purchase/sale history.

RLS: all three tables use the simplest possible policy — `user_id = auth.uid()` for every operation. No cross-user sharing exists, so no security-definer helper function is needed (unlike the old household-based RLS, which needed one to avoid recursive policy checks).

---

## App Page Structure (as built)

```
app/
  page.tsx                          → Dashboard: stat cards, restock suggestions, charts
  login/
    page.tsx, actions.ts            → Sign in / sign up (single form, toggled by ?mode=)
  auth/
    actions.ts                      → Sign out
    callback/route.ts               → Handles email confirmation redirect
  items/
    page.tsx                        → Inventory list — cards per item with stock on hand
    new/page.tsx, actions.ts        → Add a new item type
    [id]/restock/page.tsx, actions.ts → Log a restock (purchase)
    [id]/sell/page.tsx, actions.ts    → Log a sale
middleware.ts                       → Refreshes the Supabase session cookie on every request
components/
  Nav.tsx                           → Shared top nav (BingusDepop branding, Dashboard/Inventory links, sign out)
  DashboardCharts.tsx                → Client components wrapping Recharts (TrendChart, StockChart, TopSellersChart)
lib/
  auth.ts                           → requireUser() — get the signed-in user or redirect to /login
  inventory.ts                      → getItemsWithStock() — items + computed stock/cost/revenue per item
  dashboard.ts                      → getDashboardData() — all dashboard stats, chart data, and restock suggestions
  supabase/
    client.ts                       → Browser Supabase client
    server.ts                       → Server component / server action Supabase client
    middleware.ts                   → Session-refresh helper used by root middleware.ts
```

---

## Environment Variables

Live in `.env.local` locally (never committed to GitHub) and as encrypted Production env vars on Vercel.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_deployed_url   # used for auth email confirmation redirects
```

---

## Deployment

- **Live URL:** https://bingusbread.vercel.app (app displays as "BingusDepop" — see note under GitHub Repository above)
- **Vercel project:** `benjyao/bingusbread`, linked to the `bogbesor-afk/bingusbread` GitHub repo
- Deploys via `npx vercel deploy --prod` from the project root (no global Vercel CLI install — permissions issue on this machine, so every command uses `npx`)
- Supabase Auth's **Site URL** and **Redirect URLs** (Authentication → URL Configuration in the Supabase dashboard) are set to the live URL — required for email confirmation links to work in production. Changed manually in the dashboard, not via `supabase config push`, to avoid risking an unreviewed overwrite of other auth settings.

---

## Coding Conventions

- Use TypeScript throughout (`.ts` and `.tsx` files only)
- Use Tailwind CSS for all styling — no separate CSS files unless necessary
- Use `lib/supabase/server.ts` (server components/actions) or `lib/supabase/client.ts` (client components) for all database calls — never a bare client
- Use `lib/auth.ts`'s `requireUser()` on any page that needs "the signed-in user or redirect to login"
- Use `lib/inventory.ts` / `lib/dashboard.ts` for stock/stat calculations rather than duplicating the purchase/sale aggregation logic elsewhere
- Server components for read-only data fetching; client components (`"use client"`) only where interactivity or a browser-only library (like Recharts) requires it
- Layout should use the full available width responsively (`max-w-7xl` + responsive grid columns) on data-dense pages like the dashboard and inventory list — not a narrow `max-w-sm`/`max-w-md` column, which is reserved for simple centered forms (login, add item, restock, sell)
- Keep components small and focused on one thing
- No placeholder or stub code left in production — every button should do something real

---

## Build Progress

**2026-08-14:** Built and deployed "Bingusbread," a shared household budget tracker (sign up/login, households, invite-by-email, transactions, categories, dashboard). Fully superseded by the pivot below — kept in git history but no longer describes the app.

**2026-08-15 — pivoted to BingusDepop.** Benjamin asked for a complete rebuild while he was away at work, explicitly authorizing autonomous execution (schema changes, full app rebuild, commit/push/deploy) without stopping for permission at each step. What was built:

- **Schema:** dropped `households`/`household_members`/`categories`/`transactions` and their RLS policies/helper function entirely (migration `20260815000000_pivot_to_bingusdepop.sql`). Created `items`/`purchases`/`sales`, each scoped by `user_id` with simple RLS.
- **Removed:** `app/household`, `app/categories`, `app/transactions`, `lib/household.ts`.
- **Added:** `app/items/*` (inventory list, add item, restock, sell), new `app/page.tsx` dashboard, `lib/auth.ts`, `lib/inventory.ts`, `lib/dashboard.ts`, `components/Nav.tsx`, `components/DashboardCharts.tsx` (Recharts-based).
- **Restock suggestions:** computes each item's sales velocity over the last 30 days; if days-of-stock-left < 14 and the item is actually selling, suggests a reorder quantity (targeting ~30 days of stock) and its cost, flagging whether that cost exceeds current cash profit. Explicitly labeled in the UI as simple math, not real AI, to avoid overclaiming.
- **Layout:** rebuilt around a shared `Nav` component and full-width responsive containers/grids, replacing the old narrow mobile-width centered column that looked like "a phone on a computer" per Benjamin's feedback.
- **Verified end-to-end locally in the browser** before deploying: signed up, added an item, logged a restock, logged a sale, confirmed every dashboard number (revenue, spent, cash profit, inventory value) matched hand-calculated expected values, confirmed all three charts render with real data, and specifically drove stock down low enough to confirm the restock suggestion triggers with correct quantity/cost math. Test data deleted from Supabase afterward.

**Known good, low-risk decision:** kept the GitHub repo, Vercel project, and live domain named `bingusbread` rather than renaming to `bingusdepop` — purely an infra-continuity choice made while Benjamin was unreachable, not a product decision. Fine to rename later if he wants a matching URL; just confirm with him first since it changes links.

**Next steps (all optional — only pursue if Benjamin asks):**
1. Consider renaming the GitHub repo / Vercel project / domain to match "BingusDepop" if he wants a matching URL
2. Item detail page showing purchase/sale history for a single item, if the inventory list ever feels insufficient
3. Editing/deleting individual purchase or sale entries (currently log-only, matching how the original transaction feature started before edit/delete were added later — same pattern likely wanted here eventually)
4. Month navigation or date-range filtering on the dashboard (currently shows all-time stats + last 6 months trend)
5. If Supabase's free-tier email rate limit becomes an issue with real signup volume, set up custom SMTP

**12-Week Plan:** not drafted as a formal week-by-week doc — built incrementally (except for the 2026-08-15 pivot, done as one large autonomous pass at Benjamin's request).
