"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  {
    href: "/watch",
    label: "Watch",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/books",
    label: "Books",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 3.5C2 3 2.4 2.6 3 2.6H7.2V12.4H3C2.4 12.4 2 12 2 11.5V3.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M14 3.5C14 3 13.6 2.6 13 2.6H8.8V12.4H13C13.6 12.4 14 12 14 11.5V3.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    href: "/connections",
    label: "Connections",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="4.5" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="11.5" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.3" />
        <line x1="6.8" y1="8" x2="9.2" y2="8" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-ink-dim">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-17 items-center justify-between gap-4 border-y border-border bg-surface px-5 sm:px-14">
        <span className="font-serif text-lg font-bold text-gold">
          Book &amp; Watch
        </span>
        <nav className="flex gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-bold ${
                  active ? "bg-gold-dim text-gold" : "text-ink-dim"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3.5 text-[13px] text-ink-dim">
          <span>{user.email}</span>
          <span className="h-5 w-px bg-border" />
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="rounded-md border border-border px-3.5 py-2 font-semibold"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 py-9 sm:px-14">
        {children}
      </main>
    </div>
  );
}
