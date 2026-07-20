"use client";

import { useState } from "react";
import {
  ApiError,
  WatchListEntry,
  WatchStatus,
  deleteWatchStatus,
  upsertWatchStatus,
} from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import CoverPlaceholder from "@/components/CoverPlaceholder";
import { BadgeVariant, BADGE_VARIANT_CLASSES } from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_OPTIONS: {
  value: WatchStatus;
  label: string;
  variant: BadgeVariant;
}[] = [
  { value: "plan_to_watch", label: "Plan to watch", variant: "plan" },
  { value: "watching", label: "Watching", variant: "active" },
  { value: "completed", label: "Completed", variant: "done" },
  { value: "on_hold", label: "On hold", variant: "hold" },
  { value: "dropped", label: "Dropped", variant: "dropped" },
];

export default function WatchItemCard({
  entry,
  onChanged,
  onRemoved,
}: {
  entry: WatchListEntry;
  onChanged: (updated: WatchListEntry) => void;
  onRemoved: () => void;
}) {
  const { showToast } = useToast();
  const [season, setSeason] = useState(entry.current_season ?? "");
  const [episode, setEpisode] = useState(entry.current_episode ?? "");
  const [saving, setSaving] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const current = STATUS_OPTIONS.find((o) => o.value === entry.status)!;

  async function save(status: WatchStatus) {
    setSaving(true);
    setSyncNote(null);
    try {
      const updated = await upsertWatchStatus(entry.watch_item_id, {
        status,
        current_season: season === "" ? undefined : Number(season),
        current_episode: episode === "" ? undefined : Number(episode),
      });
      onChanged(updated);
      if (updated.trakt_sync && updated.trakt_sync !== "skipped") {
        setSyncNote(`Trakt: ${updated.trakt_sync}`);
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
      await deleteWatchStatus(entry.watch_item_id);
      onRemoved();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Could not remove item",
      );
    }
  }

  return (
    <li className="shadow-app flex flex-col overflow-hidden rounded-[10px] border border-border bg-surface">
      <CoverPlaceholder title={entry.title} />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex justify-between gap-2">
          <span className="font-serif text-[15px] font-bold text-ink">
            {entry.title}
          </span>
          {entry.year && (
            <span className="text-xs text-ink-dim">{entry.year}</span>
          )}
        </div>
        <span className="text-[11px] font-semibold tracking-[.04em] text-ink-dim uppercase">
          {entry.type}
        </span>

        <select
          value={entry.status}
          disabled={saving}
          onChange={(e) => save(e.target.value as WatchStatus)}
          className={`w-fit rounded px-2.5 py-1 text-[11px] font-bold tracking-[.03em] uppercase ${BADGE_VARIANT_CLASSES[current.variant]}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {entry.type === "show" && (
          <>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-ink-dim">
                  Season
                </label>
                <input
                  type="number"
                  min={0}
                  value={season}
                  onChange={(e) =>
                    setSeason(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-14 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-[13px] text-ink"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-ink-dim">
                  Episode
                </label>
                <input
                  type="number"
                  min={0}
                  value={episode}
                  onChange={(e) =>
                    setEpisode(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-14 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-[13px] text-ink"
                />
              </div>
            </div>
            <button
              onClick={() => save(entry.status)}
              disabled={saving}
              className="rounded-md border border-gold px-3 py-2 text-xs font-bold text-gold disabled:opacity-50"
            >
              Save progress
            </button>
          </>
        )}

        {syncNote && (
          <div className="flex items-center gap-1.5 text-[11px] text-ink-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {syncNote}
          </div>
        )}

        {entry.type !== "show" && <div className="flex-1" />}
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
