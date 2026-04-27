import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRaceStore } from "@/racing/engine";
import { CarRenderer } from "./CarRenderer";
import { Edit3, Fuel, Rocket, Zap, FlaskConical, Car, Mic, Gauge } from "lucide-react";
import { CommentaryPanel } from "./CommentaryPanel";
import { PilotAdminControls } from "./PilotAdminControls";
import { CockpitView } from "./CockpitView";
import { useAuth } from "@/hooks/useAuth";
import { db, dbPilotToEngine, type DbPilot } from "@/racing/db";

type Tab = "car" | "anchor" | "cockpit";

export const HeroPanel = () => {
  const enginePilot = useRaceStore((s) => s.pilots[0]);
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("car");
  const [myPilot, setMyPilot] = useState<DbPilot | null>(null);

  useEffect(() => {
    if (!user) { setMyPilot(null); return; }
    db.getMyPilot(user.id).then(setMyPilot).catch(() => setMyPilot(null));
  }, [user]);

  // Use the logged-in pilot as the centerpiece if available; else fallback to engine leader.
  const heroPilot = myPilot ? dbPilotToEngine(myPilot, 1) : enginePilot;
  const isOwner = !!myPilot;

  return (
    <div className="relative surface-1 hud-border rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border bg-background/60">
        <TabButton active={tab === "car"} onClick={() => setTab("car")} icon={<Car className="w-3.5 h-3.5" />}>
          CARRO DESTAQUE
        </TabButton>
        <TabButton active={tab === "anchor"} onClick={() => setTab("anchor")} icon={<Mic className="w-3.5 h-3.5" />}>
          LOCUTOR AO VIVO
        </TabButton>
        {isOwner ? (
          <div className="ml-auto px-3 py-1.5 flex items-center gap-1.5 text-[9px] font-display font-bold tracking-widest text-racing-amber">
            <span className="w-1.5 h-1.5 rounded-full bg-racing-amber animate-pulse" />
            VOCÊ ESTÁ NO COMANDO
          </div>
        ) : null}
      </div>

      {tab === "anchor" ? (
        <div className="h-[420px]">
          <CommentaryPanel />
        </div>
      ) : (
        <>
          {/* Background hero */}
          <div className="relative h-[420px] grid-rays">
            <div className="absolute inset-0 bg-gradient-to-br from-racing-red/20 via-background to-background" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Big car centerpiece */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[78%] max-w-[820px] opacity-95 car-chassis-vibrate-soft">
                <CarRenderer pilot={heroPilot} view="hero" speed={0.95} boosting className="w-full h-auto" />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-14 asphalt-stream opacity-40 pointer-events-none" />

            <Link
              to={isOwner ? "/pilot/setup" : `/racing/${heroPilot.slug}`}
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 surface-2 hud-border rounded text-[10px] font-display font-bold tracking-wider hover:bg-secondary transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              {isOwner ? "EDITAR PERFIL" : "VER PILOTO"}
            </Link>

            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-racing-red font-display font-bold text-5xl md:text-6xl leading-none text-shadow-broadcast">
                    #{heroPilot.number}
                  </span>
                  <Link
                    to={`/racing/${heroPilot.slug}`}
                    className="font-display font-bold text-4xl md:text-5xl tracking-tight text-shadow-broadcast hover:text-racing-red transition-colors"
                  >
                    {heroPilot.name}
                  </Link>
                  <span className="text-3xl">{heroPilot.country}</span>
                </div>
                <div className="text-racing-red font-display font-bold tracking-widest text-sm mt-1">
                  {heroPilot.team.toUpperCase()} TEAM
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
                  <Stat label="SLUG" value={heroPilot.slug.slice(0, 6).toUpperCase()} accent="red" />
                  <Stat label="BOOSTS" value="24" />
                  <Stat label="VITÓRIAS" value="37" />
                </div>
              </div>
            </div>
          </div>

          {/* Thin meters column BELOW the hero photo */}
          <div className="border-t border-border bg-background/60 px-3 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SlimMeter icon={<Fuel className="w-3 h-3 text-racing-green" />} label="FUEL" pct={72} value="36/50L" color="green" />
              <SlimMeter icon={<Zap className="w-3 h-3 text-racing-amber" />} label="ENERGY" pct={48} value="24/50kWh" color="amber" />
              <SlimMeter icon={<FlaskConical className="w-3 h-3 text-racing-purple" />} label="NITRO" pct={65} value="3.2/5kg" color="purple" />
              <div className="surface-2 hud-border rounded px-2 py-1.5 flex items-center gap-2">
                <Rocket className="w-3 h-3 text-racing-red shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] text-muted-foreground tracking-widest font-display leading-none">BOOSTS</div>
                  <div className="text-[11px] font-display font-bold leading-tight truncate">3 · {heroPilot.sponsor.slice(0, 8).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admin cockpit — only for the pilot owner */}
      {isOwner ? (
        <div className="border-t border-border p-3 bg-background/40">
          <PilotAdminControls pilot={heroPilot} />
        </div>
      ) : null}
    </div>
  );
};

const TabButton = ({
  active, onClick, icon, children,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-display font-bold tracking-[0.2em] border-b-2 transition-colors ${
      active
        ? "border-racing-red text-racing-red bg-background/40"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon}
    {children}
  </button>
);

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: "red" }) => (
  <div>
    <div className="text-[10px] text-muted-foreground tracking-widest font-display">{label}</div>
    <div className={`font-display font-bold text-xl ${accent === "red" ? "text-racing-red" : "text-foreground"}`}>{value}</div>
  </div>
);

const Meter = ({
  icon, label, pct, value, color,
}: {
  icon: React.ReactNode; label: string; pct: number; value: string; color: "green" | "amber" | "purple";
}) => {
  const bar = color === "green" ? "bg-racing-green" : color === "amber" ? "bg-racing-amber" : "bg-racing-purple";
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

const SlimMeter = ({
  icon, label, pct, value, color,
}: {
  icon: React.ReactNode; label: string; pct: number; value: string; color: "green" | "amber" | "purple";
}) => {
  const bar = color === "green" ? "bg-racing-green" : color === "amber" ? "bg-racing-amber" : "bg-racing-purple";
  return (
    <div className="surface-2 hud-border rounded px-2 py-1.5">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          {icon}
          <span className="text-[8px] text-foreground/80 font-display tracking-widest truncate">{label}</span>
        </div>
        <span className="font-mono text-[10px] font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-1 bg-border rounded overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[8px] text-muted-foreground font-mono mt-0.5 text-right tabular-nums leading-none">{value}</div>
    </div>
  );
};
