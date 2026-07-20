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

const SOURCES: { value: Source; label: string; hint: string }[] = [
  { value: "googlebooks", label: "Google Books", hint: "Broad catalog search" },
  {
    value: "openlibrary",
    label: "Open Library",
    hint: "Community-maintained records",
  },
  {
    value: "hardcover",
    label: "Hardcover",
    hint: "Matches your connected account",
  },
];

const FORMAT_OPTIONS: BookFormat[] = ["novel", "manga", "manhwa", "other"];

export default function BookAddModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [source, setSource] = useState<Source | null>(null);
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
    if (!query.trim() || !source) return;
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
    <Modal title="Add book" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {!manual ? (
          !source ? (
            <div className="flex flex-col gap-2.5">
              <p className="mb-1 text-[13px] text-ink-dim">
                Choose a source to search
              </p>
              {SOURCES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    setSource(s.value);
                    setResults(null);
                  }}
                  className="rounded-lg border border-border bg-surface-2 p-3.5 text-left"
                >
                  <div className="text-sm font-semibold text-ink">
                    {s.label}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-dim">{s.hint}</div>
                </button>
              ))}
              <button
                onClick={() => setManual(true)}
                className="self-start text-xs font-semibold text-ink-dim"
              >
                Can&apos;t find it? Add manually
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setSource(null);
                    setResults(null);
                  }}
                  className="text-[13px] text-ink-dim"
                >
                  ← Change
                </button>
                <span className="rounded bg-gold-dim px-2.5 py-1 text-[11px] font-bold text-gold">
                  {SOURCES.find((s) => s.value === source)?.label}
                </span>
              </div>
              {source === "hardcover" && (
                <p className="text-xs text-ink-dim">
                  Uses your own connected Hardcover account — connect it first
                  under Connections if search fails.
                </p>
              )}
              {source === "openlibrary" && (
                <p className="text-xs text-ink-dim">
                  Open Library may be unreachable from the server right now —
                  try Google Books if this fails.
                </p>
              )}

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books…"
                  className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-ink"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-on-gold disabled:opacity-50"
                >
                  {searching ? "..." : "Search"}
                </button>
              </form>

              {results && (
                <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                  {results.length === 0 && (
                    <li className="text-sm text-ink-dim">No results.</li>
                  )}
                  {results.map((r, i) => (
                    <li
                      key={`${r.isbn ?? r.hardcover_id ?? r.title}-${i}`}
                      className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                    >
                      <div className="h-13 w-9 flex-shrink-0 rounded bg-linear-to-br from-gold-dim to-surface-2" />
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-ink">
                          {r.title}
                          {r.authors && r.authors.length > 0 && (
                            <span className="font-normal text-ink-dim">
                              {" "}
                              — {r.authors[0]}
                            </span>
                          )}
                        </div>
                        {r.year && (
                          <div className="text-[11px] text-ink-dim">
                            {r.year}
                          </div>
                        )}
                      </div>
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
                        className="rounded-md border border-gold px-3 py-1.5 text-xs font-bold text-gold disabled:opacity-50"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-ink-dim">
                Added as &quot;novel&quot; by default — change the format
                after adding if it&apos;s manga/manhwa.
              </p>

              <button
                onClick={() => setManual(true)}
                className="self-start text-xs font-semibold text-ink-dim"
              >
                Can&apos;t find it? Add manually
              </button>
            </>
          )
        ) : (
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-ink-dim">
                Title
              </label>
              <input
                autoFocus
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-ink-dim">
                Author (optional)
              </label>
              <input
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-ink-dim">
                Format
              </label>
              <select
                value={manualFormat}
                onChange={(e) => setManualFormat(e.target.value as BookFormat)}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-ink"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="self-start rounded-md bg-gold px-4.5 py-2.5 text-[13px] font-bold text-on-gold disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add manually"}
            </button>
            <button
              type="button"
              onClick={() => setManual(false)}
              className="self-start text-xs font-semibold text-ink-dim"
            >
              Back to search
            </button>
          </form>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
