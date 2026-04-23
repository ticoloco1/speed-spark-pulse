import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, dbPilotToEngine, type DbPilot } from "@/racing/db";
import { CarRenderer } from "@/racing/components/CarRenderer";

interface InfiniteSideTrackProps {
  side?: "left" | "right";
}

// A vertical, fixed, infinitely scrolling lane of cars that link to pilot pages.
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

  // Duplicate the list so the marquee loops seamlessly
  const loop = [...pilots, ...pilots, ...pilots];

  return (
    <aside
      className={`hidden xl:flex fixed top-14 bottom-0 ${side === "left" ? "left-0" : "right-0"} w-20 z-20 surface-1 border-${side === "left" ? "r" : "l"} border-border overflow-hidden flex-col pointer-events-auto`}
      aria-label="Pista de pilotos ao vivo"
    >
      <div className="text-[9px] text-center tracking-[0.2em] font-display font-bold text-racing-red py-2 border-b border-border bg-background/40">
        GRID
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-x-0 flex flex-col gap-3 py-3 animate-track-scroll-vertical"
          style={{ animationDuration: `${Math.max(40, pilots.length * 4)}s` }}
        >
          {loop.map((p, i) => {
            const ep = dbPilotToEngine(p, i + 1);
            return (
              <Link
                key={`${p.id}_${i}`}
                to={`/racing/${p.slug}`}
                className="group flex flex-col items-center gap-1 px-1 hover:scale-105 transition-transform"
                title={`#${p.number} ${p.name}`}
              >
                <div className="w-16 h-10 surface-2 rounded overflow-hidden border border-border group-hover:border-racing-red flex items-center justify-center p-0.5">
                  <CarRenderer pilot={ep} view="top" className="w-full h-full" />
                </div>
                <div className="text-[9px] font-display font-bold text-racing-red leading-none">#{p.number}</div>
                <div className="text-[9px] font-mono text-muted-foreground truncate w-full text-center leading-none">
                  {p.name.split(" ")[0].slice(0, 8)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
