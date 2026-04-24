import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, dbPilotToEngine, type DbPilot } from "@/racing/db";
import { CarRenderer } from "@/racing/components/CarRenderer";

interface InfiniteSideTrackProps {
  side?: "left" | "right";
}

/**
 * Vertical "track" lane — a real-feeling racing strip pinned to the side.
 * - Guard-rails on both edges scroll downward (illusion of forward motion).
 * - Asphalt + dashed center line scroll downward at a slightly different speed.
 * - Cars enter from the bottom, run UP the lane, and exit at the top — no loop back.
 * - Each row: side-view car · #number · sponsor logo · pilot name.
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

  // Slower = more "long track" feeling.
  const carDuration = Math.max(70, pilots.length * 7);

  return (
    <aside
      className={`hidden xl:flex fixed top-14 bottom-0 ${
        side === "left" ? "left-0 border-r" : "right-0 border-l"
      } w-16 z-20 bg-background border-border overflow-hidden flex-col pointer-events-auto`}
      aria-label="Pista de pilotos ao vivo"
    >
      {/* Header */}
      <div className="text-[8px] text-center tracking-[0.2em] font-display font-bold text-racing-red py-1.5 border-b border-border bg-background/80 flex items-center justify-center gap-1">
        <span className="live-dot" />
        GRID
      </div>

      {/* Track lane */}
      <div className="relative flex-1 overflow-hidden">
        {/* Asphalt — repeating darker strips, scrolling DOWN to imply forward motion */}
        <div
          className="absolute inset-0 pointer-events-none animate-track-scroll-vertical-rev"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--surface-2)) 0 28px, hsl(var(--surface-1)) 28px 56px)",
            height: "300%",
            animationDuration: "5s",
          }}
          aria-hidden
        />

        {/* Center dashed yellow line — scrolling DOWN faster (parallax) */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px pointer-events-none animate-track-scroll-vertical-rev"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--racing-amber) / 0.55) 0 12px, transparent 12px 24px)",
            height: "300%",
            animationDuration: "2.5s",
          }}
          aria-hidden
        />

        {/* Left guard-rail */}
        <div className="absolute inset-y-0 left-0 w-1.5 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-x-0 animate-track-scroll-vertical-rev"
            style={{
              top: 0,
              height: "300%",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--racing-red)) 0 6px, hsl(var(--foreground)) 6px 12px)",
              animationDuration: "3s",
            }}
            aria-hidden
          />
        </div>

        {/* Right guard-rail */}
        <div className="absolute inset-y-0 right-0 w-1.5 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-x-0 animate-track-scroll-vertical-rev"
            style={{
              top: 0,
              height: "300%",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--racing-red)) 0 6px, hsl(var(--foreground)) 6px 12px)",
              animationDuration: "3s",
            }}
            aria-hidden
          />
        </div>

        {/* Top + bottom fades so cars appear/disappear naturally */}
        <div
          className="absolute inset-x-0 top-0 h-12 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, hsl(var(--background)), transparent)" }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-12 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }}
          aria-hidden
        />

        {/* Cars column — scrolls UP (cars travel up the track and exit) */}
        <div
          className="absolute inset-x-0 flex flex-col gap-4 py-6 animate-track-scroll-vertical px-2"
          style={{ animationDuration: `${carDuration}s` }}
        >
          {loop.map((p, i) => {
            const ep = dbPilotToEngine(p, i + 1);
            return (
              <Link
                key={`${p.id}_${i}`}
                to={`/racing/${p.slug}`}
                className="group relative flex flex-col items-center gap-0.5"
                title={`#${p.number} ${p.name} · ${p.sponsor}`}
              >
                {/* Sponsor logo — small livery sticker above */}
                <div className="text-[6px] font-display font-bold tracking-[0.1em] text-foreground bg-background/85 border border-border rounded-sm px-1 py-0.5 truncate uppercase max-w-full">
                  {p.sponsor.slice(0, 8)}
                </div>

                {/* Car number */}
                <div className="text-[9px] font-display font-bold text-racing-red leading-none">
                  #{p.number}
                </div>

                {/* Side-view car — tilted upward to suggest motion up the lane */}
                <div className="w-full h-7 flex items-center justify-center car-chassis-vibrate-soft">
                  <CarRenderer pilot={ep} view="side" className="w-full h-full" />
                </div>

                {/* Pilot first name */}
                <div className="text-[7px] font-mono text-muted-foreground truncate w-full text-center leading-none mt-0.5">
                  {p.name.split(" ")[0].slice(0, 8)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / start line — checkered */}
      <div
        className="text-[7px] text-center tracking-[0.2em] font-mono text-foreground py-1 border-t border-border"
        style={{
          backgroundImage:
            "repeating-conic-gradient(hsl(var(--foreground)) 0% 25%, hsl(var(--background)) 0% 50%)",
          backgroundSize: "8px 8px",
        }}
      >
        <span className="bg-background/80 px-1 rounded">START ↑</span>
      </div>
    </aside>
  );
};
