import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { PostEmbed } from "./PostEmbed";
import type { DbPilot } from "@/racing/db";

export interface FeedPost {
  id: string;
  text: string;
  image_url: string | null;
  video_url: string | null;
  kind: string;
  sponsor: string | null;
  created_at: string;
  comments: number;
  reposts: number;
  pilot: Pick<DbPilot, "id" | "slug" | "name" | "number" | "country" | "sponsor" | "photo_url">;
  likes_count: number;
  liked_by_me: boolean;
}

function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export const PostCard = ({ post, onChange }: { post: FeedPost; onChange?: (p: FeedPost) => void }) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const toggleLike = async () => {
    if (!user) {
      toast({ title: "Faça login", description: "Entre para curtir posts." });
      return;
    }
    if (busy) return;
    setBusy(true);
    const wasLiked = post.liked_by_me;
    // optimistic
    onChange?.({
      ...post,
      liked_by_me: !wasLiked,
      likes_count: post.likes_count + (wasLiked ? -1 : 1),
    });
    try {
      if (wasLiked) {
        await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      } else {
        await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
      }
    } catch (e) {
      // revert
      onChange?.(post);
      toast({ title: "Erro", description: "Não foi possível atualizar curtida." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="p-3 hover:bg-secondary/20 transition-colors">
      <div className="flex items-start gap-2">
        <Link
          to={`/racing/profile/${post.pilot.slug}`}
          className="w-10 h-10 rounded-full surface-2 hud-border overflow-hidden shrink-0 flex items-center justify-center font-display font-bold"
        >
          {post.pilot.photo_url ? (
            <img src={post.pilot.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            post.pilot.name.charAt(0)
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              to={`/racing/profile/${post.pilot.slug}`}
              className="text-[13px] font-display font-bold hover:underline truncate"
            >
              {post.pilot.name}
            </Link>
            <BadgeCheck className="w-3.5 h-3.5 text-racing-amber" />
            <span className="text-[10px] text-muted-foreground">
              @{post.pilot.slug} · #{post.pilot.number} · {timeAgo(post.created_at)}
            </span>
            {post.kind === "paid" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-racing-amber text-background tracking-widest">
                PATROCINADO {post.sponsor ? `· ${post.sponsor}` : ""}
              </span>
            )}
          </div>

          <p className="text-[13px] text-foreground/90 mt-1 whitespace-pre-wrap break-words">{post.text}</p>

          {post.image_url && (
            <img src={post.image_url} alt="" className="mt-2 rounded-md hud-border max-h-[480px] w-full object-cover" />
          )}
          <PostEmbed url={post.video_url} />

          <div className="flex items-center gap-6 mt-2 text-[11px] text-muted-foreground">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 hover:text-racing-red transition-colors ${
                post.liked_by_me ? "text-racing-red" : ""
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${post.liked_by_me ? "fill-current" : ""}`} />
              {post.likes_count}
            </button>
            <button className="flex items-center gap-1 hover:text-racing-green">
              <Repeat2 className="w-3.5 h-3.5" /> {post.reposts}
            </button>
            <button className="flex items-center gap-1 hover:text-racing-blue">
              <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
            </button>
            <button className="flex items-center gap-1 hover:text-foreground ml-auto">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
