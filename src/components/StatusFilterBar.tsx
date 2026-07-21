"use client";

export default function StatusFilterBar<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
            active === opt.value
              ? "bg-gold text-on-gold"
              : "border border-border text-ink-dim"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
