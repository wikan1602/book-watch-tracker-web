# Book & Watch Tracker — Web

Next.js frontend for the Book & Watch Tracker. Talks directly to the Go
API (backend + architecture: [book-watch-tracker](../book-watch-tracker),
`docs/blueprint.md` there) from the browser — this is a client-rendered
SPA-style app, not a Next.js server-backed one: there's no database or
secret API key here, so there's nothing that needs `next dev`/Server
Actions/Route Handlers to run on this app's own server. Auth token lives
in `localStorage`; every `lib/api.ts` call attaches it as
`Authorization: Bearer <token>` straight to `NEXT_PUBLIC_API_URL`.

## Status

v1 scope, all wired up:

- Email/password + Google sign-in (`/login`, `/register`,
  `/auth/callback` — the last one handles the redirect from the API's
  Google OAuth callback, which arrives as `?token=...`)
- Watch list (`/watch`): TMDB search to add movies/shows, status +
  season/episode progress editing, remove
- Book list (`/books`): search across Google Books / Open Library /
  Hardcover (source picker in the add modal) to add books, status +
  page or chapter/volume progress editing (format-dependent), remove
- Connections (`/connections`): Trakt connect (redirect flow) /
  disconnect, Hardcover connect (paste token) / disconnect

`trakt_sync` / `hardcover_sync` from the API's status-upsert response
surface as a small inline note next to the item when non-`"skipped"`.

## Prerequisites

Node 22 (matches what's on this VPS), the Go API deployed and reachable
at the URL in `.env.local`.

## Local dev

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL — defaults to the live api.wikan-ai.my.id
npm install
npm run dev
```

Open http://localhost:3000. The live API's `CORS_ORIGINS` already
includes `http://localhost:3000`, so requests from local dev work
without touching the backend.

## What's verified vs. not

Verified: `tsc --noEmit`, `npm run lint`, `npm run build` all clean;
`npm start` + curl smoke test on every route (all 200, expected content
present); a live end-to-end curl flow (register → create watch item →
set status → list) confirming the API's JSON shape matches `lib/api.ts`'s
TypeScript types exactly; CORS preflight confirmed working for both
`http://localhost:3000` and `https://tracker.wikan-ai.my.id`.

**Not verified: actually clicking through the UI in a browser.** This was
built and tested from a headless VPS shell with no browser available —
run it locally (`npm run dev`) or after deploying and click through the
real flows (register, add a watch item via TMDB search, edit status,
connect Trakt, etc.) before trusting it fully.

## Deploying

Suggested subdomain per the backend's blueprint: `tracker.wikan-ai.my.id`.
Push this repo to GitHub and import it on Vercel — set
`NEXT_PUBLIC_API_URL=https://api.wikan-ai.my.id` as an environment
variable there. Nothing else to configure; there's no server-side secret
in this app.

## Layout

```
src/lib/api.ts            typed client for every Go API endpoint used here
src/lib/auth-context.tsx  token storage (localStorage), current user, login/register/logout
src/app/login, /register  auth forms
src/app/auth/callback     handles the Google OAuth redirect back from the API
src/app/(app)/layout.tsx  protected shell: nav, redirects to /login if unauthenticated
src/app/(app)/watch       watch list page + add modal + item card
src/app/(app)/books       book list page + add modal + item card
src/app/(app)/connections Trakt/Hardcover connect UI
src/components/Modal.tsx  shared modal shell
```
