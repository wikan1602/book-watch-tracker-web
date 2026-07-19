"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, BookListEntry, listMyBookList } from "@/lib/api";
import BookAddModal from "./BookAddModal";
import BookItemCard from "./BookItemCard";

export default function BooksPage() {
  const [items, setItems] = useState<BookListEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    listMyBookList()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(load, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Book list</h1>
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
          Nothing here yet — add a book to get started.
        </p>
      )}

      <ul className="space-y-3">
        {items?.map((entry) => (
          <BookItemCard
            key={entry.book_item_id}
            entry={entry}
            onChanged={(updated) =>
              setItems((prev) =>
                prev?.map((it) =>
                  it.book_item_id === updated.book_item_id
                    ? { ...it, ...updated }
                    : it,
                ) ?? null,
              )
            }
            onRemoved={() =>
              setItems(
                (prev) =>
                  prev?.filter(
                    (it) => it.book_item_id !== entry.book_item_id,
                  ) ?? null,
              )
            }
          />
        ))}
      </ul>

      {showAdd && (
        <BookAddModal
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
