"use client";

import { useState, FormEvent } from "react";
import Modal from "@/components/Modal";
import {
  ApiError,
  BookFormat,
  BookSearchResult,
  createBookItem,
  searchGoogleBooks,
  searchHardcover,
  searchOpenLibrary,
  upsertBookStatus,
} from "@/lib/api";

type Source = "googlebooks" | "openlibrary" | "hardcover";

const SOURCE_LABELS: Record<Source, string> = {
  googlebooks: "Google Books",
  openlibrary: "Open Library",
  hardcover: "Hardcover",
};

const FORMAT_OPTIONS: BookFormat[] = ["novel", "manga", "manhwa", "other"];

export default function BookAddModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [source, setSource] = useState<Source>("googlebooks");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualFormat, setManualFormat] = useState<BookFormat>("novel");

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const fn =
        source === "googlebooks"
          ? searchGoogleBooks
          : source === "openlibrary"
            ? searchOpenLibrary
            : searchHardcover;
      setResults(await fn(query.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addItem(input: {
    title: string;
    author?: string;
    format: BookFormat;
    isbn?: string;
    hardcover_id?: string;
  }) {
    setAdding(true);
    setError(null);
    try {
      const item = await createBookItem(input);
      await upsertBookStatus(item.id, { status: "want_to_read" });
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add item");
    } finally {
      setAdding(false);
    }
  }

  function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    addItem({
      title: query.trim(),
      author: manualAuthor.trim() || undefined,
      format: manualFormat,
    });
  }

  return (
    <Modal title="Add a book" onClose={onClose}>
      <div className="space-y-4">
        {!manual ? (
          <>
            <div className="flex gap-2">
              {(Object.keys(SOURCE_LABELS) as Source[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSource(s);
                    setResults(null);
                  }}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    source === s
                      ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                      : "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
            {source === "hardcover" && (
              <p className="text-xs text-zinc-400">
                Uses your own connected Hardcover account — connect it first
                under Connections if search fails.
              </p>
            )}
            {source === "openlibrary" && (
              <p className="text-xs text-zinc-400">
                Open Library may be unreachable from the server right now —
                try Google Books if this fails.
              </p>
            )}

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a book..."
                className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {searching ? "..." : "Search"}
              </button>
            </form>

            {results && (
              <ul className="max-h-72 space-y-1 overflow-y-auto">
                {results.length === 0 && (
                  <li className="text-sm text-zinc-500">No results.</li>
                )}
                {results.map((r, i) => (
                  <li key={`${r.isbn ?? r.hardcover_id ?? r.title}-${i}`}>
                    <button
                      disabled={adding}
                      onClick={() =>
                        addItem({
                          title: r.title,
                          author: r.authors?.[0],
                          format: "novel",
                          isbn: r.isbn,
                          hardcover_id: r.hardcover_id,
                        })
                      }
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
                    >
                      <span>
                        {r.title}{" "}
                        {r.authors && r.authors.length > 0 && (
                          <span className="text-zinc-400">
                            — {r.authors[0]}
                          </span>
                        )}
                      </span>
                      {r.year && (
                        <span className="text-xs text-zinc-400">
                          {r.year}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-zinc-400">
              Added as &quot;novel&quot; by default — change the format after
              adding if it&apos;s manga/manhwa.
            </p>

            <button
              onClick={() => setManual(true)}
              className="text-xs text-zinc-500 underline"
            >
              Can&apos;t find it? Add manually
            </button>
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              autoFocus
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              value={manualAuthor}
              onChange={(e) => setManualAuthor(e.target.value)}
              placeholder="Author (optional)"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <select
              value={manualFormat}
              onChange={(e) => setManualFormat(e.target.value as BookFormat)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={adding}
              className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {adding ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setManual(false)}
              className="text-xs text-zinc-500 underline"
            >
              Back to search
            </button>
          </form>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
