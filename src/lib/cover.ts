export function tmdbPosterUrl(
  posterPath: string | null | undefined,
  size: "w185" | "w500" = "w185",
): string | null {
  return posterPath ? `https://image.tmdb.org/t/p/${size}${posterPath}` : null;
}

export function openLibraryCoverUrl(
  isbn: string | null | undefined,
  size: "S" | "M" | "L" = "M",
): string | null {
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg` : null;
}
