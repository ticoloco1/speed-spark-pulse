import { useEffect, useState } from "react";
import { useRaceStore } from "@/racing/engine";
import { RaceCar } from "./RaceCar";
import { SAFETY_CAR_IMG } from "@/racing/cars";
import trackBg from "@/assets/track-bg.jpg";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Left vertical Boost Track. Always shows the current top boost.
 * Shows safety car mode with siren when isSafetyCar.
 */
export const BoostTrack = () => {
  const boosts = useRaceStore((s) => s.boosts);
  const pilots = useRaceStore((s) => s.pilots);
  const top = boosts[0];
  const next = boosts[1];
  const pilot = top ? pilots.find((p) => p.id === top.pilotId) : undefined;
  const [carPos, setCarPos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCarPos((p) => (p + 1) % 100);
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="relative w-full h-full surface-1 border-r border-border overflow-hidden flex flex-col">
      {/* Track background image */}
      <img
        src={trackBg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/90" />

      {/* Animated guard rails */}
      <div className="absolute top-0 bottom-0 left-2 w-[6px] bg-gradient-to-b from-racing-red via-white to-racing-red opacity-70" style={{ backgroundSize: "100% 40px" }} />
      <div className="absolute top-0 bottom-0 right-2 w-[6px] bg-gradient-to-b from-white via-racing-red to-white opacity-70" style={{ backgroundSize: "100% 40px" }} />

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className={`live-dot ${top?.isSafetyCar ? "siren-light" : ""}`} />
          <span className="text-[10px] tracking-[0.2em] font-display font-bold text-foreground/80">
            {top?.isSafetyCar ? "SAFETY CAR ATIVO" : "BOOST ATIVO"}
          </span>
        </div>

        <div className="font-display font-bold text-3xl tabular-nums text-foreground tracking-tight">
          {top ? fmt(top.remaining) : "--:--"}
        </div>
        <div className="text-[10px] text-muted-foreground font-display tracking-wider">
          {top?.isSafetyCar ? "SIRENE LIGADA" : "TEMPO RESTANTE"}
        </div>
      </div>

      {/* Sponsor + amount */}
      <div className="relative z-10 px-4 py-2 border-y border-border/60 bg-background/40 backdrop-blur">
        <div className="text-[10px] text-muted-foreground font-display tracking-wider">
          {top?.sponsorTagline ?? "SPONSOR"}
        </div>
        <div className="font-display font-bold text-base text-foreground truncate">
          {top?.sponsor ?? "—"}
        </div>
        <div className="text-racing-amber font-mono font-bold text-lg mt-0.5">
          ${top?.amount.toLocaleString() ?? "0"}
        </div>
      </div>

      {/* Vertical race track with car */}
      <div className="relative z-10 flex-1 mx-4 my-3 rounded-md surface-2 border border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
        {/* Lane markers */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
          <div className="h-full w-full" style={{
            backgroundImage: "repeating-linear-gradient(180deg, hsl(0 0% 100% / 0.5) 0 14px, transparent 14px 28px)"
          }} />
        </div>

        {/* Animated car going up */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-transform duration-100 ease-linear"
          style={{ bottom: `${carPos}%`, width: "70%" }}
        >
          {top?.isSafetyCar ? (
            <img src={SAFETY_CAR_IMG} alt="Safety car" className="w-full" loading="lazy" />
          ) : (
            <RaceCar color={pilot?.carColor ?? "red"} number={pilot?.number} className="w-full h-auto" />
          )}
        </div>

        {/* Pilot info bottom */}
        {pilot && (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="text-[10px] text-muted-foreground font-display tracking-wider">PILOT</div>
            <div className="text-sm font-display font-bold text-foreground truncate">
              {pilot.name} <span className="text-muted-foreground">#{pilot.number}</span>
            </div>
          </div>
        )}
      </div>

      {/* Next boost coming */}
      {next && (
        <div className="relative z-10 mx-4 mb-4 p-3 rounded-md surface-2 border border-border">
          <div className="text-[10px] text-muted-foreground font-display tracking-wider mb-1">PRÓXIMO BOOST</div>
          <div className="text-xs font-display font-bold text-foreground truncate">{next.sponsor}</div>
          <div className="font-display font-bold text-xl tabular-nums text-racing-red mt-1">
            {fmt(next.remaining)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">VALOR ATUAL</div>
          <div className="text-racing-amber font-mono text-sm font-bold">${next.amount.toLocaleString()}</div>
          <button className="mt-2 w-full text-[10px] font-display font-bold tracking-widest py-1.5 rounded bg-racing-red text-primary-foreground hover:opacity-90 transition-opacity">
            VER LEILÃO
          </button>
        </div>
      )}
    </aside>
  );
};
