# CLAUDE.md — Bingusbread

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
- Do not make multiple large changes at once — one feature, one file, one task per response
- After every change, include a "Verify:" step — one sentence telling Benjamin what to check to confirm it worked

---

## What We Are Building

**Bingusbread** is a web app for tracking personal/household finances — income, expenses, and categories — shared between two people (e.g. a household budget).

**The core workflow (v1):**
1. Benjamin creates a household/budget space and invites a second person by email
2. Either person manually logs transactions (amount, category, date, income or expense, who added it)
3. The app shows totals, spending by category, and a running balance
4. (Later) Bank account connection via Plaid to auto-import transactions

**What it is NOT (v1):**
- Not connected to real bank accounts yet — manual entry only to start
- Not more than 2 users per household
- Not a budgeting/goal-setting tool yet (no monthly limits, alerts, or forecasts) — pure tracking first
- Not a native mobile app — it's a responsive web app that works well on both phone and desktop browsers

---

## Tech Stack

| Layer | Tool | What it does in plain English |
|---|---|---|
| Frontend | Next.js (App Router, TypeScript) | The framework that organizes all the app's pages, forms, and logic |
| Styling | Tailwind CSS | Pre-made CSS classes that make things look good without writing custom style sheets |
| Database | Supabase | An online database that stores households, transactions, and categories |
| Auth | Supabase Auth | Handles sign-up/login and lets us invite a second person to a household by email |
| Deployment | Vercel (planned) | Publishes the app to the internet |
| Dev Environment | VS Code + Claude Code | Where the code is written and Claude Code is used as the coding assistant |

---

## GitHub Repository

**Remote URL:** `https://github.com/bogbesor-afk/bingusbread.git`
**Branch:** `main`

---

## Commit and Push Rules

Same rules as Tryout Scout:

1. After every day's tasks are complete, commit all changes with a clear message and push to GitHub.
2. After completing any major feature, commit and push immediately — don't wait until end of day.
3. Before starting any risky or large change, commit the current working state first.
4. Commit message format: plain English descriptions of what was done (e.g. `Add manual transaction form` not `fix stuff`).
5. Never skip a push when code is working.

---

## Key Product Decisions (Final)

These were decided during planning on 2026-08-14 and should not be revisited unless Benjamin explicitly asks to reconsider.

- Manual transaction entry only in v1 — no bank connection yet
- Bank connection (via Plaid) is a planned future feature — schema should not block adding it later
- Shared household budget: 2 people per household, invited by email via Supabase Auth
- Responsive web app — must work well on both phone and desktop browsers (not native, not desktop-only)
- No budgeting/goals/alerts in v1 — tracking and category breakdowns only

---

## Database Schema (planned, not yet created in Supabase)

**households** — One row per shared budget space
- `id` (uuid, primary key)
- `name` (text)
- `created_at` (timestamp)

**household_members** — Links a Supabase Auth user to a household
- `id` (uuid, primary key)
- `household_id` (uuid, links to households)
- `user_id` (uuid, links to Supabase auth.users)
- `invited_email` (text) — used before the invite is accepted
- `status` (text: 'invited' / 'active')
- `created_at` (timestamp)

**categories** — Expense/income categories, e.g. Groceries, Rent, Salary
- `id` (uuid, primary key)
- `household_id` (uuid, links to households)
- `name` (text)
- `type` (text: 'income' / 'expense')

**transactions** — One row per manually entered transaction
- `id` (uuid, primary key)
- `household_id` (uuid, links to households)
- `category_id` (uuid, links to categories)
- `added_by_user_id` (uuid, links to auth.users)
- `amount` (numeric)
- `type` (text: 'income' / 'expense')
- `description` (text, optional)
- `date` (date)
- `created_at` (timestamp)

---

## App Page Structure (planned)

```
app/
  page.tsx                        → Homepage / dashboard (balance, recent transactions)
  household/
    new/page.tsx                  → Create a household + invite second person
  transactions/
    page.tsx                      → List of transactions (search + filter by category)
    new/page.tsx                  → Add a transaction
  categories/
    page.tsx                      → Manage categories
lib/
  supabase.ts                     → Supabase client used for all database calls
```

---

## Environment Variables

Live in `.env.local` in the project root. Never committed to GitHub.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Coding Conventions

- Use TypeScript throughout (`.ts` and `.tsx` files only)
- Use Tailwind CSS for all styling — no separate CSS files unless necessary
- Use Supabase client from `lib/supabase.ts` for all database calls
- Server components for read-only data fetching; client components (`"use client"`) for interactive UI
- Keep components small and focused on one thing
- No placeholder or stub code left in production — every button should do something real

---

## Build Progress

**Current phase:** Project scaffolded, GitHub repo live (private, `bogbesor-afk/bingusbread`), Supabase project created (`bingusbread`, ref `fpixriowfqdhthjthucp`, region us-east-2) and linked. Schema (households, household_members, categories, transactions) is applied via `supabase/migrations/20260814000000_init_schema.sql`.

Auth is built and verified end-to-end in the browser: sign up, email confirmation (Supabase's built-in flow), sign in, sign out, household creation, and the auto-link-by-email mechanic (a user who signs up with an email that's already sitting in `household_members` as `status: 'invited'` gets automatically linked to that household on their first login — no admin invite email needed). Session handling uses `@supabase/ssr` (`lib/supabase/client.ts`, `server.ts`, `middleware.ts`, root `middleware.ts`). Pages: `app/login`, `app/household/new`, `app/auth/callback`, `app/page.tsx` (dashboard placeholder + redirect logic).

**Security gap closed (2026-08-14):** Row Level Security (RLS) is now enabled on all four tables via `supabase/migrations/20260814020000_add_rls_policies.sql`, scoped to household membership through a `security definer` helper function `is_household_member(household_id)` (avoids infinite-recursion issues that come from a table's RLS policy querying itself). Verified directly: an anonymous request to the REST API now returns `[]` for households/household_members even when real rows exist, and a signed-in user can only see/modify data for households they belong to.

One RLS-driven fix worth knowing about: `app/household/new/actions.ts` used to insert a household then immediately `.select()` it back — but right after creation the user isn't an active member yet, so the "view your household" policy blocked reading the row back (chicken-and-egg). Fixed by generating the household's UUID client-side (`crypto.randomUUID()`) and inserting with that ID directly, so no read-back is needed. The two `household_members` inserts (self, then optionally partner) also had to become sequential rather than one batched insert, since the partner row's policy check depends on the self row already existing.

**Also noted:** Supabase's free-tier shared SMTP has a low rate limit on outgoing auth emails (hit "email rate limit exceeded" during testing after a couple of signups in quick succession). Not a bug — just something to be aware of if testing signup repeatedly. A custom SMTP provider would remove this limit if it becomes an issue for real usage.

**Next steps:**
1. Build transaction entry form and list
2. Build dashboard with totals and category breakdown

**12-Week Plan:** not yet drafted — will build incrementally, one feature per session, same style as Tryout Scout.
