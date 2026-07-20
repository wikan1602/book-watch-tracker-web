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

## Architecture

- [src/lib/api.ts](src/lib/api.ts) — the single typed client for every Go API endpoint.
  All request/response shapes (watch items, book items, connections, search results) are
  defined here as the source of truth for API types. New API calls should be added here,
  not inlined in components.
- [src/lib/auth-context.tsx](src/lib/auth-context.tsx) — `AuthProvider`/`useAuth`. Owns
  the token in `localStorage` (key from `api.TOKEN_KEY`), the current `user`, and
  `login`/`register`/`loginWithToken`/`logout`. Wraps the whole app in
  [src/app/layout.tsx](src/app/layout.tsx).
- [src/app/(app)/layout.tsx](src/app/(app)/layout.tsx) — the protected shell (nav +
  logout) for everything under the `(app)` route group. Redirects to `/login` client-side
  when `useAuth()` has no user once loading finishes. Add new authenticated pages inside
  `src/app/(app)/`.
- `src/app/login`, `src/app/register` — auth forms (email/password + Google sign-in
  button that links to `api.googleLoginUrl()`).
- `src/app/auth/callback` — handles the redirect back from the API's Google OAuth flow,
  which arrives as `?token=...`; calls `loginWithToken`.
- `src/app/(app)/watch` — watch list page, `WatchAddModal` (TMDB search + manual add),
  `WatchItemCard` (status + season/episode progress editing).
- `src/app/(app)/books` — book list page, `BookAddModal` (Google Books / Open Library /
  Hardcover search with a source picker + manual add), `BookItemCard` (status + page or
  chapter/volume progress editing, which fields show depends on `format`).
- `src/app/(app)/connections` — Trakt connect (redirect flow via
  `api.traktLoginUrl()`)/disconnect and Hardcover connect (user pastes a personal
  token)/disconnect.
- [src/components/Modal.tsx](src/components/Modal.tsx) — shared modal shell used by both
  add modals.

Status-upsert responses for watch/book items include a `trakt_sync`/`hardcover_sync`
field; when it's not `"skipped"`, the UI surfaces it as a small inline note next to the
item (this is how the third-party sync side effects of an update become visible).

## Known gaps worth knowing before touching related code

See [TODO.md](TODO.md) for the full handoff list. The significant ones:

- No global 401 handling — an expired JWT (7-day expiry, no refresh) currently just
  makes API calls fail with inline red error text instead of auto-logout + redirect.
- No UI to edit item details (title/author/format/year) after creation — book search
  always creates with `format: "novel"`.
- No pagination on `/watch` or `/books`.
