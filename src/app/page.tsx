"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const FEATURES = [
  {
    title: "Watch",
    description: "Movies and shows, with season and episode progress.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Books",
    description: "Novels, manga and manhwa, page or chapter by chapter.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
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
    title: "Always synced",
    description: "Connected accounts keep everything up to date.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="4.5" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="11.5" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.3" />
        <line
          x1="6.8"
          y1="8"
          x2="9.2"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/watch");
  }, [loading, user, router]);

  if (loading || user) return null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-5 py-6 sm:px-14">
        <span className="font-serif text-lg font-bold text-gold">
          Book &amp; Watch
        </span>
        <nav className="flex items-center gap-5">
          <Link href="/login" className="text-[13px] font-semibold text-ink-dim">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-gold px-4.5 py-2 text-[13px] font-bold text-gold"
          >
            Register
          </Link>
        </nav>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            background:
              "radial-gradient(ellipse 1000px 500px at 50% -10%, var(--gold-dim), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 py-20 text-center sm:py-24">
          <div className="mb-4 text-xs font-bold tracking-[.12em] text-gold uppercase">
            Book &amp; Watch Tracker
          </div>
          <h1 className="mb-5 font-serif text-4xl leading-tight font-extrabold text-ink sm:text-6xl">
            Every book and show, in one quiet place.
          </h1>
          <p className="mb-9 text-[17px] text-ink-dim">
            Track what you&apos;re watching and reading — synced automatically
            with Trakt and Hardcover.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href="/register"
              className="rounded-md bg-gold px-6.5 py-3.5 text-sm font-bold text-on-gold"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-border px-6.5 py-3 text-sm font-bold text-ink"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="relative grid grid-cols-1 gap-px border-y border-border bg-border sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2.5 bg-bg px-5 py-8 sm:px-14"
            >
              <span className="text-gold">{f.icon}</span>
              <span className="font-serif text-[15px] font-bold text-ink">
                {f.title}
              </span>
              <span className="text-[13px] text-ink-dim">{f.description}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
