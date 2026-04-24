import { useEffect, useRef, useState } from "react";
import { useRaceStore } from "@/racing/engine";
import { ScrollText, Rocket, Hand, Shield, Swords, Wrench, Flag, AlertTriangle, Cloud, Zap } from "lucide-react";
import type { EventKind, RaceEvent } from "@/racing/types";

const KIND_META: Record<EventKind, { icon: typeof Rocket; color: string; label: string }> = {
  overtake: { icon: Swords, color: "racing-green", label: "OVERTAKE" },
  boost: { icon: Rocket, color: "racing-red", label: "BOOST" },
  pit_stop: { icon: Wrench, color: "racing-purple", label: "PIT" },
  low_fuel: { icon: Zap, color: "racing-amber", label: "FUEL" },
  tire_wear: { icon: Hand, color: "racing-amber", label: "TIRE" },
  crash: { icon: AlertTriangle, color: "racing-red", label: "CRASH" },
  safety_car: { icon: Shield, color: "racing-amber", label: "SC" },
  restart: { icon: Flag, color: "racing-green", label: "RESTART" },
  fastest_lap: { icon: Flag, color: "racing-blue", label: "FAST LAP" },
  weather_change: { icon: Cloud, color: "racing-cyan", label: "WEATHER" },
};

function timeAgo(ts: number) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

export function DecisionLog() {
  const events = useRaceStore((s) => s.events);
  const [, setNow] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // tick every 5s so "ago" labels refresh
  useEffect(() => {
    const i = setInterval(() => setNow((n) => n + 1), 5000);
    return () => clearInterval(i);
  }, []);

  // auto-scroll to top on new event
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [events.length]);

  return (
    <div className="surface-1 hud-border rounded-md flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/60">
        <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] font-display font-bold text-racing-amber">
          <ScrollText className="w-3.5 h-3.5" />
          DECISION LOG
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
          <span className="live-dot" /> LIVE · {events.length}
        </div>
      </div>

      <div ref={listRef} className="max-h-[280px] overflow-y-auto divide-y divide-border/60">
        {events.length === 0 ? (
          <div className="px-3 py-6 text-center text-[10px] text-muted-foreground font-mono">
            Aguardando decisões da corrida...
          </div>
        ) : (
          events.map((e: RaceEvent) => {
            const meta = KIND_META[e.kind] ?? KIND_META.overtake;
            const Icon = meta.icon;
            const intensityRing =
              e.intensity === "high" ? "ring-1 ring-racing-red/40" :
              e.intensity === "med" ? "ring-1 ring-racing-amber/30" : "";
            return (
              <div
                key={e.id}
                className={`flex items-start gap-2 px-3 py-2 hover:bg-background/40 animate-fade-in ${intensityRing}`}
              >
                <div className={`w-6 h-6 rounded shrink-0 flex items-center justify-center bg-${meta.color}/15`}>
                  <Icon className={`w-3.5 h-3.5 text-${meta.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-display font-bold tracking-widest text-${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">{timeAgo(e.at)} ago</span>
                  </div>
                  <div className="text-[11px] text-foreground/90 leading-snug mt-0.5">{e.message}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
