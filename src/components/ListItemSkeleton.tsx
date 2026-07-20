export default function ListItemSkeleton() {
  return (
    <li className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="animate-shimmer aspect-[2/3]" />
      <div className="flex flex-col gap-2 p-4">
        <div className="animate-shimmer h-3.5 w-[70%] rounded" />
        <div className="animate-shimmer h-2.5 w-[40%] rounded" />
      </div>
    </li>
  );
}
