import { useEffect, useMemo, useState } from "react";
import type { Pilot } from "@/racing/types";
import { useRaceStore } from "@/racing/engine";
import { Heart, MessageCircle, Repeat2, Flame } from "lucide-react";

interface PilotPostsProps {
  pilot: Pilot;
}

const PILOT_POST_TEMPLATES = [
  "Quali session done — P{pos} on the grid. Tomorrow we attack. 🏁",
  "Best lap of the day: {lap}. Felt the car click in sector 2.",
  "Brake balance dialed in. Ready for race trim.",
  "Massive thanks to {sponsor} for the support this weekend 🙌",
  "Safety car came at the worst time… still salvaged points.",
  "New livery dropping next round. You're going to love it.",
  "Pit crew did 2.0s today. Best in the paddock.",
  "Race intensity {intensity}/10 — flat out from lap 1.",
  "Engineer says fuel map 7. I say push. Compromise: map 5.",
  "From P{from} to P{pos}. Happy with the recovery drive.",
];

const REACTION_TEMPLATES = [
  { who: "RACING FAN", text: "MONSTER drive today!" },
  { who: "TEAM RADIO", text: "Box, box, box. Confirm." },
  { who: "FAN NATION", text: "GOAT behavior 🐐" },
  { who: "BROADCAST", text: "Did you see that overtake?!" },
];

function seededInt(seed: string, salt: number, max: number) {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % max;
}

export const PilotPosts = ({ pilot }: PilotPostsProps) => {
  const liveFeed = useRaceStore((s) => s.feed.filter((f) => f.pilotId === pilot.id));
  const [tab, setTab] = useState<"posts" | "reactions">("posts");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Seeded recent posts unique per pilot, augmented with any live feed for them
  const posts = useMemo(() => {
    const seeded = PILOT_POST_TEMPLATES.slice(0, 6).map((tpl, i) => ({
      id: `${pilot.id}_seed_${i}`,
      text: tpl
        .replace("{pos}", String(pilot.position))
        .replace("{lap}", pilot.bestLap)
        .replace("{sponsor}", pilot.sponsor)
        .replace("{intensity}", String(7 + (seededInt(pilot.id, i + 1, 4))))
        .replace("{from}", String(pilot.position + 3 + seededInt(pilot.id, i + 99, 6))),
      ageMin: 8 + seededInt(pilot.id, i * 7 + 3, 240),
      likes: 120 + seededInt(pilot.id, i * 11 + 5, 4800),
      comments: 8 + seededInt(pilot.id, i * 13 + 7, 320),
      reposts: 4 + seededInt(pilot.id, i * 17 + 9, 180),
      kind: "organic" as const,
    }));

    const live = liveFeed.slice(0, 3).map((f) => ({
      id: f.id,
      text: f.text,
      ageMin: 0,
      likes: f.likes,
      comments: f.comments,
      reposts: Math.floor(f.likes / 12),
      kind: f.kind === "paid" ? ("sponsored" as const) : ("live" as const),
    }));

    return [...live, ...seeded];
  }, [pilot, liveFeed, now]);

  const reactions = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => {
        const r = REACTION_TEMPLATES[i % REACTION_TEMPLATES.length];
        return {
          id: `${pilot.id}_r_${i}`,
          who: r.who,
          text: r.text,
          ageMin: 1 + seededInt(pilot.id, i * 19 + 2, 90),
          likes: 20 + seededInt(pilot.id, i * 23 + 6, 800),
        };
      }),
    [pilot]
  );

  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/40">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.2em] font-display font-bold">ATIVIDADE — {pilot.name}</span>
          <span className="live-dot" />
        </div>
        <div className="flex gap-1">
          {(["posts", "reactions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded text-[10px] tracking-widest font-display font-bold transition-colors ${
                tab === t ? "bg-racing-red text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "posts" ? "POSTS" : "REAÇÕES"}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/50 max-h-[640px] overflow-y-auto scrollbar-hide">
        {tab === "posts" &&
          posts.map((p) => (
            <article
              key={p.id}
              className={`p-3 ${p.kind === "live" ? "bg-racing-red/5 border-l-2 border-racing-red animate-fade-in" : ""}`}
            >
              {p.kind === "sponsored" && (
                <div className="text-[9px] tracking-[0.2em] font-display font-bold text-racing-red mb-1.5">
                  POST PATROCINADO
                </div>
              )}
              {p.kind === "live" && (
                <div className="text-[9px] tracking-[0.2em] font-display font-bold text-racing-red mb-1.5 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> AO VIVO
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full surface-3 border border-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-display font-bold">{pilot.name.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display font-bold truncate">{pilot.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">#{pilot.number}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {p.ageMin === 0 ? "agora" : p.ageMin < 60 ? `${p.ageMin} min` : `${Math.floor(p.ageMin / 60)} h`}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5 leading-snug">{p.text}</p>
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

        {tab === "reactions" &&
          reactions.map((r) => (
            <div key={r.id} className="p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full surface-3 border border-border flex items-center justify-center shrink-0">
                <Heart className="w-3.5 h-3.5 text-racing-red" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-display font-bold truncate">{r.who}</span>
                  <span className="text-[10px] text-muted-foreground">{r.ageMin} min</span>
                </div>
                <p className="text-sm text-foreground/85 mt-0.5">
                  reagiu ao post de <span className="text-racing-red">{pilot.name}</span>: "{r.text}"
                </p>
                <div className="text-[10px] text-muted-foreground mt-1">{r.likes} curtidas</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
