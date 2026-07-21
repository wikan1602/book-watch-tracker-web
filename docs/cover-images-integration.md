# Integrating real cover art (web)

Companion to the backend's `docs/android-integration.md` and
`cover-images-proposal.md` (in the `book-watch-tracker` repo, sibling
directory) — this is the same feature from the web client's side.
Backend Tracks B and C are now live on `https://api.wikan-ai.my.id`;
nothing here needs a backend change except the one gap called out below.
Every shape in this doc was checked directly against the current backend
source and a live response, not assumed.

Right now every card (`WatchItemCard.tsx`, `BookItemCard.tsx`) always
renders `<CoverPlaceholder title={entry.title} />` — a letter-on-gradient
box — and both add-modals (`WatchAddModal.tsx`, `BookAddModal.tsx`) render
a plain empty gradient `<div className="h-13 w-9 ... from-gold-dim
to-surface-2" />` for each search result row. None of that is
conditional on anything yet.

## What's new on the API

- **Watch (`poster_path`)** — TMDB's raw image path, not a full URL.
  Present (as a string) or explicitly `null` on `GET /watch-items/:id`
  and `GET /me/watch-list`; **omitted** (not `null`) on `GET
  /tmdb/search` when TMDB has none. Build the real URL yourself:
  `https://image.tmdb.org/t/p/{size}${poster_path}` — e.g. `w185` for a
  grid card, `w500` for a detail view.
- **Books (`cover_url`)** — Hardcover's own cover, already a **full,
  directly-usable URL** (no size template). Present/`null` on `GET
  /book-items/:id` and `GET /me/book-list`. It is **not** returned by
  `GET /hardcover/search` — Hardcover's search API has no image field at
  all for books (confirmed against their docs); the backend fetches it
  separately, once, when you `POST /book-items` with a `hardcover_id`,
  and only if that user has a connected Hardcover account. A book added
  without a connected Hardcover account will have `cover_url: null`
  forever unless re-added — there's no backfill.
- **Books via ISBN (Open Library)** — no new API field; `isbn` already
  existed on `BookSearchResult` (Google Books/Open Library search) and on
  `GET /book-items/:id`. Build the cover URL client-side:
  `https://covers.openlibrary.org/b/isbn/{isbn}-{size}.jpg` (sizes `S`,
  `M`, `L`). This is the only track that needs zero backend change.

**⚠️ Known gap — Track A doesn't reach the `/books` list page yet.**
`GET /me/book-list` (`ListUserBookStatusWithItems` in the backend) joins
`title/author/format/cover_url` but **not `isbn`** — so an ISBN-built
Open Library cover can only be shown in `BookAddModal`'s search-results
row (where `BookSearchResult.isbn` is already present), not on the
persisted `BookItemCard` after it's added. `poster_path` and `cover_url`
don't have this problem — both are already joined into their respective
`/me/*-list` endpoints. If you want Open Library covers on the actual
book list (not just at add-time), that needs a small backend addition
(`bi.isbn` added to that one query) — flag it back if you want that done
before building this out, otherwise document it as a known limitation.

## TypeScript types to update (`src/lib/api.ts`)

```ts
export type WatchItem = {
  // ...existing fields
  poster_path: string | null;
};

export type WatchListEntry = {
  // ...existing fields
  poster_path: string | null;
};

export type TmdbResult = {
  tmdb_id: string;
  type: "movie" | "show";
  title: string;
  year?: number;
  poster_path?: string; // omitted, not null, when TMDB has none
};

// createWatchItem's input type needs poster_path passed through so it
// gets persisted:
export function createWatchItem(input: {
  type: "movie" | "show";
  title: string;
  year?: number;
  tmdb_id?: string;
  poster_path?: string;
}) { ... }
```

```ts
export type BookItem = {
  // ...existing fields
  cover_url: string | null;
};

export type BookListEntry = {
  // ...existing fields
  cover_url: string | null;
};
```

`BookSearchResult` and `createBookItem`'s input need **no changes** —
`cover_url` is derived server-side from `hardcover_id`, not client-supplied
(unlike `poster_path`, which the client must pass through explicitly from
the TMDB search result since watch items have no equivalent server-side
fetch step).

## Where to wire it in

- **`src/app/(app)/watch/WatchItemCard.tsx`** — replace the
  unconditional `<CoverPlaceholder title={entry.title} />` with: build
  the TMDB URL if `entry.poster_path` is set, else `CoverPlaceholder`.
- **`src/app/(app)/watch/WatchAddModal.tsx`** (~line 128, the `<div
  className="h-13 w-9 ...">` placeholder in the results `<li>`) — same
  idea, using `r.poster_path` from the search result.
- **`src/app/(app)/books/BookItemCard.tsx`** — same, keyed off
  `entry.cover_url` directly (already a full URL, no template needed).
- **`src/app/(app)/books/BookAddModal.tsx`** (~line 189, same placeholder
  pattern) — Google Books/Open Library results carry `isbn`, not
  `cover_url`; build the Open Library URL from `r.isbn` if present.
  Hardcover search results have neither `isbn` nor `cover_url` at search
  time (see the gap above) — that row stays on the placeholder until
  after it's added.

## Implementation notes (Next.js-specific)

- **`next/image` vs plain `<img>`**: `next/image` needs every distinct
  external host allow-listed in `next.config.ts`'s
  `images.remotePatterns` — fine for TMDB (`image.tmdb.org`, fixed,
  known today) and Open Library (`covers.openlibrary.org`, fixed, known
  today), but Hardcover's actual image host is **unconfirmed** — this
  integration has never been exercised against a real connected
  Hardcover account (same caveat as the rest of the backend's Hardcover
  code), so the hostname in a real `cover_url` isn't known yet. Options:
  add the real host to `remotePatterns` once you see one in practice, or
  just use a plain `<img>` for `cover_url` specifically (unoptimized but
  needs no allow-list) and reserve `next/image` for TMDB/Open Library
  where the host is fixed.
- **Fallback on load failure**: Open Library's ISBN coverage has real
  gaps (a valid ISBN can still 404). `next/image` doesn't auto-fallback
  like Coil does on Android — handle it yourself with the `onError` prop
  (client component) to swap to `CoverPlaceholder` when the image fails
  to load, not just when the field is `null`.
- **`current` config**: `next.config.ts` currently has no
  `images.remotePatterns` at all — this is a net-new addition, not an
  edit to something existing.

## Suggested order

1. Types + `WatchItemCard`/`WatchAddModal` (TMDB `poster_path`) — fully
   backend-ready today, no gaps.
2. `BookItemCard` (Hardcover `cover_url`) — fully backend-ready, but
   untested against a real Hardcover account; expect `null` in practice
   until one is connected and verified.
3. `BookAddModal` Open Library ISBN covers — works today for the search
   results themselves; decide on the list-page gap above before treating
   this as "done" everywhere.
