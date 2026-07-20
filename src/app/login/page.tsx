"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, googleLoginUrl } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.push("/watch");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16">
      <span className="mb-10 font-serif text-lg font-bold text-gold">
        Book &amp; Watch
      </span>
      <div className="shadow-app w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        <h1 className="mb-1.5 font-serif text-2xl font-bold text-ink">
          Welcome back
        </h1>
        <p className="mb-6 text-[13px] text-ink-dim">Sign in to your library.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold text-ink-dim">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[11px] font-semibold text-ink-dim"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-1.5 rounded-md bg-gold px-3 py-3 text-sm font-bold text-on-gold disabled:opacity-50"
          >
            {pending ? "Logging in..." : "Sign in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2.5">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-ink-dim">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <a
          href={googleLoginUrl()}
          className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-center text-sm font-semibold text-ink"
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-current text-[11px] font-bold">
            G
          </span>
          Sign in with Google
        </a>

        <p className="mt-6 text-center text-[13px] text-ink-dim">
          No account?{" "}
          <Link href="/register" className="font-semibold text-gold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
