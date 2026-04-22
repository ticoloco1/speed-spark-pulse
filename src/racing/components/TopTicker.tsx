import { useEffect, useState } from "react";
import { useRaceStore } from "@/racing/engine";
import { RaceCar } from "./RaceCar";

/**
 * Top ticker — shows the elite cars (top ~12) racing left across the top
 * of the page, with position numbers and lap times overlayed.
 */
export const TopTicker = () => {
  const pilots = useRaceStore((s) => s.pilots).slice(0, 12);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const p = pilots[Math.floor(Math.random() * pilots.length)];
      setHighlight(p.id);
      setTimeout(() => setHighlight(null), 1200);
    }, 4500);
    return () => clearInterval(id);
  }, [pilots]);

  // Duplicate list for seamless loop
  const list = [...pilots, ...pilots];

  return (
    <div className="ticker-track relative overflow-hidden h-[120px] w-full">
      {/* Track lines underneath */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-racing-red/40 to-transparent" />
        <div className="absolute top-[68%] left-0 right-0 h-px bg-white/5" />
        <div className="absolute top-[78%] left-0 right-0 h-px bg-white/5" />
      </div>

      {/* Speed lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[40%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute top-[55%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center mask-fade-x">
        <div className="flex gap-3 animate-ticker-left whitespace-nowrap will-change-transform">
          {list.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-md surface-1 hud-border min-w-[180px] ${
                highlight === p.id ? "ring-1 ring-racing-red glow-red" : ""
              }`}
            >
              <div className="font-display font-bold text-2xl tabular-nums text-foreground/90 leading-none w-7 text-center">
                {p.position}
              </div>
              <div className="w-[72px] h-[44px] -my-1 shrink-0">
                <RaceCar color={p.carColor} number={p.number} className="w-full h-full" />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="text-[11px] font-display font-semibold tracking-wide truncate max-w-[90px]">
                  {p.name}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  #{p.number}
                </div>
                <div className="text-[10px] text-racing-amber font-mono tabular-nums">
                  {p.bestLap}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

      {/* TOP 10 PILOTS label */}
      <div className="absolute top-1.5 left-3 z-20 flex items-center gap-2">
        <span className="live-dot" />
        <span className="text-[10px] tracking-[0.2em] font-display font-semibold text-muted-foreground">
          TOP 10 PILOTS · LIVE
        </span>
      </div>
    </div>
  );
};
