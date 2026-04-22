import { Link } from "react-router-dom";
import { useRaceStore } from "@/racing/engine";
import { CarRenderer } from "./CarRenderer";
import { Edit3, Fuel, Rocket, Zap, FlaskConical } from "lucide-react";

export const HeroPanel = () => {
  const pilot = useRaceStore((s) => s.pilots[0]);

  return (
    <div className="relative surface-1 hud-border rounded-lg overflow-hidden">
      {/* Background hero */}
      <div className="relative h-[420px] grid-rays">
        <div className="absolute inset-0 bg-gradient-to-br from-racing-red/20 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Big car centerpiece — same Identity Pack as ticker / boost / cards */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[72%] max-w-[760px] opacity-95 car-chassis-vibrate-soft">
            <CarRenderer pilot={pilot} view="hero" speed={0.95} boosting className="w-full h-auto" />
          </div>
        </div>

        {/* Asphalt streaming under car */}
        <div className="absolute inset-x-0 bottom-0 h-14 asphalt-stream opacity-40 pointer-events-none" />

        {/* Edit button */}
        <button className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 surface-2 hud-border rounded text-[10px] font-display font-bold tracking-wider hover:bg-secondary transition-colors">
          <Edit3 className="w-3 h-3" />
          EDITAR PERFIL
        </button>

        {/* Left content overlay */}
        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-racing-red font-display font-bold text-5xl md:text-6xl leading-none text-shadow-broadcast">
                #{pilot.number}
              </span>
              <Link
                to={`/racing/${pilot.slug}`}
                className="font-display font-bold text-4xl md:text-5xl tracking-tight text-shadow-broadcast hover:text-racing-red transition-colors"
              >
                {pilot.name}
              </Link>
              <span className="text-3xl">{pilot.country}</span>
            </div>
            <div className="text-racing-red font-display font-bold tracking-widest text-sm mt-1">
              {pilot.team.toUpperCase()} TEAM
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-2 hud-border rounded text-xs font-display font-bold">
                🏆 GT PRO
              </span>
              <div>
                <div className="font-display font-bold text-2xl leading-none">1º</div>
                <div className="text-[10px] tracking-wider text-racing-red font-display">RANKING GERAL</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-5 max-w-md">
              <Stat label="SLUG" value={pilot.earnings >= 500 ? "500" : "—"} accent="red" />
              <Stat label="BOOSTS" value="24" />
              <Stat label="VITÓRIAS" value="37" />
              <Stat label="GANHOS" value={`$${pilot.earnings.toLocaleString()}`} />
              <Stat label="PATROCÍNIOS" value="3 ATIVOS" accent="red" />
            </div>
          </div>
        </div>
      </div>

      {/* Right HUD column (stats meters) */}
      <div className="hidden lg:flex absolute top-6 right-6 z-20 flex-col gap-2 w-[260px]">
        <Meter icon={<Fuel className="w-3.5 h-3.5 text-racing-green" />} label="COMBUSTÍVEL" pct={72} value="36.0 / 50.0 L" color="green" />
        <Meter icon={<Zap className="w-3.5 h-3.5 text-racing-amber" />} label="ENERGIA" pct={48} value="24.0 / 50.0 kWh" color="amber" />
        <Meter icon={<FlaskConical className="w-3.5 h-3.5 text-racing-purple" />} label="NITRO" pct={65} value="3.2 / 5.0 kg" color="purple" />

        <div className="surface-2 hud-border rounded-md p-3 mt-1">
          <div className="text-[10px] text-muted-foreground tracking-widest font-display">PATROCÍNIO PRINCIPAL</div>
          <div className="font-display font-bold text-lg mt-0.5">TRUSTBANK</div>
          <div className="text-[10px] text-muted-foreground tracking-widest font-display">POWERED BY</div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {["NITROX", "FUELMAX", "SPEEDRUSH"].map((n) => (
              <span key={n} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-racing-red/15 text-racing-red">{n}</span>
            ))}
          </div>
        </div>

        <div className="surface-2 hud-border rounded-md p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-racing-red/15 flex items-center justify-center shrink-0">
            <Rocket className="w-4 h-4 text-racing-red" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground tracking-widest font-display">BOOST DISPONÍVEL</div>
            <div className="text-sm font-display font-bold">3 BOOSTS</div>
          </div>
          <button className="px-3 py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest hover:opacity-90 animate-boost-pulse">
            USAR BOOST
          </button>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: "red" }) => (
  <div>
    <div className="text-[10px] text-muted-foreground tracking-widest font-display">{label}</div>
    <div className={`font-display font-bold text-xl ${accent === "red" ? "text-racing-red" : "text-foreground"}`}>{value}</div>
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
  const bar =
    color === "green"
      ? "bg-racing-green"
      : color === "amber"
      ? "bg-racing-amber"
      : "bg-racing-purple";
  return (
    <div className="surface-2 hud-border rounded-md p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between text-[10px] tracking-widest font-display">
        <div className="flex items-center gap-1.5">{icon}<span className="text-foreground/80">{label}</span></div>
        <span className="font-mono text-sm font-bold text-foreground tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 bg-border rounded overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10px] text-muted-foreground font-mono mt-1 text-right tabular-nums">{value}</div>
    </div>
  );
};
