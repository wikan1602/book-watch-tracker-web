"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function CallbackHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const token = params.get("token");
  // Lazy-initialized so the "no token" case doesn't need a synchronous
  // setState from inside the effect below.
  const [error, setError] = useState<string | null>(() =>
    token ? null : "No token in callback URL.",
  );

  useEffect(() => {
    if (!token) return;
    loginWithToken(token)
      .then(() => router.replace("/watch"))
      .catch(() => setError("Could not complete sign-in."));
    // Only run once per token — loginWithToken/router are stable enough
    // that re-running this on every render would just re-submit the token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (error) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <a href="/login" className="text-sm underline">
          Back to login
        </a>
      </div>
    );
  }

  return <p className="text-sm text-zinc-500">Signing you in...</p>;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
