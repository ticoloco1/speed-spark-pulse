/** Parse a video / social URL and return an embed descriptor. */
export type EmbedKind = "youtube" | "x" | "mp4" | "none";
export interface ParsedEmbed {
  kind: EmbedKind;
  url: string;
  embedUrl: string;
}

const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i;
const X_RE = /(?:twitter\.com|x\.com)\/([\w_]+)\/status\/(\d+)/i;

export function parseEmbed(url: string): ParsedEmbed {
  const trimmed = url.trim();
  if (!trimmed) return { kind: "none", url: "", embedUrl: "" };

  const yt = trimmed.match(YT_RE);
  if (yt) {
    return {
      kind: "youtube",
      url: trimmed,
      embedUrl: `https://www.youtube.com/embed/${yt[1]}?rel=0`,
    };
  }
  const x = trimmed.match(X_RE);
  if (x) {
    // X uses oEmbed via platform.twitter.com — we render a styled link card instead.
    return { kind: "x", url: trimmed, embedUrl: trimmed };
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(trimmed)) {
    return { kind: "mp4", url: trimmed, embedUrl: trimmed };
  }
  return { kind: "none", url: trimmed, embedUrl: "" };
}
