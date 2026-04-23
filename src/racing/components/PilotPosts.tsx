import { useEffect, useMemo, useState } from "react";
import type { Pilot } from "@/racing/types";
import { useRaceStore } from "@/racing/engine";
import { Heart, MessageCircle, Repeat2, Flame, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db, type DbPost } from "@/racing/db";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PilotPostsProps {
  pilot: Pilot;
  pilotDbId?: string; // when set, posts are loaded from DB
  ownerId?: string | null; // pilot owner (to show composer if it's me)
  photoUrl?: string | null;
}

export const PilotPosts = ({ pilot, pilotDbId, ownerId, photoUrl }: PilotPostsProps) => {
  const { user } = useAuth();
  const liveFeed = useRaceStore((s) => s.feed.filter((f) => f.pilotId === pilot.id));
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [composing, setComposing] = useState("");
  const [posting, setPosting] = useState(false);
  const isOwner = !!user && !!ownerId && user.id === ownerId;

  // Load posts from DB if we have the pilot id
  useEffect(() => {
    if (!pilotDbId) return;
    let cancel = false;
    db.listPostsForPilot(pilotDbId).then((p) => { if (!cancel) setPosts(p); }).catch(() => {});
    // realtime
    const channel = supabase
      .channel(`posts_${pilotDbId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pilot_posts", filter: `pilot_id=eq.${pilotDbId}` },
        (payload) => {
          setPosts((prev) => [payload.new as DbPost, ...prev]);
        }
      )
      .subscribe();
    return () => { cancel = true; supabase.removeChannel(channel); };
  }, [pilotDbId]);

  const submitPost = async () => {
    if (!user || !pilotDbId || !composing.trim()) return;
    setPosting(true);
    try {
      await db.createPost({
        pilot_id: pilotDbId,
        author_id: user.id,
        text: composing.trim(),
        image_url: null,
        kind: "organic",
        sponsor: null,
        cta: null,
      });
      setComposing("");
      toast({ title: "Post publicado" });
    } catch (e: any) {
      toast({ title: "Erro ao postar", description: String(e?.message ?? e), variant: "destructive" });
    } finally { setPosting(false); }
  };

  const initials = pilot.name.slice(0, 2).toUpperCase();

  // Combined feed: live engine events for this pilot + DB posts
  const items = useMemo(() => {
    const live = liveFeed.slice(0, 3).map((f) => ({
      id: f.id,
      kind: f.kind === "paid" ? ("sponsored" as const) : ("live" as const),
      text: f.text,
      ageMin: 0,
      likes: f.likes,
      comments: f.comments,
      reposts: Math.floor(f.likes / 12),
    }));
    const db = posts.map((p) => ({
      id: p.id,
      kind: p.kind === "paid" ? ("sponsored" as const) : ("organic" as const),
      text: p.text,
      ageMin: Math.max(0, Math.floor((Date.now() - new Date(p.created_at).getTime()) / 60000)),
      likes: p.likes,
      comments: p.comments,
      reposts: Math.floor(p.likes / 12),
    }));
    return [...live, ...db];
  }, [posts, liveFeed]);

  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/40">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.2em] font-display font-bold">FEED — {pilot.name}</span>
          <span className="live-dot" />
        </div>
      </div>

      {isOwner && (
        <div className="p-3 border-b border-border bg-racing-red/5">
          <div className="flex gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-racing-red shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full surface-3 border border-border flex items-center justify-center shrink-0">
                <span className="text-xs font-display font-bold">{initials}</span>
              </div>
            )}
            <div className="flex-1">
              <Textarea
                value={composing}
                onChange={(e) => setComposing(e.target.value)}
                placeholder="O que está rolando na pista?"
                rows={2}
                className="resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={submitPost} disabled={posting || !composing.trim()} className="bg-racing-red hover:bg-racing-red/90">
                  {posting ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Send className="w-3 h-3 mr-1.5" />}
                  POSTAR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-border/50 max-h-[640px] overflow-y-auto scrollbar-hide">
        {items.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">Nenhum post ainda. Aguardando ação na pista…</div>
        )}
        {items.map((p) => (
          <article
            key={p.id}
            className={`p-3 ${p.kind === "live" ? "bg-racing-red/5 border-l-2 border-racing-red animate-fade-in" : ""}`}
          >
            {p.kind === "sponsored" && (
              <div className="text-[9px] tracking-[0.2em] font-display font-bold text-racing-red mb-1.5">POST PATROCINADO</div>
            )}
            {p.kind === "live" && (
              <div className="text-[9px] tracking-[0.2em] font-display font-bold text-racing-red mb-1.5 flex items-center gap-1">
                <Flame className="w-3 h-3" /> AO VIVO
              </div>
            )}
            <div className="flex gap-3">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full surface-3 border border-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-display font-bold">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-display font-bold truncate">{pilot.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">#{pilot.number}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.ageMin === 0 ? "agora" : p.ageMin < 60 ? `${p.ageMin} min` : `${Math.floor(p.ageMin / 60)} h`}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-0.5 leading-snug whitespace-pre-wrap">{p.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Heart className="w-3.5 h-3.5" />
                    {p.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {p.comments}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Repeat2 className="w-3.5 h-3.5" />
                    {p.reposts}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
