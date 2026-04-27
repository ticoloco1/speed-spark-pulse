import { useEffect, useMemo, useState } from "react";
import { useRaceStore } from "@/racing/engine";
import { Link } from "react-router-dom";
import { CarRenderer } from "./CarRenderer";
import { Gavel, Crown, ExternalLink } from "lucide-react";
import trackBg from "@/assets/track-bg.jpg";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const SPONSOR_BIDDERS = [
  "BMW M PERFORMANCE", "PORSCHE MOTORSPORT", "RED BULL RACING",
  "MONSTER ENERGY", "SHELL V-POWER", "PIRELLI P-ZERO",
  "PETRONAS SYNTIUM", "MOBIL 1", "TAG HEUER",
];

interface AuctionBid {
  sponsor: string;
  amount: number;
  at: number;
}

/**
 * Live boost auction lane.
 * - Sponsors place bids in real time (top bid sponsors the leading pilot's car).
 * - Every 3 minutes a 15s "spotlight window" highlights the winning car
 *   with extra speed / fanfare across the full lane.
 * - The car visual ALWAYS comes from the same Race Identity Pack
 *   (no separate PNG anywhere).
 */
export const BoostTrack = () => {
  const boosts = useRaceStore((s) => s.boosts);
  const pilots = useRaceStore((s) => s.pilots);
  const top = boosts[0];
  const next = boosts[1];
  const pilot = top ? pilots.find((p) => p.id === top.pilotId) : pilots[0];

  // Car flows continuously from bottom to top via CSS animation (no jumping).

  // ── Auction state ─────────────────────────────────────────────────────────
  const [bids, setBids] = useState<AuctionBid[]>(() => [
    { sponsor: "BMW M PERFORMANCE", amount: 5000, at: Date.now() - 4000 },
    { sponsor: "PORSCHE MOTORSPORT", amount: 5400, at: Date.now() - 2000 },
  ]);

  // New bid every 4-9s
  useEffect(() => {
    let alive = true;
    function schedule() {
      const delay = 4000 + Math.random() * 5000;
      setTimeout(() => {
        if (!alive) return;
        setBids((prev) => {
          const last = prev[0]?.amount ?? 5000;
          const bump = 200 + Math.floor(Math.random() * 1800);
          const sponsor = SPONSOR_BIDDERS[Math.floor(Math.random() * SPONSOR_BIDDERS.length)];
          return [{ sponsor, amount: last + bump, at: Date.now() }, ...prev].slice(0, 6);
        });
        schedule();
      }, delay);
    }
    schedule();
    return () => { alive = false; };
  }, []);

  const leadBid = bids[0];

  // ── Spotlight window: 15s open every 3 min (180s) ─────────────────────────
  const [spotlight, setSpotlight] = useState(false);
  const [spotlightCountdown, setSpotlightCountdown] = useState(180);
  useEffect(() => {
    const id = setInterval(() => {
      setSpotlightCountdown((c) => {
        if (c <= 1) {
          setSpotlight(true);
          // close after 15s
          setTimeout(() => setSpotlight(false), 15000);
          return 180;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isSafetyCar = top?.isSafetyCar ?? false;

  // Speed of the showcased car — boosted during spotlight or safety car (slower)
  const carSpeed = isSafetyCar ? 0.25 : spotlight ? 1 : 0.85;

  return (
    <aside className="relative w-full h-full surface-1 hud-border rounded-md overflow-hidden flex flex-col">
      {/* Track background */}
      <img src={trackBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-15" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/95" />

      {/* Guard rails */}
      <div className="absolute top-0 bottom-0 left-1.5 w-[5px] bg-gradient-to-b from-racing-red via-white to-racing-red opacity-60" style={{ backgroundSize: "100% 28px" }} />
      <div className="absolute top-0 bottom-0 right-1.5 w-[5px] bg-gradient-to-b from-white via-racing-red to-white opacity-60" style={{ backgroundSize: "100% 28px" }} />

      {/* Spotlight overlay */}
      {spotlight && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-racing-amber/10" />
          <div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-racing-amber/40 to-transparent"
            style={{ animation: "spotlight-sweep 1.4s linear infinite" }}
          />
        </div>
      )}

      {/* ── Header: live auction status ───────────────────────────────────── */}
      <div className="relative z-10 px-3 pt-3 pb-2 border-b border-border/60">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <Gavel className="w-3 h-3 text-racing-amber" />
            <span className="text-[10px] tracking-[0.18em] font-display font-bold text-racing-amber">
              LEILÃO AO VIVO
            </span>
          </div>
          <span className={`live-dot ${isSafetyCar ? "siren-light" : ""}`} />
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[9px] text-muted-foreground font-display tracking-wider">LANCE LÍDER</div>
            <div className="font-display font-bold text-2xl text-racing-amber tabular-nums leading-none">
              ${leadBid.amount.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground font-display tracking-wider">SPOTLIGHT</div>
            <div className="font-mono text-sm tabular-nums text-foreground">
              {spotlight ? <span className="text-racing-red font-bold">AO VIVO</span> : fmt(spotlightCountdown)}
            </div>
          </div>
        </div>
        <div
          key={leadBid.at}
          className="text-[10px] font-display font-bold text-foreground truncate mt-0.5"
          style={{ animation: "auction-bid 0.5s ease-out" }}
        >
          <Crown className="w-3 h-3 inline mr-1 text-racing-amber" />
          {leadBid.sponsor}
        </div>
      </div>

      {/* ── Slug header for the patronaged pilot ─────────────────────────── */}
      {pilot && (
        <Link
          to={`/racing/${pilot.slug}`}
          className="relative z-10 mx-2 mt-2 px-2 py-2 rounded surface-2 hud-border block hover:bg-secondary transition-colors"
        >
          <div className="flex items-baseline gap-1 text-[10px] font-mono text-muted-foreground">
            <span className="font-display font-bold text-racing-red">{pilot.position}</span>
            <span>.{pilot.slug}.trustbank.xyz</span>
            <ExternalLink className="w-2.5 h-2.5 ml-auto" />
          </div>
          <div className="font-display font-bold text-sm text-foreground truncate mt-0.5">
            {pilot.name}
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            patrocinado por <span className="text-racing-amber font-bold">{leadBid.sponsor}</span>
          </div>
        </Link>
      )}

      {/* ── Vertical race lane ────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 mx-2 my-2 rounded-md surface-2 border border-border overflow-hidden min-h-[260px]">
        {/* Asphalt with moving lane stripes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
        <div
          className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
          style={{
            backgroundImage: "repeating-linear-gradient(180deg, hsl(0 0% 100% / 0.55) 0 14px, transparent 14px 32px)",
            animation: "asphalt-scroll 0.35s linear infinite reverse",
            backgroundSize: "100% 46px",
          }}
        />
        {/* Side lane lines */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
        <div className="absolute right-3 top-0 bottom-0 w-px bg-white/10" />

        {/* Car going up (top view to fit vertical lane) */}
        {pilot && (
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-[bottom] duration-100 ease-linear car-chassis-vibrate"
            style={{ bottom: `${carPos}%`, width: "60%", maxWidth: "120px" }}
          >
            <CarRenderer
              pilot={pilot}
              view="top"
              speed={carSpeed}
              boosting={spotlight}
              braking={isSafetyCar}
            />
          </div>
        )}

        {/* Spotlight window banner */}
        {spotlight && (
          <div className="absolute top-2 left-2 right-2 z-10 surface-elev/90 backdrop-blur rounded px-2 py-1.5 border border-racing-amber/60 animate-fade-in">
            <div className="text-[9px] font-display font-bold tracking-widest text-racing-amber">
              JANELA SPOTLIGHT · 15s
            </div>
            <div className="text-[10px] font-display font-bold truncate text-foreground">
              {pilot?.name} · {leadBid.sponsor}
            </div>
          </div>
        )}
      </div>

      {/* ── Recent bids list ──────────────────────────────────────────────── */}
      <div className="relative z-10 mx-2 mb-2 surface-2 hud-border rounded p-2">
        <div className="text-[9px] tracking-widest font-display font-bold text-muted-foreground mb-1">
          ÚLTIMOS LANCES
        </div>
        <div className="space-y-0.5 max-h-[88px] overflow-hidden">
          {bids.slice(0, 4).map((b, i) => (
            <div
              key={b.at}
              className={`flex items-center justify-between text-[10px] font-mono tabular-nums ${i === 0 ? "text-racing-amber font-bold" : "text-muted-foreground"}`}
            >
              <span className="truncate font-display font-bold text-[10px] max-w-[110px]">{b.sponsor}</span>
              <span>${b.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <button className="mt-2 w-full text-[10px] font-display font-bold tracking-widest py-1.5 rounded bg-racing-amber text-background hover:opacity-90 transition-opacity">
          DAR LANCE
        </button>
      </div>

      {/* Next boost queued */}
      {next && (
        <div className="relative z-10 mx-2 mb-2 px-2 py-1.5 rounded surface-2 hud-border">
          <div className="text-[9px] text-muted-foreground tracking-widest font-display">PRÓXIMO BOOST</div>
          <div className="text-[10px] font-display font-bold truncate">{next.sponsor}</div>
          <div className="font-mono text-xs text-racing-red tabular-nums">{fmt(next.remaining)}</div>
        </div>
      )}
    </aside>
  );
};
