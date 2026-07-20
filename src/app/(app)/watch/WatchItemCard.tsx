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

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "plan_to_watch", label: "Plan to watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On hold" },
  { value: "dropped", label: "Dropped" },
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
    if (!confirm(`Remove "${entry.title}" from your list?`)) return;
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
    <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {entry.title}{" "}
            {entry.year && (
              <span className="text-sm text-zinc-400">({entry.year})</span>
            )}
          </p>
          <p className="text-xs text-zinc-400">{entry.type}</p>
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
          onChange={(e) => save(e.target.value as WatchStatus)}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {entry.type === "show" && (
          <>
            <input
              type="number"
              min={0}
              value={season}
              onChange={(e) =>
                setSeason(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Season"
              className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              type="number"
              min={0}
              value={episode}
              onChange={(e) =>
                setEpisode(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="Episode"
              className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              onClick={() => save(entry.status)}
              disabled={saving}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              Save progress
            </button>
          </>
        )}

        {syncNote && (
          <span className="text-xs text-zinc-400">{syncNote}</span>
        )}
      </div>
    </li>
  );
}
