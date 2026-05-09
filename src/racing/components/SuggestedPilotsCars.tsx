import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag } from "lucide-react";
import { db, dbPilotToEngine, type DbPilot } from "@/racing/db";
import { CarRenderer } from "./CarRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const SuggestedPilotsCars = ({ exceptSlug }: { exceptSlug?: string }) => {
  const { user } = useAuth();
  const [pilots, setPilots] = useState<DbPilot[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    db.listPilots()
      .then((all) => setPilots(all.filter((p) => p.slug !== exceptSlug).slice(0, 6)))
      .catch(() => setPilots([]));
  }, [exceptSlug]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("follows")
      .select("pilot_id")
      .eq("follower_id", user.id)
      .then(({ data }) => setFollowingIds(new Set((data ?? []).map((r: any) => r.pilot_id))));
  }, [user]);

  const toggle = async (pilotId: string) => {
    if (!user) {
      toast({ title: "Faça login", description: "Entre para seguir pilotos." });
      return;
    }
    const isFollowing = followingIds.has(pilotId);
    const next = new Set(followingIds);
    if (isFollowing) next.delete(pilotId);
    else next.add(pilotId);
    setFollowingIds(next);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("pilot_id", pilotId);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, pilot_id: pilotId });
      }
    } catch {
      setFollowingIds(followingIds); // revert
    }
  };

  if (pilots.length === 0) {
    return (
      <div className="surface-1 hud-border rounded-md p-3 text-[11px] text-muted-foreground">
        Carregando pilotos...
      </div>
    );
  }

  return (
    <div className="surface-1 hud-border rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-[0.2em] font-display font-bold">QUEM SEGUIR</span>
        <Flag className="w-3 h-3 text-racing-red" />
      </div>
      <div className="space-y-2">
        {pilots.map((p) => {
          const ep = dbPilotToEngine(p);
          const fol = followingIds.has(p.id);
          return (
            <div key={p.id} className="surface-2 hud-border rounded p-2">
              <div className="flex items-center gap-2">
                <Link to={`/racing/profile/${p.slug}`} className="text-[10px] font-display font-black bg-background/90 rounded px-1.5">
                  #{p.number}
                </Link>
                <Link to={`/racing/profile/${p.slug}`} className="min-w-0 flex-1">
                  <div className="text-[11px] font-display font-bold truncate">{p.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate">@{p.slug} · {p.team}</div>
                </Link>
                <button
                  onClick={() => toggle(p.id)}
                  className={`text-[9px] font-display font-bold tracking-widest px-2 py-1 rounded ${
                    fol ? "surface-2 hud-border" : "bg-racing-red text-primary-foreground"
                  } hover:opacity-90`}
                >
                  {fol ? "SEGUINDO" : "SEGUIR"}
                </button>
              </div>
              <Link to={`/racing/profile/${p.slug}`} className="block w-full h-10 mt-1.5">
                <CarRenderer pilot={ep} view="side" speed={0.4} className="w-full h-full" />
              </Link>
              <div className="text-center text-[9px] font-display font-black tracking-wider text-background bg-racing-amber rounded-sm py-0.5 mt-1 uppercase">
                {p.sponsor.slice(0, 14)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
