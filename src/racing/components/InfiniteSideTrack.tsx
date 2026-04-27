import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, dbPilotToEngine, type DbPilot } from "@/racing/db";
import { CarRenderer } from "@/racing/components/CarRenderer";

interface InfiniteSideTrackProps {
  side?: "left" | "right";
}

/**
 * Vertical "track" lane pinned to the side.
 * - Asphalt + dashed center line + guard-rails scroll DOWN (forward-motion illusion).
 * - Cars enter from the BOTTOM and exit at the TOP in one continuous ~12s run.
 * - Cars are staggered (negative animation-delay) so the lane is always populated,
 *   and they overtake each other naturally (slight per-car duration jitter).
 * - Each car shows: sponsor logo (highlighted, larger) + #number + side car + name.
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

  // Each car runs the full lane in ~12s. Stagger them so we keep ~6 visible.
  const CAR_DURATION = 12; // seconds per full bottom→top trip
  const VISIBLE_CARS = Math.min(8, pilots.length);
  const STAGGER = CAR_DURATION / VISIBLE_CARS; // seconds between cars

  return (
    <aside
      className={`hidden xl:flex fixed top-14 bottom-0 ${
        side === "left" ? "left-0 border-r" : "right-0 border-l"
      } w-28 z-20 bg-background border-border overflow-hidden flex-col pointer-events-auto`}
      aria-label="Pista de pilotos ao vivo"
    >
      {/* Header */}
      <div className="text-[9px] text-center tracking-[0.25em] font-display font-bold text-racing-red py-1.5 border-b border-border bg-background/80 flex items-center justify-center gap-1">
        <span className="live-dot" />
        GRID · LIVE
      </div>

      {/* Track lane */}
      <div className="relative flex-1 overflow-hidden">
        {/* Asphalt — repeating darker strips, scrolling DOWN */}
        <div
          className="absolute inset-0 pointer-events-none animate-track-scroll-vertical-rev"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--surface-2)) 0 32px, hsl(var(--surface-1)) 32px 64px)",
            height: "300%",
            animationDuration: "4s",
          }}
          aria-hidden
        />

        {/* Center dashed yellow line — parallax (faster) */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px pointer-events-none animate-track-scroll-vertical-rev"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--racing-amber) / 0.6) 0 14px, transparent 14px 28px)",
            height: "300%",
            animationDuration: "2s",
          }}
          aria-hidden
        />

        {/* Left guard-rail — red/white striped, scrolling DOWN */}
        <div className="absolute inset-y-0 left-0 w-2 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-x-0 animate-track-scroll-vertical-rev"
            style={{
              top: 0,
              height: "300%",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--racing-red)) 0 8px, hsl(var(--foreground)) 8px 16px)",
              animationDuration: "2.5s",
            }}
            aria-hidden
          />
        </div>

        {/* Right guard-rail */}
        <div className="absolute inset-y-0 right-0 w-2 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-x-0 animate-track-scroll-vertical-rev"
            style={{
              top: 0,
              height: "300%",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--racing-red)) 0 8px, hsl(var(--foreground)) 8px 16px)",
              animationDuration: "2.5s",
            }}
            aria-hidden
          />
        </div>

        {/* Top + bottom fades for natural enter/exit */}
        <div
          className="absolute inset-x-0 top-0 h-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, hsl(var(--background)), transparent)" }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }}
          aria-hidden
        />

        {/* Cars — each one runs the full lane independently, bottom → top, no loop-back */}
        {pilots.slice(0, VISIBLE_CARS * 2).map((p, i) => {
          const ep = dbPilotToEngine(p, i + 1);
          // Slight per-car jitter so cars overtake each other
          const dur = CAR_DURATION + (i % 3) * 1.2 - 1.2;
          // Negative delay so different cars are at different positions on first paint
          const delay = -(i * STAGGER) % CAR_DURATION;
          // Lateral offset so cars don't perfectly overlap when overtaking
          const lateral = i % 2 === 0 ? "calc(50% - 6px)" : "calc(50% + 6px)";
          return (
            <Link
              key={`${p.id}_${i}`}
              to={`/racing/${p.slug}`}
              className="group absolute z-[5] flex flex-col items-center gap-0.5 -translate-x-1/2"
              style={{
                left: lateral,
                bottom: 0,
                width: "72px",
                animation: `car-run-up-lane ${dur}s linear ${delay}s infinite`,
              }}
              title={`#${p.number} ${p.name} · ${p.sponsor}`}
            >
              {/* Sponsor logo — HIGHLIGHTED + larger so brand reads from afar */}
              <div className="text-[9px] font-display font-black tracking-wider text-background bg-racing-amber rounded-sm px-1.5 py-0.5 truncate uppercase max-w-full shadow-md ring-1 ring-foreground/20">
                {p.sponsor.slice(0, 10)}
              </div>

              {/* Car number */}
              <div className="text-[11px] font-display font-bold text-racing-red leading-none">
                #{p.number}
              </div>

              {/* Side-view car */}
              <div className="w-full h-9 flex items-center justify-center car-chassis-vibrate-soft">
                <CarRenderer pilot={ep} view="side" className="w-full h-full" />
              </div>

              {/* Pilot first name */}
              <div className="text-[8px] font-mono text-foreground bg-background/70 rounded px-1 truncate w-full text-center leading-tight mt-0.5">
                {p.name.split(" ")[0].slice(0, 9)}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / start line — checkered */}
      <div
        className="text-[8px] text-center tracking-[0.25em] font-mono text-foreground py-1 border-t border-border"
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
