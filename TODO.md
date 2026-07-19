# TODO — Book & Watch Tracker Web

Handoff list for continuing frontend work in this directory. Context on
what's already built and how it's wired lives in [README.md](README.md);
backend architecture lives in `docs/blueprint.md` in the
`book-watch-tracker` repo (sibling directory, separate git repo).

## Before trusting v1

Everything below was built and checked from a headless VPS shell
(`tsc`, lint, `next build`, curl smoke tests, a live end-to-end curl flow
against the real API) — none of it was clicked through in an actual
browser. Do that first:

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
      highest-priority gap.
- [ ] **No global 401 handling.** The JWT expires after 7 days with no
      refresh (matches the API's design). Right now an expired token
      just makes every API call fail with inline red error text instead
      of auto-logging-out and redirecting to `/login`. Worth a small
      wrapper in `lib/api.ts`'s `request()` that catches a 401 and calls
      `logout()` + redirects.
- [ ] No pagination on `/watch` or `/books` — fine at personal-tracker
      scale, will look wrong with a long list eventually.
- [ ] Error display is a single inline red `<p>` per form/card — no
      toast/snackbar system, nothing dismissible.
- [ ] No loading skeletons — lists show a plain "Loading..." text.

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
