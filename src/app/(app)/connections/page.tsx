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
import StatusBadge from "@/components/StatusBadge";

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
    <div>
      <h1 className="mb-6 font-serif text-[28px] font-bold text-ink">
        Connections
      </h1>
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <section className="shadow-app flex flex-col gap-3.5 rounded-[10px] border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-ink">
              Trakt
            </span>
            {isConnected("trakt") ? (
              <StatusBadge variant="active" label="● Connected" />
            ) : (
              <StatusBadge variant="plan" label="Not connected" />
            )}
          </div>
          <p className="text-[13px] text-ink-dim">
            Syncs watch status changes to your Trakt watchlist/history.
          </p>
          {isConnected("trakt") ? (
            <button
              onClick={handleTraktDisconnect}
              disabled={busy}
              className="self-start rounded-md border border-danger px-4 py-2 text-[13px] font-bold text-danger disabled:opacity-50"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleTraktConnect}
              disabled={busy}
              className="self-start rounded-md bg-gold px-4 py-2 text-[13px] font-bold text-on-gold disabled:opacity-50"
            >
              Connect Trakt
            </button>
          )}
        </section>

        <section className="shadow-app flex flex-col gap-3.5 rounded-[10px] border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-ink">
              Hardcover
            </span>
            {isConnected("hardcover") ? (
              <StatusBadge variant="active" label="● Connected" />
            ) : (
              <StatusBadge variant="plan" label="Not connected" />
            )}
          </div>
          <p className="text-[13px] text-ink-dim">
            Syncs book status changes to your Hardcover library.
          </p>

          {isConnected("hardcover") ? (
            <button
              onClick={handleHardcoverDisconnect}
              disabled={busy}
              className="self-start rounded-md border border-danger px-4 py-2 text-[13px] font-bold text-danger disabled:opacity-50"
            >
              Disconnect
            </button>
          ) : (
            <form onSubmit={handleHardcoverConnect} className="flex flex-col gap-2.5">
              <p className="text-xs text-ink-dim">
                Paste your personal API token from{" "}
                <a
                  href="https://hardcover.app/account/api"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-gold"
                >
                  hardcover.app account settings
                </a>
                .
              </p>
              <input
                type="password"
                value={hardcoverToken}
                onChange={(e) => setHardcoverToken(e.target.value)}
                placeholder="Paste API token…"
                className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-[13px] text-ink"
              />
              <button
                type="submit"
                disabled={connectingHardcover}
                className="self-start rounded-md bg-gold px-4 py-2 text-[13px] font-bold text-on-gold disabled:opacity-50"
              >
                {connectingHardcover ? "..." : "Connect"}
              </button>
            </form>
          )}
          {hardcoverMessage && (
            <p className="text-sm text-ink-dim">{hardcoverMessage}</p>
          )}
        </section>
      </div>
    </div>
  );
}
