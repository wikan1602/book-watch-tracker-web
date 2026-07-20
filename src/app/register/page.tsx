"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, googleLoginUrl } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setPending(true);
    try {
      await register(email, password);
      router.push("/watch");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
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
          Create your account
        </h1>
        <p className="mb-6 text-[13px] text-ink-dim">
          Start your library in a minute.
        </p>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink"
            />
            <p className="text-xs text-ink-dim">At least 8 characters.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirm-password"
              className="text-[11px] font-semibold text-ink-dim"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-1.5 rounded-md bg-gold px-3 py-3 text-sm font-bold text-on-gold disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Create account"}
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
          Sign up with Google
        </a>

        <p className="mt-6 text-center text-[13px] text-ink-dim">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
