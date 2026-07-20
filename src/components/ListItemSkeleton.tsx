export default function ListItemSkeleton() {
  return (
    <li className="animate-pulse rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mt-3 h-7 w-64 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />
    </li>
  );
}
