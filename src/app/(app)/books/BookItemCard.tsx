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
import { openLibraryCoverUrl } from "@/lib/cover";
import ItemCover from "@/components/ItemCover";
import { BadgeVariant, BADGE_VARIANT_CLASSES } from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_OPTIONS: {
  value: BookStatus;
  label: string;
  variant: BadgeVariant;
}[] = [
  { value: "want_to_read", label: "Want to read", variant: "plan" },
  { value: "reading", label: "Reading", variant: "active" },
  { value: "completed", label: "Completed", variant: "done" },
  { value: "on_hold", label: "On hold", variant: "hold" },
  { value: "dropped", label: "Dropped", variant: "dropped" },
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
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const current = STATUS_OPTIONS.find((o) => o.value === entry.status)!;

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
    setConfirmingRemove(false);
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
    <li className="shadow-app flex flex-col overflow-hidden rounded-[10px] border border-border bg-surface">
      <ItemCover
        title={entry.title}
        src={entry.cover_url ?? openLibraryCoverUrl(entry.isbn)}
      />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <span className="font-serif text-[15px] font-bold text-ink">
          {entry.title}
        </span>
        <span className="text-[11px] font-semibold tracking-[.04em] text-ink-dim uppercase">
          {entry.author ? `${entry.author} · ` : ""}
          {entry.format}
        </span>

        <select
          value={entry.status}
          disabled={saving}
          onChange={(e) => save(e.target.value as BookStatus)}
          className={`w-fit rounded px-2.5 py-1 text-[11px] font-bold tracking-[.03em] uppercase ${BADGE_VARIANT_CLASSES[current.variant]}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {isChaptered ? (
          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-ink-dim">
                Volume
              </label>
              <input
                type="number"
                min={0}
                value={volume}
                onChange={(e) =>
                  setVolume(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-14 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-[13px] text-ink"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-ink-dim">
                Chapter
              </label>
              <input
                type="number"
                min={0}
                value={chapter}
                onChange={(e) =>
                  setChapter(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-14 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-[13px] text-ink"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-ink-dim">
              Page
            </label>
            <input
              type="number"
              min={0}
              value={page}
              onChange={(e) =>
                setPage(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-17.5 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-[13px] text-ink"
            />
          </div>
        )}
        <button
          onClick={() => save(entry.status)}
          disabled={saving}
          className="rounded-md border border-gold px-3 py-2 text-xs font-bold text-gold disabled:opacity-50"
        >
          Save progress
        </button>

        {syncNote && (
          <div className="flex items-center gap-1.5 text-[11px] text-ink-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {syncNote}
          </div>
        )}

        <button
          onClick={() => setConfirmingRemove(true)}
          className="text-left text-xs font-semibold text-ink-dim hover:text-danger"
        >
          Remove
        </button>
      </div>

      {confirmingRemove && (
        <ConfirmDialog
          title="Remove item?"
          message={`Remove "${entry.title}" from your list?`}
          onCancel={() => setConfirmingRemove(false)}
          onConfirm={remove}
        />
      )}
    </li>
  );
}
