"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, WatchListEntry, listMyWatchList } from "@/lib/api";
import WatchAddModal from "./WatchAddModal";
import WatchItemCard from "./WatchItemCard";

export default function WatchPage() {
  const [items, setItems] = useState<WatchListEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    listMyWatchList()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(load, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Watch list</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          + Add
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {items === null && !error && (
        <p className="text-sm text-zinc-500">Loading...</p>
      )}
      {items?.length === 0 && (
        <p className="text-sm text-zinc-500">
          Nothing here yet — add a movie or show to get started.
        </p>
      )}

      <ul className="space-y-3">
        {items?.map((entry) => (
          <WatchItemCard
            key={entry.watch_item_id}
            entry={entry}
            onChanged={(updated) =>
              setItems((prev) =>
                prev?.map((it) =>
                  it.watch_item_id === updated.watch_item_id
                    ? { ...it, ...updated }
                    : it,
                ) ?? null,
              )
            }
            onRemoved={() =>
              setItems(
                (prev) =>
                  prev?.filter(
                    (it) => it.watch_item_id !== entry.watch_item_id,
                  ) ?? null,
              )
            }
          />
        ))}
      </ul>

      {showAdd && (
        <WatchAddModal
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}
