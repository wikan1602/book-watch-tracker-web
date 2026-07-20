"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, BookListEntry, listMyBookList } from "@/lib/api";
import BookAddModal from "./BookAddModal";
import BookItemCard from "./BookItemCard";
import ListItemSkeleton from "@/components/ListItemSkeleton";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

export default function BooksPage() {
  const [items, setItems] = useState<BookListEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    listMyBookList()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(load, [load]);

  const pageCount = Math.max(1, Math.ceil((items?.length ?? 0) / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = items?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-[28px] font-bold text-ink">Books</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-gold px-5 py-2.75 text-sm font-bold text-on-gold"
        >
          + Add book
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {items === null && !error && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </ul>
      )}
      {items?.length === 0 && (
        <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-10 text-center">
          <span className="text-sm text-ink-dim">
            Nothing here yet — add a book to get started.
          </span>
        </div>
      )}

      <ul className="mb-7 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
        {pageItems?.map((entry) => (
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

      <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />

      {showAdd && (
        <BookAddModal
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            setPage(1);
            load();
          }}
        />
      )}
    </div>
  );
}
