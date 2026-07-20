export default function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex aspect-[2/3] items-center justify-center bg-linear-to-br from-gold-dim to-surface-2">
      <span className="font-serif text-5xl font-bold text-gold opacity-85">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
