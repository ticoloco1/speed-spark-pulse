import { ExternalLink, Twitter } from "lucide-react";
import { parseEmbed } from "@/lib/embeds";

export const PostEmbed = ({ url }: { url: string | null | undefined }) => {
  if (!url) return null;
  const e = parseEmbed(url);
  if (e.kind === "youtube") {
    return (
      <div className="mt-2 aspect-video rounded-md overflow-hidden hud-border bg-black">
        <iframe
          src={e.embedUrl}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    );
  }
  if (e.kind === "mp4") {
    return (
      <video
        src={e.embedUrl}
        controls
        className="mt-2 w-full rounded-md hud-border bg-black aspect-video object-contain"
      />
    );
  }
  if (e.kind === "x") {
    return (
      <a
        href={e.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-2 surface-2 hud-border rounded-md p-3 hover:bg-secondary"
      >
        <Twitter className="w-4 h-4 text-foreground" />
        <span className="text-[12px] truncate flex-1">{e.url}</span>
        <ExternalLink className="w-3 h-3 text-muted-foreground" />
      </a>
    );
  }
  return null;
};
