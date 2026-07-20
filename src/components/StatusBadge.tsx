export type BadgeVariant = "plan" | "active" | "done" | "hold" | "dropped";

export const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  plan: "border border-border text-ink-dim",
  active: "bg-gold-dim text-gold",
  done: "bg-gold text-on-gold",
  hold: "border border-dashed border-border bg-surface-2 text-ink-dim",
  dropped: "bg-danger-dim text-danger",
};

export default function StatusBadge({
  variant,
  label,
}: {
  variant: BadgeVariant;
  label: string;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold tracking-[.03em] uppercase ${BADGE_VARIANT_CLASSES[variant]}`}
    >
      {label}
    </span>
  );
}
