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
    <div className="flex items-center justify-center gap-4 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-border px-4 py-2 text-[13px] font-semibold text-ink-dim disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-[13px] text-ink-dim">
        Page {page} of {pageCount}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="rounded-md border border-gold px-4 py-2 text-[13px] font-semibold text-gold disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
