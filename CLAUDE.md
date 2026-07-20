# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this app is

Next.js frontend for the Book & Watch Tracker. It is a **client-rendered SPA**, not a
server-backed Next.js app: every page is `"use client"`, there is no database or secret
API key here, and nothing relies on Server Actions or Route Handlers. All data comes
from a separate Go API (`book-watch-tracker`, a sibling repo) called directly from the
browser via `fetch`. The auth token lives in `localStorage` and is attached as
`Authorization: Bearer <token>` on every request.

Because there's no server runtime in this app, most of Next.js's server-side feature
set (Server Actions, Route Handlers, server-only env vars) doesn't apply here — routing
and layouts are effectively the only Next.js features in play.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm start        # run the production build
npm run lint     # eslint
npx tsc --noEmit # typecheck (no dedicated script, but this is how it's checked)
```

There is no test suite/framework configured in this repo. Verification here means:
`tsc --noEmit`, `npm run lint`, `npm run build` all clean, plus manually clicking
through flows in a browser — see "Not verified" in [README.md](README.md) and the
checklist in [TODO.md](TODO.md) for what still needs a real browser pass.

Local setup: `cp .env.example .env.local` (sets `NEXT_PUBLIC_API_URL`, defaults to the
live API). The live API's CORS config already allows `http://localhost:3000`, so local
dev works against the real backend without any backend changes.

If browser-testing `next dev` from a machine other than wherever it's running (e.g. a
VPS), add that machine's reachable address to `allowedDevOrigins` in
[next.config.ts](next.config.ts) — Next 16 otherwise blocks cross-origin HMR/RSC dev
resources by default and pages silently fail to hydrate (clicks fall back to native,
unhandled form submissions). Separately, the live API's CORS only allows
`http://localhost:3000` and the prod domain, so real login/register against the live API
only works from one of those two origins.

## Deployment

Live at `https://tracker.wikan-ai.my.id`, deployed via Vercel (auto-deploys on push to
`main` on GitHub, `wikan1602/book-watch-tracker-web`), with `NEXT_PUBLIC_API_URL` set as
a Vercel env var. The Go API is deployed separately (Docker/docker-compose) at
`api.wikan-ai.my.id`; Google/TMDB/Trakt/Google Books credentials live in *that* repo's
`.env`, never here — this app has no server-side secrets of its own, so nothing beyond
`NEXT_PUBLIC_API_URL` ever needs to go into Vercel's env vars.

## Architecture

- [src/lib/api.ts](src/lib/api.ts) — the single typed client for every Go API endpoint.
  All request/response shapes (watch items, book items, connections, search results) are
  defined here as the source of truth for API types. New API calls should be added here,
  not inlined in components. `request()` also triggers a registered "unauthorized"
  handler on any 401 outside `/api/v1/auth/*` (session-expired case; login/register's own
  401s for bad credentials are excluded — see `setUnauthorizedHandler`).
- [src/lib/auth-context.tsx](src/lib/auth-context.tsx) — `AuthProvider`/`useAuth`. Owns
  the token in `localStorage` (key from `api.TOKEN_KEY`), the current `user`, and
  `login`/`register`/`loginWithToken`/`logout`. Registers the 401 handler (clears the
  token, shows a toast, lets `(app)/layout.tsx`'s existing redirect effect take it from
  there). Wraps the whole app in [src/app/layout.tsx](src/app/layout.tsx).
- [src/lib/toast-context.tsx](src/lib/toast-context.tsx) — `ToastProvider`/`useToast`,
  mounted above `AuthProvider` in the root layout (so the auth context can use it too). A
  dismissible, auto-expiring (5s) toast stack, bottom-center.
- `src/app/page.tsx` — the root route: a welcome/landing page (Log in/Register in the
  header) for logged-out visitors; redirects straight to `/watch` if already
  authenticated. Not a plain redirect stub — don't reduce it back to one.
- [src/app/(app)/layout.tsx](src/app/(app)/layout.tsx) — the protected shell (nav +
  logout) for everything under the `(app)` route group. Redirects to `/login` client-side
  when `useAuth()` has no user once loading finishes. Add new authenticated pages inside
  `src/app/(app)/`.
- `src/app/login`, `src/app/register` — auth forms (email/password + Google sign-in
  button that links to `api.googleLoginUrl()`).
- `src/app/auth/callback` — handles the redirect back from the API's Google OAuth flow,
  which arrives as `?token=...`; calls `loginWithToken`.
- `src/app/(app)/watch` — watch list page, `WatchAddModal` (TMDB search + manual add),
  `WatchItemCard` (status + season/episode progress editing). Client-side paginated
  (`PAGE_SIZE = 10`) since the API returns the full list with no `limit`/`offset`.
- `src/app/(app)/books` — book list page, `BookAddModal` (Google Books / Open Library /
  Hardcover search with a source picker + manual add), `BookItemCard` (status + page or
  chapter/volume progress editing, which fields show depends on `format`). Same
  client-side pagination as `/watch`.
- `src/app/(app)/connections` — Trakt connect (redirect flow via
  `api.traktLoginUrl()`)/disconnect and Hardcover connect (user pastes a personal
  token)/disconnect.
- [src/components/Modal.tsx](src/components/Modal.tsx) — shared modal shell used by both
  add modals.
- [src/components/Pagination.tsx](src/components/Pagination.tsx) /
  [src/components/ListItemSkeleton.tsx](src/components/ListItemSkeleton.tsx) — shared
  across `/watch` and `/books`.

Status-upsert responses for watch/book items include a `trakt_sync`/`hardcover_sync`
field; when it's not `"skipped"`, the UI surfaces it as a small inline note next to the
item (this is how the third-party sync side effects of an update become visible).
`WatchItemCard`/`BookItemCard`'s `save()`/`remove()` report failures via `useToast()`
rather than failing silently.

## Known gaps worth knowing before touching related code

See [TODO.md](TODO.md) for the full handoff list. The significant one left:

- No UI to edit item details (title/author/format/year) after creation. Blocked on a
  design decision, not just UI — `book_items`/`watch_items` are a shared catalog
  deduplicated across all users, and the backend has no `PATCH` endpoint for them yet.
  See TODO.md for the full writeup.

Also: Open Library search (`/api/v1/openlibrary/search`) is implemented but
`openlibrary.org`/`archive.org` are unreachable from the API's VPS — a backend/network
issue, not something fixable from this repo. Google Books search is the working
alternative and is configured.

## Pending visual redesign

[design-brief.md](design-brief.md) is a scoping doc for an upcoming from-scratch visual
redesign (color direction: black + gold/yellow), written to hand off to a separate
design-focused session. If you land in this repo and the current zinc/neutral Tailwind
styling looks mid-change, check that file for the intended direction before assuming
something's broken.
