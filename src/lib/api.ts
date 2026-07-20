// Typed client for the Book & Watch Tracker Go API. Every call attaches
// the bearer token from localStorage (see auth-context.tsx) — this app
// talks to the API directly from the browser rather than proxying through
// Next.js server code, so there's no server-side secret to protect here.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const TOKEN_KEY = "bwt_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Set by AuthProvider so a 401 from an authenticated call can clear the
// session and bounce to /login, instead of just failing inline. Auth
// endpoints themselves (login/register) also return 401 for bad
// credentials — that's not a session expiry, so request() below excludes
// them rather than firing this.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/v1/auth/")) {
      onUnauthorized?.();
    }
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return body as T;
}

// ---- Auth ----

export type User = { id: string; email: string; is_demo: boolean };
export type AuthResponse = { token: string; user: User };

export function register(email: string, password: string) {
  return request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return request<User>("/api/v1/me");
}

export function googleLoginUrl(): string {
  return `${API_URL}/api/v1/auth/google/login`;
}

// ---- Watch items ----

export type WatchStatus =
  | "plan_to_watch"
  | "watching"
  | "completed"
  | "on_hold"
  | "dropped";

export type WatchItem = {
  id: string;
  type: "movie" | "show";
  title: string;
  year: number | null;
  source: string;
  trakt_id: string | null;
  tmdb_id: string | null;
};

export type WatchListEntry = {
  watch_item_id: string;
  type: "movie" | "show";
  title: string;
  year: number | null;
  status: WatchStatus;
  current_season: number | null;
  current_episode: number | null;
  total_episodes: number | null;
  updated_at: string;
};

export function listMyWatchList() {
  return request<WatchListEntry[]>("/api/v1/me/watch-list");
}

export function createWatchItem(input: {
  type: "movie" | "show";
  title: string;
  year?: number;
  tmdb_id?: string;
}) {
  return request<WatchItem>("/api/v1/watch-items", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function upsertWatchStatus(
  watchItemId: string,
  input: {
    status: WatchStatus;
    current_season?: number;
    current_episode?: number;
    total_episodes?: number;
  },
) {
  return request<WatchListEntry & { trakt_sync: string }>(
    `/api/v1/watch-items/${watchItemId}/status`,
    { method: "PUT", body: JSON.stringify(input) },
  );
}

export function deleteWatchStatus(watchItemId: string) {
  return request<void>(`/api/v1/watch-items/${watchItemId}/status`, {
    method: "DELETE",
  });
}

// ---- Book items ----

export type BookStatus =
  | "want_to_read"
  | "reading"
  | "completed"
  | "on_hold"
  | "dropped";

export type BookFormat = "novel" | "manga" | "manhwa" | "other";

export type BookItem = {
  id: string;
  title: string;
  author: string | null;
  format: BookFormat;
  source: string;
  hardcover_id: string | null;
  isbn: string | null;
};

export type BookListEntry = {
  book_item_id: string;
  title: string;
  author: string | null;
  format: BookFormat;
  status: BookStatus;
  current_page: number | null;
  total_pages: number | null;
  current_chapter: number | null;
  current_volume: number | null;
  total_chapters: number | null;
  updated_at: string;
};

export function listMyBookList() {
  return request<BookListEntry[]>("/api/v1/me/book-list");
}

export function createBookItem(input: {
  title: string;
  author?: string;
  format: BookFormat;
  isbn?: string;
  hardcover_id?: string;
}) {
  return request<BookItem>("/api/v1/book-items", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function upsertBookStatus(
  bookItemId: string,
  input: {
    status: BookStatus;
    current_page?: number;
    total_pages?: number;
    current_chapter?: number;
    current_volume?: number;
    total_chapters?: number;
  },
) {
  return request<BookListEntry & { hardcover_sync: string }>(
    `/api/v1/book-items/${bookItemId}/status`,
    { method: "PUT", body: JSON.stringify(input) },
  );
}

export function deleteBookStatus(bookItemId: string) {
  return request<void>(`/api/v1/book-items/${bookItemId}/status`, {
    method: "DELETE",
  });
}

// ---- Search ----

export type TmdbResult = {
  tmdb_id: string;
  type: "movie" | "show";
  title: string;
  year?: number;
};

export function searchTmdb(query: string) {
  return request<TmdbResult[]>(
    `/api/v1/tmdb/search?q=${encodeURIComponent(query)}`,
  );
}

export type BookSearchResult = {
  title: string;
  authors?: string[];
  year?: number;
  isbn?: string;
  hardcover_id?: string;
};

export function searchGoogleBooks(query: string) {
  return request<BookSearchResult[]>(
    `/api/v1/googlebooks/search?q=${encodeURIComponent(query)}`,
  );
}

export function searchOpenLibrary(query: string) {
  return request<BookSearchResult[]>(
    `/api/v1/openlibrary/search?q=${encodeURIComponent(query)}`,
  );
}

export function searchHardcover(query: string) {
  return request<BookSearchResult[]>(
    `/api/v1/hardcover/search?q=${encodeURIComponent(query)}`,
  );
}

// ---- Connections ----

export type Connection = { provider: string; expires_at?: string };

export function listConnections() {
  return request<Connection[]>("/api/v1/connections");
}

export function traktLoginUrl() {
  return request<{ url: string }>("/api/v1/connections/trakt/login");
}

export function disconnectTrakt() {
  return request<void>("/api/v1/connections/trakt", { method: "DELETE" });
}

export function connectHardcover(token: string) {
  return request<{ connected: string; username: string }>(
    "/api/v1/connections/hardcover",
    { method: "POST", body: JSON.stringify({ token }) },
  );
}

export function disconnectHardcover() {
  return request<void>("/api/v1/connections/hardcover", {
    method: "DELETE",
  });
}
