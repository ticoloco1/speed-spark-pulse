import { useRaceStore } from "@/racing/engine";
import { RaceCar } from "./RaceCar";

/**
 * Bottom ticker — positions 11-100 scrolling continuously.
 */
export const BottomTicker = () => {
  const pilots = useRaceStore((s) => s.pilots).slice(10, 100);
  const list = [...pilots, ...pilots];

  return (
    <div className="ticker-track relative overflow-hidden h-[110px] w-full border-t border-border">
      {/* Race surface lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-2 left-0 right-0 checker-strip h-[10px] opacity-40" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
      </div>

      <div className="absolute top-1.5 left-3 z-20 flex items-center gap-2">
        <span className="text-[10px] tracking-[0.2em] font-display font-semibold text-muted-foreground">
          POS 11–100 · LIVE GRID
        </span>
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center mask-fade-x pt-3">
        <div className="flex gap-2 animate-ticker-right whitespace-nowrap will-change-transform">
          {list.map((p, idx) => (
            <div
              key={`${p.id}-bot-${idx}`}
              className="relative flex items-center gap-2 px-2 py-1.5 rounded surface-1 hud-border min-w-[150px]"
            >
              <div className="font-display font-bold text-lg tabular-nums text-muted-foreground leading-none w-6 text-center">
                {p.position}
              </div>
              <div className="w-[64px] h-[36px] shrink-0 car-chassis-vibrate-soft">
                <RaceCar pilot={p} view="side" speed={0.7} className="w-full h-full" />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="text-[10px] font-display font-semibold tracking-wide truncate max-w-[64px]">
                  {p.name}
                </div>
                <div className="text-[9px] text-muted-foreground font-mono">
                  #{p.number}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
};
