"use client";

import { useState } from "react";
import {
  ApiError,
  BookListEntry,
  BookStatus,
  deleteBookStatus,
  upsertBookStatus,
} from "@/lib/api";
import { useToast } from "@/lib/toast-context";

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "want_to_read", label: "Want to read" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On hold" },
  { value: "dropped", label: "Dropped" },
];

export default function BookItemCard({
  entry,
  onChanged,
  onRemoved,
}: {
  entry: BookListEntry;
  onChanged: (updated: BookListEntry) => void;
  onRemoved: () => void;
}) {
  const { showToast } = useToast();
  const isChaptered = entry.format === "manga" || entry.format === "manhwa";
  const [page, setPage] = useState(entry.current_page ?? "");
  const [chapter, setChapter] = useState(entry.current_chapter ?? "");
  const [volume, setVolume] = useState(entry.current_volume ?? "");
  const [saving, setSaving] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  async function save(status: BookStatus) {
    setSaving(true);
    setSyncNote(null);
    try {
      const updated = await upsertBookStatus(entry.book_item_id, {
        status,
        current_page: page === "" ? undefined : Number(page),
        current_chapter: chapter === "" ? undefined : Number(chapter),
        current_volume: volume === "" ? undefined : Number(volume),
      });
      onChanged(updated);
      if (updated.hardcover_sync && updated.hardcover_sync !== "skipped") {
        setSyncNote(`Hardcover: ${updated.hardcover_sync}`);
      }
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Could not save progress",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove "${entry.title}" from your list?`)) return;
    try {
      await deleteBookStatus(entry.book_item_id);
      onRemoved();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Could not remove item",
      );
    }
  }

  return (
    <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{entry.title}</p>
          <p className="text-xs text-zinc-400">
            {entry.author ? `${entry.author} · ` : ""}
            {entry.format}
          </p>
        </div>
        <button
          onClick={remove}
          className="text-xs text-zinc-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={entry.status}
          disabled={saving}
          onChange={(e) => save(e.target.value as BookStatus)}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {isChaptered ? (
          <>
            <input
              type="number"
              min={0}
              value={volume}
              onChange={(e) =>
                setVolume(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Volume"
              className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              type="number"
              min={0}
              value={chapter}
              onChange={(e) =>
                setChapter(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="Chapter"
              className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </>
        ) : (
          <input
            type="number"
            min={0}
            value={page}
            onChange={(e) =>
              setPage(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Page"
            className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        )}
        <button
          onClick={() => save(entry.status)}
          disabled={saving}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          Save progress
        </button>

        {syncNote && (
          <span className="text-xs text-zinc-400">{syncNote}</span>
        )}
      </div>
    </li>
  );
}
