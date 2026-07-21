"use client";

import { useState, FormEvent } from "react";
import Modal from "@/components/Modal";
import {
  ApiError,
  TmdbResult,
  createWatchItem,
  searchTmdb,
  upsertWatchStatus,
} from "@/lib/api";
import { tmdbPosterUrl } from "@/lib/cover";
import ItemCover from "@/components/ItemCover";

export default function WatchAddModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [manualType, setManualType] = useState<"movie" | "show">("movie");
  const [manualYear, setManualYear] = useState("");

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      setResults(await searchTmdb(query.trim()));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Search failed. Is TMDB configured?",
      );
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addItem(input: {
    type: "movie" | "show";
    title: string;
    year?: number;
    tmdb_id?: string;
    poster_path?: string;
  }) {
    setAdding(true);
    setError(null);
    try {
      const item = await createWatchItem(input);
      await upsertWatchStatus(item.id, { status: "plan_to_watch" });
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
      type: manualType,
      title: query.trim(),
      year: manualYear ? Number(manualYear) : undefined,
    });
  }

  return (
    <Modal title="Add movie or show" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex w-fit gap-1 rounded-lg bg-surface-2 p-1">
          <button
            onClick={() => setManual(false)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold ${
              !manual ? "shadow-app bg-surface text-gold" : "text-ink-dim"
            }`}
          >
            Search TMDB
          </button>
          <button
            onClick={() => setManual(true)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold ${
              manual ? "shadow-app bg-surface text-gold" : "text-ink-dim"
            }`}
          >
            Manual entry
          </button>
        </div>

        {!manual ? (
          <>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies & shows…"
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
                {results.map((r) => (
                  <li
                    key={`${r.type}-${r.tmdb_id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                  >
                    <ItemCover
                      variant="thumb"
                      title={r.title}
                      src={tmdbPosterUrl(r.poster_path)}
                    />
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-ink">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-ink-dim">
                        {r.year && `${r.year} · `}
                        {r.type}
                      </div>
                    </div>
                    <button
                      disabled={adding}
                      onClick={() =>
                        addItem({
                          type: r.type,
                          title: r.title,
                          year: r.year,
                          tmdb_id: r.tmdb_id,
                          poster_path: r.poster_path,
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
          </>
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
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-[11px] font-semibold text-ink-dim">
                  Year
                </label>
                <input
                  type="number"
                  value={manualYear}
                  onChange={(e) => setManualYear(e.target.value)}
                  className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-ink"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-[11px] font-semibold text-ink-dim">
                  Type
                </label>
                <select
                  value={manualType}
                  onChange={(e) =>
                    setManualType(e.target.value as "movie" | "show")
                  }
                  className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-ink"
                >
                  <option value="movie">Movie</option>
                  <option value="show">Show</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="self-start rounded-md bg-gold px-4.5 py-2.5 text-[13px] font-bold text-on-gold disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add manually"}
            </button>
          </form>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
