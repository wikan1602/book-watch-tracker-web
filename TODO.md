# TODO — Book & Watch Tracker Web

Handoff list for continuing frontend work in this directory. Context on
what's already built and how it's wired lives in [README.md](README.md);
backend architecture lives in `docs/blueprint.md` in the
`book-watch-tracker` repo (sibling directory, separate git repo).

- [x] **Real cover art** — done, per
      [docs/cover-images-integration.md](docs/cover-images-integration.md).
      `ItemCover` (`src/components/ItemCover.tsx`) renders a plain `<img>`
      for TMDB (`poster_path`, watch)/Hardcover (`cover_url`, books)/Open
      Library (built client-side from `isbn`), falling back to
      `CoverPlaceholder` on a missing or failed-to-load image. Also fixed
      the one gap the doc called out: `ListUserBookStatusWithItems`
      (backend) didn't join `bi.isbn`, so Open Library covers couldn't
      reach the persisted `/books` list, only the add-modal's search
      results — added the join + regenerated sqlc, confirmed live
      (`GET /me/book-list` now returns `isbn`). Not real-browser-verified
      (Chrome extension was disconnected this session) — confirmed via
      `tsc`/lint/build clean and curl round-trips against the live API
      (`poster_path` and `isbn` both persist and come back correctly).

## Before trusting v1

Most of this is now confirmed for real (not just curl) as of this session —
see notes per item. Still-open items are what's left before fully trusting
v1.

(One note on browser-testing `next dev` from a machine other than this VPS:
needs `allowedDevOrigins` in `next.config.ts` set to that machine's
reachable address, or Next 16 silently blocks HMR/RSC dev resources and
pages never hydrate — already set to this VPS's LAN IP; add your own if
different. Separately, the live API's CORS only allows
`http://localhost:3000` and the prod domain, so a browser on another
machine hitting the dev server via a non-localhost address can't complete
real login/register against the live API from there — same-machine
`localhost:3000`, or a tunnel that preserves that origin, is required for
that part. Some of the verification below used a temporary auth-free
preview route with hardcoded data instead, for exactly this reason.)

- [x] Register, log in, log out — register form checked directly in a real
      browser (incl. the confirm-password mismatch check added this
      session); the auth/session chain (token storage, authenticated shell,
      logout) already confirmed via a live end-to-end curl flow and via the
      real Google sign-in below.
- [x] Google sign-in round trip — `GOOGLE_CLIENT_ID`/`SECRET` now
      configured on the API; a real sign-in was completed and confirmed
      working.
- [x] TMDB search — `TMDB_API_KEY` now configured; confirmed returning
      real results via a real authenticated request. Not separately
      clicked through the "Add" button inside the modal UI itself.
- [ ] Add a watch item manually (the "can't find it?" fallback) — not
      clicked through.
- [ ] Update watch status, and season/episode progress for a show — the
      redesigned card UI for this was verified with mock data via a
      temporary preview route, not against the real API end-to-end.
- [ ] Remove a watch item — the new `ConfirmDialog` flow (replacing the
      browser's native `confirm()`) was verified with mock data, not
      end-to-end against the real API.
- [x] Google Books search — `GOOGLE_BOOKS_API_KEY` now configured;
      confirmed returning real results via a real authenticated request.
      Same caveat as TMDB — the modal's "Add" button itself wasn't clicked.
- [ ] Add a book manually — not clicked through.
- [ ] Update book status, and page/chapter/volume progress — same caveat
      as watch progress above (verified visually with mock data only).
- [x] Connect Trakt — `TRAKT_CLIENT_ID`/`SECRET` now configured; a real
      account was connected and confirmed working, including the
      callback-redirect fix (was landing on a 404 at `/settings`, now
      correctly lands on `/connections`).
- [ ] Connect Hardcover — still untested; needs a real personal token from
      hardcover.app.
- [ ] Check it on an actual mobile viewport — still never done.

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

## Deployment

Done. Live at `https://tracker.wikan-ai.my.id`, deployed via Vercel
(auto-deploys on push to `main` on GitHub, `wikan1602/book-watch-tracker-web`),
`NEXT_PUBLIC_API_URL=https://api.wikan-ai.my.id` set as the Vercel env var.
DNS points at Vercel via the same Domainesia panel used for the backend's
`api` A record. No backend change was needed — the prod domain was already
in the API's `CORS_ORIGINS`.

## Out of scope for this directory

- Native Android app — tracked separately, different session/room per
  the plan to keep it decoupled from this web codebase.
