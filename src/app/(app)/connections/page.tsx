"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ApiError,
  Connection,
  connectHardcover,
  disconnectHardcover,
  disconnectTrakt,
  listConnections,
  traktLoginUrl,
} from "@/lib/api";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hardcoverToken, setHardcoverToken] = useState("");
  const [connectingHardcover, setConnectingHardcover] = useState(false);
  const [hardcoverMessage, setHardcoverMessage] = useState<string | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    listConnections()
      .then(setConnections)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(load, [load]);

  const isConnected = (provider: string) =>
    connections?.some((c) => c.provider === provider) ?? false;

  async function handleTraktConnect() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await traktLoginUrl();
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start Trakt connection",
      );
      setBusy(false);
    }
  }

  async function handleTraktDisconnect() {
    setBusy(true);
    try {
      await disconnectTrakt();
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleHardcoverConnect(e: FormEvent) {
    e.preventDefault();
    if (!hardcoverToken.trim()) return;
    setConnectingHardcover(true);
    setHardcoverMessage(null);
    try {
      const res = await connectHardcover(hardcoverToken.trim());
      setHardcoverMessage(`Connected as ${res.username}`);
      setHardcoverToken("");
      load();
    } catch (err) {
      setHardcoverMessage(
        err instanceof ApiError ? err.message : "Could not connect",
      );
    } finally {
      setConnectingHardcover(false);
    }
  }

  async function handleHardcoverDisconnect() {
    setBusy(true);
    try {
      await disconnectHardcover();
      setHardcoverMessage(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Connections</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Trakt</h2>
            <p className="text-xs text-zinc-400">
              Syncs watch status changes to your Trakt watchlist/history.
            </p>
          </div>
          {isConnected("trakt") ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
              Connected
            </span>
          ) : (
            <span className="text-xs text-zinc-400">Not connected</span>
          )}
        </div>
        {isConnected("trakt") ? (
          <button
            onClick={handleTraktDisconnect}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleTraktConnect}
            disabled={busy}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Connect Trakt
          </button>
        )}
      </section>

      <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Hardcover</h2>
            <p className="text-xs text-zinc-400">
              Syncs book status changes to your Hardcover library.
            </p>
          </div>
          {isConnected("hardcover") ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
              Connected
            </span>
          ) : (
            <span className="text-xs text-zinc-400">Not connected</span>
          )}
        </div>

        {isConnected("hardcover") ? (
          <button
            onClick={handleHardcoverDisconnect}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            Disconnect
          </button>
        ) : (
          <form onSubmit={handleHardcoverConnect} className="space-y-2">
            <p className="text-xs text-zinc-400">
              Paste your personal API token from{" "}
              <a
                href="https://hardcover.app/account/api"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                hardcover.app account settings
              </a>
              .
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={hardcoverToken}
                onChange={(e) => setHardcoverToken(e.target.value)}
                placeholder="Hardcover API token"
                className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="submit"
                disabled={connectingHardcover}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {connectingHardcover ? "..." : "Connect"}
              </button>
            </div>
          </form>
        )}
        {hardcoverMessage && (
          <p className="text-sm text-zinc-500">{hardcoverMessage}</p>
        )}
      </section>
    </div>
  );
}
