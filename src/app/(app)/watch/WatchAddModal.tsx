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
    <Modal title="Add to watch list" onClose={onClose}>
      <div className="space-y-4">
        {!manual ? (
          <>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a movie or show..."
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
                {results.map((r) => (
                  <li key={`${r.type}-${r.tmdb_id}`}>
                    <button
                      disabled={adding}
                      onClick={() =>
                        addItem({
                          type: r.type,
                          title: r.title,
                          year: r.year,
                          tmdb_id: r.tmdb_id,
                        })
                      }
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
                    >
                      <span>
                        {r.title}{" "}
                        {r.year && (
                          <span className="text-zinc-400">({r.year})</span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-400">{r.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

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
            <div className="flex gap-2">
              <select
                value={manualType}
                onChange={(e) =>
                  setManualType(e.target.value as "movie" | "show")
                }
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="movie">Movie</option>
                <option value="show">Show</option>
              </select>
              <input
                type="number"
                value={manualYear}
                onChange={(e) => setManualYear(e.target.value)}
                placeholder="Year (optional)"
                className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
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
