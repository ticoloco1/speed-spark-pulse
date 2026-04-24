import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, dbPilotToEngine, type DbPilot } from "@/racing/db";
import { CarRenderer } from "@/racing/components/CarRenderer";

interface InfiniteSideTrackProps {
  side?: "left" | "right";
}

/**
 * Vertical "track" lane — fixed to the side, full viewport height.
 * Cars enter from the bottom and exit at the top, continuously.
 * Each row shows: side-view car · #number · sponsor logo · pilot name.
 * Clicking a row opens that pilot's public page.
 */
export const InfiniteSideTrack = ({ side = "left" }: InfiniteSideTrackProps) => {
  const [pilots, setPilots] = useState<DbPilot[]>([]);

  useEffect(() => {
    db.listPilots().then(setPilots).catch(() => setPilots([]));
    const interval = setInterval(() => {
      db.listPilots().then(setPilots).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (pilots.length === 0) return null;

  // Triple the list so the marquee (translateY 0 → -66.67%) loops seamlessly.
  const loop = [...pilots, ...pilots, ...pilots];

  // Slower speed = longer "track" feeling. ~6s per car.
  const durationSec = Math.max(60, pilots.length * 6);

  return (
    <aside
      className={`hidden xl:flex fixed top-14 bottom-0 ${
        side === "left" ? "left-0 border-r" : "right-0 border-l"
      } w-24 z-20 surface-1 border-border overflow-hidden flex-col pointer-events-auto`}
      aria-label="Pista de pilotos ao vivo"
    >
      {/* Header */}
      <div className="text-[9px] text-center tracking-[0.25em] font-display font-bold text-racing-red py-2 border-b border-border bg-background/60 flex items-center justify-center gap-1.5">
        <span className="live-dot" />
        GRID
      </div>

      {/* Track lane */}
      <div className="relative flex-1 overflow-hidden">
        {/* Asphalt + lane markers background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--surface-2)) 0 32px, hsl(var(--surface-1)) 32px 64px)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--racing-amber) / 0.35) 0 10px, transparent 10px 22px)",
          }}
          aria-hidden
        />

        {/* Top + bottom fade so cars appear/disappear naturally */}
        <div
          className="absolute inset-x-0 top-0 h-10 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, hsl(var(--surface-1)), transparent)" }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-10 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, hsl(var(--surface-1)), transparent)" }}
          aria-hidden
        />

        {/* Scrolling column — translateY: 0 → -66.67% (animation defined in tailwind config). */}
        <div
          className="absolute inset-x-0 flex flex-col gap-3 py-4 animate-track-scroll-vertical"
          style={{ animationDuration: `${durationSec}s` }}
        >
          {loop.map((p, i) => {
            const ep = dbPilotToEngine(p, i + 1);
            return (
              <Link
                key={`${p.id}_${i}`}
                to={`/racing/${p.slug}`}
                className="group relative mx-1 surface-2 rounded border border-border hover:border-racing-red transition-colors flex flex-col items-center gap-1 py-1.5 px-1"
                title={`#${p.number} ${p.name} · ${p.sponsor}`}
              >
                {/* Car number badge */}
                <div className="text-[10px] font-display font-bold text-racing-red leading-none">
                  #{p.number}
                </div>

                {/* Side-view car */}
                <div className="w-full h-9 flex items-center justify-center">
                  <CarRenderer pilot={ep} view="side" className="w-full h-full" />
                </div>

                {/* Sponsor "logo" — text badge styled like a livery sticker */}
                <div className="w-full px-1">
                  <div className="text-[7px] font-display font-bold tracking-[0.12em] text-center text-foreground bg-background/70 border border-border rounded-sm py-0.5 truncate uppercase">
                    {p.sponsor}
                  </div>
                </div>

                {/* Pilot first name */}
                <div className="text-[8px] font-mono text-muted-foreground truncate w-full text-center leading-none">
                  {p.name.split(" ")[0].slice(0, 9)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / start line */}
      <div className="text-[8px] text-center tracking-[0.2em] font-mono text-muted-foreground py-1.5 border-t border-border bg-background/60">
        START ↑
      </div>
    </aside>
  );
};
