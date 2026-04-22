import { useEffect, useState } from "react";
import { useRaceStore } from "@/racing/engine";
import { CAR_TINTS } from "@/racing/cars";

const KIND_ICON: Record<string, string> = {
  overtake: "↗",
  fastest_lap: "⚡",
  boost: "🚀",
  pit_stop: "🔧",
  low_fuel: "⛽",
  tire_wear: "⚠",
  crash: "✕",
  restart: "🟢",
  safety_car: "🚨",
  weather_change: "☁",
};

export const EventTicker = () => {
  const events = useRaceStore((s) => s.events);
  const pilots = useRaceStore((s) => s.pilots);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    if (events[0]) {
      setFlashId(events[0].id);
      const t = setTimeout(() => setFlashId(null), 1200);
      return () => clearTimeout(t);
    }
  }, [events]);

  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/40">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[10px] tracking-[0.2em] font-display font-bold">RACE EVENTS</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{events.length} live</span>
      </div>
      <div className="max-h-[260px] overflow-hidden">
        {events.slice(0, 7).map((e) => {
          const p = e.pilotId ? pilots.find((pp) => pp.id === e.pilotId) : null;
          return (
            <div
              key={e.id}
              className={`flex items-center gap-2 px-3 py-2 border-b border-border/40 text-xs ${
                flashId === e.id ? "animate-flash-event" : ""
              }`}
            >
              <span
                className="w-6 h-6 shrink-0 rounded-sm flex items-center justify-center text-[11px] font-bold"
                style={{
                  background: p ? `${CAR_TINTS[p.carColor]}40` : "hsl(var(--muted))",
                  color: p ? CAR_TINTS[p.carColor] : "hsl(var(--muted-foreground))",
                }}
              >
                {KIND_ICON[e.kind] ?? "•"}
              </span>
              <span className="flex-1 truncate text-foreground/90">{e.message}</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {Math.max(0, Math.floor((Date.now() - e.at) / 1000))}s
              </span>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">Aguardando primeiro evento…</div>
        )}
      </div>
    </div>
  );
};
