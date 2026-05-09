import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RacingHeader } from "@/racing/components/RacingHeader";
import { InfiniteSideTrack } from "@/racing/components/InfiniteSideTrack";
import { TopTicker } from "@/racing/components/TopTicker";
import { BottomTicker } from "@/racing/components/BottomTicker";
import { FeedComposer } from "@/racing/components/FeedComposer";
import { PostCard, type FeedPost } from "@/racing/components/PostCard";
import { SuggestedPilotsCars } from "@/racing/components/SuggestedPilotsCars";
import { Loader2 } from "lucide-react";

type Tab = "global" | "following";

export default function Feed() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("global");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("pilot_posts")
      .select(
        "id, text, image_url, video_url, kind, sponsor, created_at, comments, reposts, pilot:pilots!inner(id, slug, name, number, country, sponsor, photo_url)"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (tab === "following" && user) {
      const { data: follows } = await supabase
        .from("follows")
        .select("pilot_id")
        .eq("follower_id", user.id);
      const ids = (follows ?? []).map((r: any) => r.pilot_id);
      if (ids.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      query = query.in("pilot_id", ids);
    }

    const { data, error } = await query;
    if (error || !data) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const postIds = data.map((p: any) => p.id);
    // Fetch like counts and my likes in parallel
    const [{ data: likeRows }, myLikesRes] = await Promise.all([
      supabase.from("post_likes").select("post_id").in("post_id", postIds),
      user
        ? supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);
    const counts = new Map<string, number>();
    (likeRows ?? []).forEach((r: any) => counts.set(r.post_id, (counts.get(r.post_id) ?? 0) + 1));
    const mySet = new Set((myLikesRes.data ?? []).map((r: any) => r.post_id));

    setPosts(
      (data as any[]).map((p) => ({
        id: p.id,
        text: p.text,
        image_url: p.image_url,
        video_url: p.video_url,
        kind: p.kind,
        sponsor: p.sponsor,
        created_at: p.created_at,
        comments: p.comments,
        reposts: p.reposts ?? 0,
        pilot: p.pilot,
        likes_count: counts.get(p.id) ?? 0,
        liked_by_me: mySet.has(p.id),
      }))
    );
    setLoading(false);
  }, [tab, user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <RacingHeader />
      <InfiniteSideTrack side="left" />
      <TopTicker />

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 xl:pl-32">
        {/* LEFT */}
        <aside className="hidden lg:block col-span-3 space-y-3">
          <SuggestedPilotsCars />
          <div className="surface-1 hud-border rounded-md p-3 text-[11px]">
            <div className="text-[10px] tracking-[0.2em] font-display font-bold mb-2">NAVEGAR</div>
            <div className="grid grid-cols-1 gap-1.5">
              <Link to="/racing" className="surface-2 hud-border rounded px-2 py-1.5 hover:bg-secondary">🏁 Broadcast ao vivo</Link>
              <Link to="/racing/profile/marie" className="surface-2 hud-border rounded px-2 py-1.5 hover:bg-secondary">👤 Perfis</Link>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <section className="col-span-12 lg:col-span-6 space-y-3">
          <div className="surface-1 hud-border rounded-md">
            <div className="flex border-b border-border">
              <TabBtn active={tab === "global"} onClick={() => setTab("global")}>GLOBAL</TabBtn>
              <TabBtn active={tab === "following"} onClick={() => setTab("following")}>SEGUINDO</TabBtn>
            </div>
            <FeedComposer onPosted={load} />
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 flex justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center text-[12px] text-muted-foreground">
                  {tab === "following"
                    ? "Você ainda não segue ninguém. Use a coluna ao lado para seguir pilotos."
                    : "Sem posts ainda. Seja o primeiro!"}
                </div>
              ) : (
                posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onChange={(np) => setPosts((arr) => arr.map((x) => (x.id === np.id ? np : x)))}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="hidden lg:block col-span-3 space-y-3">
          <div className="surface-1 hud-border rounded-md p-3">
            <div className="text-[10px] tracking-[0.2em] font-display font-bold text-racing-red mb-1">
              TENDÊNCIAS · GRID
            </div>
            <ul className="space-y-1.5 text-[12px]">
              {["#PoleInterlagos", "#Pneu13Voltas", "#NitroSunday", "#PitStop2.1s", "#SponsorWar"].map((t) => (
                <li key={t} className="surface-2 hud-border rounded px-2 py-1.5 hover:bg-secondary cursor-pointer">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-1 hud-border rounded-md p-3">
            <div className="text-[10px] tracking-[0.2em] font-display font-bold mb-2">SLUGS À VENDA</div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Garanta seu subdomínio: <span className="font-mono">slug.hashpo.com</span>
            </p>
            <button className="w-full py-1.5 rounded bg-racing-amber text-background text-[10px] font-display font-bold tracking-widest hover:opacity-90">
              VER LEILÃO
            </button>
          </div>
        </aside>
      </main>

      <BottomTicker />
    </div>
  );
}

const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 text-[10px] font-display font-bold tracking-[0.2em] border-b-2 transition-colors ${
      active ? "border-racing-red text-racing-red" : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);
