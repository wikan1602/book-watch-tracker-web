"use client";

export default function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700"
      >
        Previous
      </button>
      <span className="text-sm text-zinc-500">
        Page {page} of {pageCount}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700"
      >
        Next
      </button>
    </div>
  );
}
