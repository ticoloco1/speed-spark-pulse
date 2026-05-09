import { useEffect, useState } from "react";
import { Link as LinkIcon, Send, Youtube } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db, type DbPilot } from "@/racing/db";
import { parseEmbed } from "@/lib/embeds";
import { toast } from "@/hooks/use-toast";

export const FeedComposer = ({ onPosted }: { onPosted?: () => void }) => {
  const { user } = useAuth();
  const [pilot, setPilot] = useState<DbPilot | null>(null);
  const [text, setText] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [showEmbed, setShowEmbed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return setPilot(null);
    db.getMyPilot(user.id).then(setPilot).catch(() => setPilot(null));
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 text-center surface-2 hud-border rounded-md">
        <p className="text-[12px] text-muted-foreground">
          Entre para postar no feed da Hashpo.
        </p>
        <Link
          to="/auth"
          className="inline-block mt-2 px-3 py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest"
        >
          ENTRAR
        </Link>
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="p-4 text-center surface-2 hud-border rounded-md">
        <p className="text-[12px] text-muted-foreground">
          Crie seu piloto para postar no feed.
        </p>
        <Link
          to="/pilot/setup"
          className="inline-block mt-2 px-3 py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest"
        >
          CRIAR PILOTO
        </Link>
      </div>
    );
  }

  const submit = async () => {
    if (!text.trim() && !embedUrl.trim()) return;
    setBusy(true);
    const parsed = embedUrl ? parseEmbed(embedUrl) : null;
    try {
      await db.createPost({
        pilot_id: pilot.id,
        author_id: user.id,
        text: text.trim() || (parsed?.kind === "youtube" ? "📺" : "🏁"),
        image_url: null,
        kind: "organic",
        sponsor: null,
        cta: null,
        video_url: parsed && parsed.kind !== "none" ? parsed.url : null,
        embed_kind: parsed?.kind ?? "none",
      } as any);
      setText("");
      setEmbedUrl("");
      setShowEmbed(false);
      toast({ title: "Postado!", description: "Sua corrida está no feed." });
      onPosted?.();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message ?? "Não foi possível postar." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-3 border-b border-border">
      <div className="flex gap-2">
        <div className="w-9 h-9 shrink-0 rounded-full surface-2 hud-border overflow-hidden flex items-center justify-center font-display font-bold">
          {pilot.photo_url ? (
            <img src={pilot.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            pilot.name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Como foi a volta, #${pilot.number}?`}
            rows={2}
            className="w-full bg-background border border-border rounded-md p-2 text-sm resize-none focus:outline-none focus:border-racing-red"
            maxLength={500}
          />
          {showEmbed && (
            <input
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="Cole link do YouTube, X ou .mp4"
              className="w-full mt-2 bg-background border border-border rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-racing-red"
            />
          )}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setShowEmbed((v) => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-display font-bold tracking-widest px-2 py-1 rounded ${
                showEmbed ? "bg-racing-red text-primary-foreground" : "surface-2 hud-border hover:bg-secondary"
              }`}
            >
              <Youtube className="w-3 h-3" /> EMBED
            </button>
            <button
              onClick={submit}
              disabled={busy || (!text.trim() && !embedUrl.trim())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              <Send className="w-3 h-3" /> POSTAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Local Link import to avoid global router type issues
import { Link } from "react-router-dom";
