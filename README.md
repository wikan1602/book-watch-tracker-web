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
`npm start` + curl smoke test on every route; a live end-to-end curl flow
(register → create watch item → set status → list) confirming the API's
JSON shape matches `lib/api.ts`'s TypeScript types exactly; CORS preflight
confirmed working for both `http://localhost:3000` and
`https://tracker.wikan-ai.my.id`.

Also now verified for real, not just curl: Google sign-in (real round trip,
confirmed working), Trakt connect (real account connected), TMDB and Google
Books search (both configured with real API keys, both returning real
results), the register form's validation (including the confirm-password
check), and the whole redesigned visual system (colors, cards, badges,
modal, toast, pagination, skeleton) in a real rendered browser in both light
and dark.

**Not yet verified:** clicking all the way through "search → Add button in
the modal → item appears in the list" for either Watch or Books (search
itself is confirmed working; the add flow itself hasn't been clicked
through end-to-end); Hardcover connect (needs a real personal token from
hardcover.app); an actual mobile viewport (Tailwind responsive classes were
written but never checked at a real narrow width). Open Library search is
implemented but `openlibrary.org`/`archive.org` are unreachable from the
API's VPS — a known backend/network issue, not fixable from this repo;
Google Books is the working alternative.

## Deploying

Live at `https://tracker.wikan-ai.my.id`, deployed via Vercel — auto-deploys
on every push to `main` on GitHub (`wikan1602/book-watch-tracker-web`).
`NEXT_PUBLIC_API_URL=https://api.wikan-ai.my.id` is set as a Vercel env var;
nothing else to configure there, since there's no server-side secret in this
app. DNS for the subdomain points at Vercel, same Domainesia panel used for
the backend's `api` A record.

## Layout

```
src/lib/api.ts               typed client for every Go API endpoint used here
src/lib/auth-context.tsx     token storage (localStorage), current user, login/register/logout
src/lib/toast-context.tsx    dismissible toast/snackbar stack
src/app/page.tsx             landing page (logged out) / redirects to /watch (logged in)
src/app/login, /register     auth forms
src/app/auth/callback        handles the Google OAuth redirect back from the API
src/app/(app)/layout.tsx     protected shell: nav, redirects to /login if unauthenticated
src/app/(app)/watch          watch list page + add modal + item card
src/app/(app)/books          book list page + add modal + item card
src/app/(app)/connections    Trakt/Hardcover connect UI
src/components/Modal.tsx           shared modal shell
src/components/ConfirmDialog.tsx   Cancel/confirm prompt (wraps Modal), used by item removal
src/components/StatusBadge.tsx     the 5 status pill styles
src/components/CoverPlaceholder.tsx monogram cover art placeholder
src/components/Pagination.tsx      shared pagination controls
src/components/ListItemSkeleton.tsx shared loading-skeleton card
```

## Visual design

Black + gold palette — see [design-brief.md](design-brief.md) for the
original brief and `CLAUDE.md`'s "Visual design system" section for how the
color tokens/fonts are wired up in `globals.css`.
