import type { Pilot } from "@/racing/types";
import { useRaceStore } from "@/racing/engine";
import { RaceCar } from "./RaceCar";
import { Fuel, Zap, FlaskConical, Rocket, Trophy, TrendingUp } from "lucide-react";

interface PilotHeroProps {
  pilot: Pilot;
}

// Deterministic pseudo-random based on pilot id (so stats stay stable per pilot)
function seeded(seed: string, salt: number) {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

export const PilotHero = ({ pilot }: PilotHeroProps) => {
  const totalPilots = useRaceStore((s) => s.pilots.length);
  const fuel = 35 + Math.floor(seeded(pilot.id, 11) * 60);
  const energy = 25 + Math.floor(seeded(pilot.id, 23) * 70);
  const nitro = 20 + Math.floor(seeded(pilot.id, 41) * 75);
  const wins = Math.floor(seeded(pilot.id, 7) * 80) + 4;
  const boosts = Math.floor(seeded(pilot.id, 13) * 50) + 2;
  const sponsorsCount = Math.floor(seeded(pilot.id, 17) * 5) + 1;

  return (
    <div className="relative surface-1 hud-border rounded-lg overflow-hidden">
      <div className="relative min-h-[360px] grid-rays">
        {/* Background gradient using pilot car color theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-racing-red/15 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Big car centerpiece */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[78%] max-w-[760px] opacity-95 car-chassis-vibrate-soft">
            <RaceCar pilot={pilot} view="hero" speed={0.85} boosting className="w-full h-auto" />
          </div>
        </div>

        {/* Asphalt streaming under the car */}
        <div className="absolute inset-x-0 bottom-0 h-12 asphalt-stream opacity-40 pointer-events-none" />

        {/* Top-left identity */}
        <div className="relative z-10 p-5 md:p-6 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-racing-red font-display font-bold text-5xl md:text-6xl leading-none text-shadow-broadcast">
                #{pilot.number}
              </span>
              <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight text-shadow-broadcast">
                {pilot.name}
              </h1>
              <span className="text-3xl">{pilot.country}</span>
            </div>
            <div className="text-racing-red font-display font-bold tracking-widest text-xs md:text-sm mt-1">
              {pilot.team.toUpperCase()}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-2 hud-border rounded text-[10px] font-display font-bold tracking-wider">
                <Trophy className="w-3 h-3 text-racing-amber" /> GT PRO · LVL {pilot.level}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-2 hud-border rounded text-[10px] font-display font-bold tracking-wider">
                <TrendingUp className="w-3 h-3 text-racing-green" /> {pilot.position}º / {totalPilots}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-2 hud-border rounded text-[10px] font-mono">
                BEST {pilot.bestLap}
              </span>
            </div>
          </div>

          {/* Bottom stat strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl relative z-10">
            <Stat label="GANHOS" value={`$${pilot.earnings.toLocaleString()}`} accent="green" />
            <Stat label="VITÓRIAS" value={String(wins)} />
            <Stat label="BOOSTS" value={String(boosts)} accent="red" />
            <Stat label="PATROCÍNIOS" value={`${sponsorsCount} ATIVOS`} />
          </div>
        </div>

        {/* Right HUD telemetry */}
        <div className="hidden lg:flex absolute top-5 right-5 z-20 flex-col gap-2 w-[260px]">
          <Meter icon={<Fuel className="w-3.5 h-3.5 text-racing-green" />} label="COMBUSTÍVEL" pct={fuel} value={`${(fuel * 0.5).toFixed(1)} / 50.0 L`} color="green" />
          <Meter icon={<Zap className="w-3.5 h-3.5 text-racing-amber" />} label="ENERGIA" pct={energy} value={`${(energy * 0.5).toFixed(1)} / 50.0 kWh`} color="amber" />
          <Meter icon={<FlaskConical className="w-3.5 h-3.5 text-racing-purple" />} label="NITRO" pct={nitro} value={`${(nitro * 0.05).toFixed(1)} / 5.0 kg`} color="purple" />

          <div className="surface-2 hud-border rounded-md p-3 flex items-center gap-3 mt-1">
            <div className="w-9 h-9 rounded bg-racing-red/15 flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4 text-racing-red" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-muted-foreground tracking-widest font-display">PATROCÍNIO</div>
              <div className="text-sm font-display font-bold truncate">{pilot.sponsor}</div>
            </div>
            <button className="px-3 py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest hover:opacity-90 animate-boost-pulse">
              BOOST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: "red" | "green" }) => (
  <div className="surface-2/80 backdrop-blur-sm hud-border rounded-md p-2.5">
    <div className="text-[9px] text-muted-foreground tracking-widest font-display">{label}</div>
    <div
      className={`font-display font-bold text-lg leading-tight ${
        accent === "red" ? "text-racing-red" : accent === "green" ? "text-racing-green" : "text-foreground"
      }`}
    >
      {value}
    </div>
  </div>
);

const Meter = ({
  icon,
  label,
  pct,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  pct: number;
  value: string;
  color: "green" | "amber" | "purple";
}) => {
  const bar = color === "green" ? "bg-racing-green" : color === "amber" ? "bg-racing-amber" : "bg-racing-purple";
  return (
    <div className="surface-2 hud-border rounded-md p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between text-[10px] tracking-widest font-display">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-foreground/80">{label}</span>
        </div>
        <span className="font-mono text-sm font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 bg-border rounded overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10px] text-muted-foreground font-mono mt-1 text-right tabular-nums">{value}</div>
    </div>
  );
};
