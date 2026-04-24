import { useState } from "react";
import { Rocket, Hand, Shield, Swords, Wrench, Loader2 } from "lucide-react";
import { useRaceStore } from "@/racing/engine";
import { toast } from "@/hooks/use-toast";
import type { Pilot } from "@/racing/types";

interface PilotAdminControlsProps {
  pilot: Pilot;
}

type Action = "boost" | "brake" | "defend" | "overtake" | "pit";

const ACTIONS: Array<{
  id: Action;
  label: string;
  hint: string;
  icon: typeof Rocket;
  color: string;
  cooldown: number;
  intensity: "low" | "med" | "high";
  message: (name: string) => string;
}> = [
  { id: "boost", label: "BOOST", hint: "Nitro burst", icon: Rocket, color: "racing-red", cooldown: 12, intensity: "high",
    message: (n) => `${n} ativou NITRO BOOST 🚀` },
  { id: "brake", label: "BRAKE", hint: "Late braking", icon: Hand, color: "racing-amber", cooldown: 6, intensity: "med",
    message: (n) => `${n} freia tarde no fim de reta!` },
  { id: "defend", label: "DEFEND DRS", hint: "Block line", icon: Shield, color: "racing-blue", cooldown: 10, intensity: "med",
    message: (n) => `${n} defende posição com DRS fechado.` },
  { id: "overtake", label: "OVERTAKE", hint: "Attack mode", icon: Swords, color: "racing-green", cooldown: 14, intensity: "high",
    message: (n) => `${n} parte para o ataque na próxima curva!` },
  { id: "pit", label: "PIT NEXT LAP", hint: "Box, box", icon: Wrench, color: "racing-purple", cooldown: 30, intensity: "low",
    message: (n) => `${n} confirma PIT na próxima volta.` },
];

export function PilotAdminControls({ pilot }: PilotAdminControlsProps) {
  const pushEvent = useRaceStore((s) => s.pushEvent);
  const [cooldowns, setCooldowns] = useState<Record<Action, number>>({
    boost: 0, brake: 0, defend: 0, overtake: 0, pit: 0,
  });
  const [pending, setPending] = useState<Action | null>(null);

  const trigger = (a: typeof ACTIONS[number]) => {
    if (cooldowns[a.id] > 0 || pending) return;
    setPending(a.id);
    pushEvent({
      id: `admin_${Date.now()}`,
      kind: a.id === "boost" ? "boost" : a.id === "pit" ? "pit_stop" : "overtake",
      pilotId: pilot.id,
      message: a.message(pilot.name),
      at: Date.now(),
      intensity: a.intensity,
    });
    toast({ title: a.label, description: a.message(pilot.name) });

    setCooldowns((prev) => ({ ...prev, [a.id]: a.cooldown }));
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, a.cooldown - elapsed);
      setCooldowns((prev) => ({ ...prev, [a.id]: left }));
      if (left <= 0) clearInterval(tick);
    }, 250);
    setTimeout(() => setPending(null), 400);
  };

  return (
    <div className="surface-1 hud-border rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] tracking-[0.2em] font-display font-bold text-racing-red flex items-center gap-1.5">
          <span className="live-dot" />
          ADMIN · COCKPIT
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">#{pilot.number} {pilot.name}</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const cd = cooldowns[a.id];
          const disabled = cd > 0 || pending === a.id;
          return (
            <button
              key={a.id}
              onClick={() => trigger(a)}
              disabled={disabled}
              className={`relative surface-2 hud-border rounded p-2 text-left transition-all hover:border-${a.color} disabled:opacity-50 disabled:hover:border-border`}
              title={a.hint}
            >
              <div className="flex items-center gap-1.5">
                {pending === a.id ? (
                  <Loader2 className={`w-3.5 h-3.5 text-${a.color} animate-spin`} />
                ) : (
                  <Icon className={`w-3.5 h-3.5 text-${a.color}`} />
                )}
                <span className="text-[10px] font-display font-bold tracking-widest">{a.label}</span>
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {cd > 0 ? `READY IN ${cd}s` : a.hint}
              </div>
              {cd > 0 ? (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-border overflow-hidden rounded-b">
                  <div className={`h-full bg-${a.color} transition-all`} style={{ width: `${100 - (cd / a.cooldown) * 100}%` }} />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
