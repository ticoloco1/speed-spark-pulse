import { useRaceStore } from "@/racing/engine";
import { RaceCar } from "./RaceCar";

/**
 * Live grid showing positions 1–8 in a horizontal row, like a TV broadcast lower-third.
 */
export const LiveGrid = () => {
  const pilots = useRaceStore((s) => s.pilots).slice(0, 8);

  return (
    <div className="surface-1 hud-border rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] font-display font-bold">CORRIDA AO VIVO</span>
          <span className="live-dot" />
          <span className="text-[10px] text-racing-red font-display font-bold tracking-wider">AO VIVO</span>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {pilots.map((p) => (
          <div key={p.id} className="flex flex-col items-center text-center">
            <div className="text-[10px] font-display font-bold text-muted-foreground">
              {p.position}º <span className="text-foreground">{p.name}</span>
            </div>
            <div className="w-full aspect-[2/1] -my-1 car-chassis-vibrate-soft">
              <RaceCar pilot={p} view="side" speed={0.6} className="w-full h-full" />
            </div>
            <div className="text-[9px] font-mono text-muted-foreground">#{p.number}</div>
          </div>
        ))}
      </div>
      {/* Race progress bar */}
      <div className="mt-3 relative h-1 bg-border rounded overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-racing-red via-racing-amber to-racing-green animate-pulse" style={{ width: "62%" }} />
        <div className="absolute inset-0 checker-strip opacity-30" />
      </div>
    </div>
  );
};
