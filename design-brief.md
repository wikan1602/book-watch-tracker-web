# Design brief — Book & Watch Tracker

Redesign the visual design of an existing Next.js + Tailwind CSS app called
"Book & Watch Tracker" — a personal tracker for movies/shows (synced with
Trakt) and books (synced with Hardcover). The app is fully functional;
this is a visual-only redesign, not a rebuild — I still need to be able to
map the new design back onto the current React components without breaking
functionality.

## Color direction
Black + gold/yellow. Something that feels premium/classic (think a private
library or awards-night feel), not cheap or garish. Needs both a strong
dark mode (black base, gold accents) — light mode can either be a warm
cream/parchment base with gold+black accents, or the app can go dark-only
if that fits the concept better (open to a recommendation here).

## Screens in scope
1. **Landing page** (`/`) — welcome/marketing page, Login/Register links in
   a top-right header, hero headline + CTA buttons. Currently placeholder.
2. **Login** and **Register** — email/password form + "Sign in with Google"
   button.
3. **Auth callback** — small transient "Signing you in..." state + an
   error fallback ("Could not complete sign-in", link back to login).
4. **App shell** (used on every authenticated page) — top nav with 3 tabs
   (Watch / Books / Connections), current user's email, Logout button.
5. **Watch list** — a list of tracked movies/shows. Each card shows title,
   year, type (movie/show), a status dropdown (Plan to watch / Watching /
   Completed / On hold / Dropped), season/episode number inputs + a "Save
   progress" button (shows only appear), a Remove action, and an optional
   small "Trakt: synced" note. Plus: an "Add" modal (search via TMDB, or a
   manual-entry fallback form), pagination controls, a loading-skeleton
   state, and an empty state ("Nothing here yet — add a movie or show to
   get started").
6. **Books list** — same shape as Watch, but format-dependent progress
   fields (page number for novels; chapter + volume for manga/manhwa), and
   the add modal has a source picker (Google Books / Open Library /
   Hardcover) before search.
7. **Connections** — two cards (Trakt, Hardcover), each showing a
   Connected/Not connected badge and a Connect/Disconnect action.
   Hardcover's connect form is a pasted personal API token instead of an
   OAuth redirect.
8. **Shared pieces**: a modal shell (used by both add flows), toast/snackbar
   notifications (currently a plain red-or-white bar, bottom-center,
   dismissible), pagination (Previous / "Page X of Y" / Next).

## Current stack constraints
- Next.js App Router, Tailwind CSS v4, React 19. Styling is all Tailwind
  utility classes directly in `.tsx` files — no separate design-token file
  yet, no component library beyond what's hand-rolled here.
- Dark mode already works via Tailwind's `dark:` variant throughout: keep
  that mechanism (or replace consistently) rather than a one-off.
- Mobile responsiveness exists in the classes but has never been visually
  checked at a real mobile viewport — worth a deliberate pass, not just an
  afterthought.
- Everything is client-rendered (no server-side design constraints); feel
  free to suggest animation/transitions since there's no SSR to fight.

## What I want out of this
A cohesive visual system (colors, type scale, spacing, component states:
default/hover/disabled/loading/error) applied consistently across all the
screens above — not just a homepage facelift. Please call out anywhere the
gold/black direction creates an accessibility problem (contrast especially)
before finalizing.
