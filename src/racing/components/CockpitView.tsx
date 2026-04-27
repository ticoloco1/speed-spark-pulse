import { useEffect, useState } from "react";
import type { Pilot } from "@/racing/types";
import { Gauge, Fuel, Zap, FlaskConical } from "lucide-react";

interface Props {
  pilot: Pilot;
}

/**
 * Cockpit POV — vista do piloto.
 * - Pista em perspectiva correndo embaixo (linhas convergindo + asfalto rolando).
 * - Volante na parte inferior central, gira suavemente conforme o piloto "vira".
 * - HUD lateral com velocidade/marcha/RPM para sensação de pilotagem.
 */
export const CockpitView = ({ pilot }: Props) => {
  const [steer, setSteer] = useState(0); // -25 a +25 graus
  const [speed, setSpeed] = useState(218);
  const [gear, setGear] = useState(5);
  const [rpm, setRpm] = useState(8200);

  // Volante balança suavemente como se estivesse pilotando
  useEffect(() => {
    let alive = true;
    function tick() {
      if (!alive) return;
      setSteer(Math.sin(Date.now() / 700) * 18 + (Math.random() - 0.5) * 6);
      setSpeed((s) => Math.max(140, Math.min(312, s + (Math.random() - 0.5) * 14)));
      setRpm((r) => Math.max(5500, Math.min(11500, r + (Math.random() - 0.5) * 600)));
      setGear((g) => {
        const next = g + (Math.random() < 0.15 ? (Math.random() < 0.5 ? -1 : 1) : 0);
        return Math.max(2, Math.min(7, next));
      });
    }
    const id = setInterval(tick, 280);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-racing-blue/30 via-background to-black">
      {/* Céu / horizonte */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-racing-blue/20 via-racing-purple/15 to-transparent" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-foreground/30" />

      {/* Pista em perspectiva — trapézio que recua até o horizonte */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full h-1/2 overflow-hidden"
        style={{ perspective: "420px", perspectiveOrigin: "50% 0%" }}
      >
        <div
          className="absolute inset-0 origin-top"
          style={{ transform: `rotateX(58deg) rotateZ(${steer * -0.4}deg)` }}
        >
          {/* Asfalto */}
          <div className="absolute inset-0 bg-gradient-to-b bg-[hsl(0_0%_8%)]" />

          {/* Linhas tracejadas centrais correndo em direção ao piloto */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2"
            style={{
              backgroundImage: "repeating-linear-gradient(180deg, hsl(45 100% 60%) 0 32px, transparent 32px 80px)",
              animation: "asphalt-scroll 0.4s linear infinite",
              backgroundSize: "100% 112px",
            }}
          />

          {/* Linhas laterais brancas */}
          <div
            className="absolute top-0 bottom-0 w-2"
            style={{
              left: "8%",
              backgroundImage: "repeating-linear-gradient(180deg, hsl(0 0% 100% / 0.8) 0 60px, transparent 60px 120px)",
              animation: "asphalt-scroll 0.4s linear infinite",
              backgroundSize: "100% 180px",
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-2"
            style={{
              right: "8%",
              backgroundImage: "repeating-linear-gradient(180deg, hsl(0 0% 100% / 0.8) 0 60px, transparent 60px 120px)",
              animation: "asphalt-scroll 0.4s linear infinite",
              backgroundSize: "100% 180px",
            }}
          />

          {/* Guard rails vermelho/branco nas bordas */}
          <div
            className="absolute top-0 bottom-0 left-0 w-3"
            style={{
              backgroundImage: "repeating-linear-gradient(180deg, hsl(var(--racing-red)) 0 24px, hsl(0 0% 100%) 24px 48px)",
              animation: "asphalt-scroll 0.35s linear infinite",
              backgroundSize: "100% 96px",
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-3"
            style={{
              backgroundImage: "repeating-linear-gradient(180deg, hsl(0 0% 100%) 0 24px, hsl(var(--racing-red)) 24px 48px)",
              animation: "asphalt-scroll 0.35s linear infinite",
              backgroundSize: "100% 96px",
            }}
          />
        </div>
      </div>

      {/* Borrão de velocidade nas bordas */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/70 to-transparent" />
      </div>

      {/* HUD esquerdo: velocidade + marcha */}
      <div className="absolute top-3 left-3 z-10 surface-elev/80 backdrop-blur rounded px-3 py-2 hud-border">
        <div className="text-[8px] font-display tracking-widest text-muted-foreground">VELOCIDADE</div>
        <div className="font-mono font-bold text-3xl tabular-nums text-racing-amber leading-none">
          {Math.round(speed)}
          <span className="text-[10px] text-muted-foreground ml-1">KM/H</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="text-center">
            <div className="text-[8px] text-muted-foreground tracking-widest">MARCHA</div>
            <div className="font-mono font-bold text-xl text-racing-red tabular-nums leading-none">{gear}</div>
          </div>
          <div>
            <div className="text-[8px] text-muted-foreground tracking-widest">RPM</div>
            <div className="font-mono font-bold text-sm text-foreground tabular-nums leading-none">
              {rpm.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* HUD direito: piloto + recursos */}
      <div className="absolute top-3 right-3 z-10 surface-elev/80 backdrop-blur rounded px-3 py-2 hud-border min-w-[140px]">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-racing-red text-lg leading-none">#{pilot.number}</span>
          <span className="font-display font-bold text-foreground text-xs truncate">{pilot.name}</span>
        </div>
        <div className="text-[9px] text-muted-foreground tracking-widest font-display mt-0.5 truncate">
          {pilot.team.toUpperCase()}
        </div>
        <div className="space-y-1 mt-2">
          <CockpitMeter icon={<Fuel className="w-2.5 h-2.5 text-racing-green" />} pct={72} color="bg-racing-green" />
          <CockpitMeter icon={<Zap className="w-2.5 h-2.5 text-racing-amber" />} pct={48} color="bg-racing-amber" />
          <CockpitMeter icon={<FlaskConical className="w-2.5 h-2.5 text-racing-purple" />} pct={65} color="bg-racing-purple" />
        </div>
      </div>

      {/* Volante na parte inferior central */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-20 pointer-events-none">
        <div
          className="relative w-[340px] h-[340px] transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${steer}deg)` }}
        >
          {/* Aro externo */}
          <div className="absolute inset-0 rounded-full border-[14px] border-[hsl(0_0%_6%)] shadow-2xl"
               style={{ boxShadow: "0 0 60px hsl(0 0% 0% / 0.8), inset 0 0 30px hsl(0 0% 0% / 0.6)" }} />
          {/* Aro interno (textura) */}
          <div className="absolute inset-3 rounded-full border-2 border-[hsl(0_0%_18%)]" />
          <div className="absolute inset-6 rounded-full border border-[hsl(0_0%_12%)]" />

          {/* Spokes (3 raios estilo F1) */}
          <div className="absolute left-1/2 top-1/2 w-[260px] h-6 -translate-x-1/2 -translate-y-1/2 bg-[hsl(0_0%_6%)] rounded" />
          <div
            className="absolute left-1/2 top-1/2 w-[260px] h-6 -translate-x-1/2 -translate-y-1/2 bg-[hsl(0_0%_6%)] rounded"
            style={{ transform: "translate(-50%, -50%) rotate(120deg)" }}
          />
          <div
            className="absolute left-1/2 top-1/2 w-[260px] h-6 -translate-x-1/2 -translate-y-1/2 bg-[hsl(0_0%_6%)] rounded"
            style={{ transform: "translate(-50%, -50%) rotate(-120deg)" }}
          />

          {/* Hub central com cor do time */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(0_0%_10%)] to-[hsl(0_0%_2%)] border-2 border-racing-red flex flex-col items-center justify-center">
            <div className="text-[8px] font-display tracking-widest text-racing-red">#{pilot.number}</div>
            <div className="text-[9px] font-display font-bold text-foreground truncate max-w-[80px] text-center leading-tight">
              {pilot.team.split(" ")[0].toUpperCase()}
            </div>
            <Gauge className="w-3 h-3 text-racing-amber mt-0.5" />
          </div>

          {/* LEDs de RPM no topo */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: 9 }).map((_, i) => {
              const threshold = 5500 + i * 700;
              const lit = rpm >= threshold;
              const color = i < 4 ? "bg-racing-green" : i < 7 ? "bg-racing-amber" : "bg-racing-red";
              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${lit ? color : "bg-[hsl(0_0%_12%)]"} ${lit ? "shadow-[0_0_6px_currentColor]" : ""}`}
                />
              );
            })}
          </div>

          {/* Botões coloridos (DRS / BOOST / PIT) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-racing-amber shadow-[0_0_10px_hsl(var(--racing-amber))]" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-racing-red shadow-[0_0_10px_hsl(var(--racing-red))]" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-4 h-4 rounded-full bg-racing-green shadow-[0_0_10px_hsl(var(--racing-green))]" />
        </div>
      </div>

      {/* Etiqueta POV */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded surface-elev/80 backdrop-blur border border-racing-red/40">
        <span className="text-[9px] font-display font-bold tracking-[0.25em] text-racing-red">
          ◉ ONBOARD CAM · POV PILOTO
        </span>
      </div>
    </div>
  );
};

const CockpitMeter = ({ icon, pct, color }: { icon: React.ReactNode; pct: number; color: string }) => (
  <div className="flex items-center gap-1.5">
    {icon}
    <div className="flex-1 h-1 bg-border rounded overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
    <span className="font-mono text-[9px] tabular-nums text-foreground/70 w-7 text-right">{pct}%</span>
  </div>
);
