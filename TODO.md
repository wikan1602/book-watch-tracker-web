# TODO — Book & Watch Tracker Web

Handoff list for continuing frontend work in this directory. Context on
what's already built and how it's wired lives in [README.md](README.md);
backend architecture lives in `docs/blueprint.md` in the
`book-watch-tracker` repo (sibling directory, separate git repo).

## Before trusting v1

Everything below was built and checked from a headless VPS shell
(`tsc`, lint, `next build`, curl smoke tests, a live end-to-end curl flow
against the real API) — none of it was clicked through in an actual
browser against the real API. Do that first:

(One note for whoever does this: testing `next dev` from a browser on a
*different* machine than this VPS needs `allowedDevOrigins` in
`next.config.ts` set to that machine's reachable address, or Next 16
silently blocks HMR/RSC dev resources and pages never hydrate — already
set to this VPS's LAN IP; add your own if different. Separately, the live
API's CORS only allows `http://localhost:3000` and the prod domain, so a
browser on another machine hitting the dev server via a non-localhost
address will never be able to complete real login/register against the
live API — same-machine `localhost:3000`, or a tunnel that preserves that
origin, is required for that part. The pagination/skeleton/toast UI
below *was* browser-verified, but via a temporary auth-free preview route
with hardcoded data — not through a real login.)

- [ ] Register, log in, log out
- [ ] Google sign-in round trip (needs `GOOGLE_CLIENT_ID`/`SECRET` set on
      the API first — currently unconfigured there)
- [ ] Add a watch item via TMDB search (needs `TMDB_API_KEY` set on the
      API — currently unconfigured there)
- [ ] Add a watch item manually (the "can't find it?" fallback)
- [ ] Update watch status, and season/episode progress for a show
- [ ] Remove a watch item
- [ ] Add a book via Google Books search (needs `GOOGLE_BOOKS_API_KEY`
      set on the API — currently unconfigured there)
- [ ] Add a book manually
- [ ] Update book status, and page (novel) or chapter/volume
      (manga/manhwa) progress
- [ ] Connect Trakt (needs `TRAKT_CLIENT_ID`/`SECRET` set on the API —
      currently unconfigured there) — verify the fetch-then-redirect
      flow actually lands back on `/watch` with the connection showing
- [ ] Connect Hardcover (needs a real personal token from hardcover.app)
- [ ] Check it on an actual mobile viewport — Tailwind classes were
      written but never visually checked at any size

## Known gaps

- [ ] **No way to edit item details after creation** — title, author,
      format, year. Book search always creates with `format: "novel"`;
      there's no UI to change it to manga/manhwa afterward. Probably the
      highest-priority gap. **Blocked on a design decision, not just UI:**
      `book_items`/`watch_items` are a shared catalog deduplicated across
      all users (by `hardcover_id`/`isbn` or `tmdb_id` — see
      `book-watch-tracker` repo's `internal/handlers/book_items.go` and
      migration `000004_book_items_external_unique`). The backend has no
      `PATCH /book-items/:id` (or `/watch-items/:id`) yet, so this needs a
      new endpoint there too, and a call on whether an edit changes the
      shared catalog row (simple, but visible to every other user tracking
      the same book/show) or is a per-user override (needs a new column on
      `user_book_status`/`user_watch_status` instead).
- [x] **No global 401 handling** — fixed. `lib/api.ts`'s `request()` now
      calls a registered "unauthorized" handler on any 401 outside
      `/api/v1/auth/*` (those return 401 for bad login credentials, not
      session expiry). `AuthProvider` registers it to clear the stored
      token and `setUser(null)`; the existing redirect-to-`/login` effect
      in `(app)/layout.tsx` picks that up automatically.
- [x] **No pagination on `/watch` or `/books`** — fixed, client-side.
      Backend has no `limit`/`offset` on `GET /me/watch-list` or
      `/me/book-list` (checked `book-watch-tracker`'s sqlc queries — they
      return the full list, ordered `updated_at DESC`), so both pages now
      slice the already-fetched array 10 items/page via
      `src/components/Pagination.tsx`. New items land on page 1 (list is
      newest-first and `onAdded` resets `page` to 1).
- [x] **Error display had nothing dismissible** — added a toast/snackbar
      system (`src/lib/toast-context.tsx`, mounted in root layout). Used
      it specifically for `WatchItemCard`/`BookItemCard`'s `save()` and
      `remove()`, which previously had **no error handling at all** (a
      failed request just failed silently) — now shows a dismissible
      toast. Also wired into the 401 handler ("Session expired..."). Left
      the existing inline form errors (login/register/add modals) as-is —
      already contextual and working.
- [x] **No loading skeletons** — fixed. `src/components/ListItemSkeleton.tsx`
      replaces the "Loading..." text on `/watch` and `/books`.

## Deployment (not started)

- [ ] Push this repo to GitHub
- [ ] Import into Vercel, set env var `NEXT_PUBLIC_API_URL=https://api.wikan-ai.my.id`
- [ ] Point `tracker.wikan-ai.my.id` DNS at Vercel — same Domainesia
      panel used to add the `api` A record (see the backend repo's
      conversation history / README for that process)
- [ ] `https://tracker.wikan-ai.my.id` is already in the API's
      `CORS_ORIGINS` — no backend change needed once this is live

## Out of scope for this directory

- Native Android app — tracked separately, different session/room per
  the plan to keep it decoupled from this web codebase.
