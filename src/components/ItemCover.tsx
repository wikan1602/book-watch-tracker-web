"use client";

import { useState } from "react";
import CoverPlaceholder from "./CoverPlaceholder";

// Plain <img> rather than next/image: covers can come from TMDB, Open
// Library, or Hardcover, and Hardcover's actual image host has never been
// observed (no connected account exercised yet — see
// docs/cover-images-integration.md), so it can't be allow-listed in
// next.config.ts's images.remotePatterns ahead of time.
export default function ItemCover({
  title,
  src,
  variant = "card",
}: {
  title: string;
  src: string | null;
  variant?: "card" | "thumb";
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    if (variant === "thumb") {
      return (
        <div className="h-13 w-9 flex-shrink-0 rounded bg-linear-to-br from-gold-dim to-surface-2" />
      );
    }
    return <CoverPlaceholder title={title} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      onError={() => setErrored(true)}
      className={
        variant === "thumb"
          ? "h-13 w-9 flex-shrink-0 rounded object-cover"
          : "aspect-[2/3] w-full object-cover"
      }
    />
  );
}
