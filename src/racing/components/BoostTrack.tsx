import { useEffect, useMemo, useState } from "react";
import { useRaceStore } from "@/racing/engine";
import { Link } from "react-router-dom";
import { CarRenderer } from "./CarRenderer";
import { Gavel, Crown, ExternalLink, Building2, Trophy, Clock } from "lucide-react";
import trackBg from "@/assets/track-bg.jpg";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Scuderias (empresas) que alugam o slot e disputam o leilão
const SCUDERIAS = [
  { brand: "BMW M PERFORMANCE", scuderia: "Scuderia Bavaria", color: "racing-blue" },
  { brand: "PORSCHE MOTORSPORT", scuderia: "Stuttgart Racing", color: "racing-amber" },
  { brand: "RED BULL RACING", scuderia: "Energy Bulls GP", color: "racing-red" },
  { brand: "MONSTER ENERGY", scuderia: "Claw Motorsport", color: "racing-green" },
  { brand: "SHELL V-POWER", scuderia: "Helix Racing Team", color: "racing-amber" },
  { brand: "PIRELLI P-ZERO", scuderia: "Black Wall Racing", color: "racing-red" },
  { brand: "PETRONAS SYNTIUM", scuderia: "Mercato GP", color: "racing-green" },
  { brand: "MOBIL 1", scuderia: "Pegasus Racing", color: "racing-blue" },
  { brand: "TAG HEUER", scuderia: "Carrera Squad", color: "racing-amber" },
];

interface AuctionBid {
  scuderia: string;
  brand: string;
  color: string;
  amount: number;
  at: number;
  pilotId: string;
}

interface AuctionWinner {
  brand: string;
  scuderia: string;
  color: string;
  amount: number;
  pilotId: string;
  startedAt: number;
  durationSec: number; // tempo de tela comprado
}

const SLOT_DURATION = 25; // 25s de tela por leilão vencido

/**
 * Pista do meio = LEILÃO AO VIVO de tempo de tela.
 * - Scuderias (empresas) dão lances para que SEU piloto + marca apareçam aqui.
 * - O maior lance vence o slot atual (25s) e mostra o carro com a marca por cima.
 * - Próximos vencedores entram na FILA e aparecem em sequência.
 * - Volta mais rápida do piloto destacado é exibida em tempo real.
 */
export const BoostTrack = () => {
  const pilots = useRaceStore((s) => s.pilots);

  // ── Vencedor atual + fila ────────────────────────────────────────────────
  const [currentWinner, setCurrentWinner] = useState<AuctionWinner>(() => {
    const s = SCUDERIAS[0];
    return {
      ...s,
      amount: 5400,
      pilotId: pilots[0]?.id ?? "p_1",
      startedAt: Date.now(),
      durationSec: SLOT_DURATION,
    };
  });
  const [queue, setQueue] = useState<AuctionWinner[]>([]);

  // Lances do leilão em andamento (próximo slot)
  const [bids, setBids] = useState<AuctionBid[]>(() => {
    const s1 = SCUDERIAS[1];
    const s2 = SCUDERIAS[2];
    return [
      { ...s1, amount: 6200, at: Date.now() - 2000, pilotId: pilots[1]?.id ?? "p_2" },
      { ...s2, amount: 5800, at: Date.now() - 4000, pilotId: pilots[2]?.id ?? "p_3" },
    ];
  });

  // ── Countdown do slot atual ──────────────────────────────────────────────
  const [slotRemaining, setSlotRemaining] = useState(SLOT_DURATION);
  useEffect(() => {
    const id = setInterval(() => {
      setSlotRemaining((r) => {
        if (r <= 1) {
          // Slot termina: promover o maior lance da fila
          setQueue((q) => {
            if (q.length === 0) return q;
            const [next, ...rest] = q;
            setCurrentWinner({ ...next, startedAt: Date.now() });
            return rest;
          });
          return SLOT_DURATION;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Novos lances (a cada 3-7s) ───────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    function schedule() {
      const delay = 3000 + Math.random() * 4000;
      setTimeout(() => {
        if (!alive) return;
        setBids((prev) => {
          const top = prev[0]?.amount ?? currentWinner.amount;
          const bump = 300 + Math.floor(Math.random() * 2200);
          const sc = SCUDERIAS[Math.floor(Math.random() * SCUDERIAS.length)];
          const pilot = pilots[Math.floor(Math.random() * pilots.length)];
          const next: AuctionBid = {
            ...sc,
            amount: top + bump,
            at: Date.now(),
            pilotId: pilot?.id ?? "p_1",
          };
          return [next, ...prev].slice(0, 8);
        });
        schedule();
      }, delay);
    }
    schedule();
    return () => { alive = false; };
  }, [pilots, currentWinner.amount]);

  // Promover maior lance para fila quando atinge novo recorde
  useEffect(() => {
    const top = bids[0];
    if (!top) return;
    setQueue((q) => {
      // Evita duplicar a mesma entrada
      if (q.some((x) => x.brand === top.brand && x.amount === top.amount)) return q;
      const winner: AuctionWinner = {
        brand: top.brand,
        scuderia: top.scuderia,
        color: top.color,
        amount: top.amount,
        pilotId: top.pilotId,
        startedAt: 0,
        durationSec: SLOT_DURATION,
      };
      // Mantém fila ordenada por valor (maior primeiro), até 4 vencedores
      const merged = [...q, winner].sort((a, b) => b.amount - a.amount).slice(0, 4);
      return merged;
    });
  }, [bids]);

  const pilot = useMemo(
    () => pilots.find((p) => p.id === currentWinner.pilotId) ?? pilots[0],
    [pilots, currentWinner.pilotId]
  );

  const slotProgress = ((SLOT_DURATION - slotRemaining) / SLOT_DURATION) * 100;
  const leadBid = bids[0];

  return (
    <aside className="relative w-full h-full surface-1 hud-border rounded-md overflow-hidden flex flex-col">
      {/* Track background */}
      <img src={trackBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-15" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/95" />

      {/* Guard rails */}
      <div className="absolute top-0 bottom-0 left-1.5 w-[5px] bg-gradient-to-b from-racing-red via-white to-racing-red opacity-60" style={{ backgroundSize: "100% 28px" }} />
      <div className="absolute top-0 bottom-0 right-1.5 w-[5px] bg-gradient-to-b from-white via-racing-red to-white opacity-60" style={{ backgroundSize: "100% 28px" }} />

      {/* ── Header: leilão ao vivo ───────────────────────────────────────── */}
      <div className="relative z-10 px-3 pt-3 pb-2 border-b border-border/60">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <Gavel className="w-3 h-3 text-racing-amber" />
            <span className="text-[10px] tracking-[0.18em] font-display font-bold text-racing-amber">
              LEILÃO AO VIVO
            </span>
          </div>
          <span className="live-dot" />
        </div>

        {/* Slot vencedor atual */}
        <div className="surface-2 rounded px-2 py-1.5 border border-racing-amber/40">
          <div className="flex items-center justify-between text-[9px] font-display tracking-widest mb-0.5">
            <span className="text-racing-amber font-bold flex items-center gap-1">
              <Crown className="w-2.5 h-2.5" /> NO AR AGORA
            </span>
            <span className="text-foreground font-mono tabular-nums">
              <Clock className="w-2.5 h-2.5 inline mr-0.5" />
              {slotRemaining}s
            </span>
          </div>
          <div className="font-display font-bold text-sm text-foreground truncate leading-tight">
            {currentWinner.brand}
          </div>
          <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5" /> {currentWinner.scuderia}
          </div>
          <div className="font-mono font-bold text-racing-amber tabular-nums text-xs mt-0.5">
            ${currentWinner.amount.toLocaleString()}
          </div>
          {/* Barra de tempo restante */}
          <div className="mt-1 h-0.5 bg-border rounded overflow-hidden">
            <div
              className="h-full bg-racing-amber transition-all duration-1000"
              style={{ width: `${slotProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Header do piloto patrocinado ─────────────────────────────────── */}
      {pilot && (
        <Link
          to={`/racing/${pilot.slug}`}
          className="relative z-10 mx-2 mt-2 px-2 py-2 rounded surface-2 hud-border block hover:bg-secondary transition-colors"
        >
          <div className="flex items-baseline gap-1 text-[10px] font-mono text-muted-foreground">
            <span className="font-display font-bold text-racing-red">#{pilot.number}</span>
            <span className="font-display font-bold text-racing-red">P{pilot.position}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-auto" />
          </div>
          <div className="font-display font-bold text-sm text-foreground truncate mt-0.5">
            {pilot.name}
          </div>
          <div className="flex items-center justify-between text-[10px] mt-0.5">
            <span className="text-muted-foreground truncate">
              <Trophy className="w-2.5 h-2.5 inline mr-0.5 text-racing-amber" />
              Volta: <span className="font-mono text-foreground">{pilot.bestLap}</span>
            </span>
          </div>
        </Link>
      )}

      {/* ── Pista vertical com o carro do vencedor ───────────────────────── */}
      <div className="relative z-10 flex-1 mx-2 my-2 rounded-md surface-2 border border-border overflow-hidden min-h-[220px]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
        <div
          className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
          style={{
            backgroundImage: "repeating-linear-gradient(180deg, hsl(0 0% 100% / 0.55) 0 14px, transparent 14px 32px)",
            animation: "asphalt-scroll 0.35s linear infinite reverse",
            backgroundSize: "100% 46px",
          }}
        />
        <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
        <div className="absolute right-3 top-0 bottom-0 w-px bg-white/10" />

        {/* Marca patrocinadora SOBRE o carro (super visível) */}
        <div className="absolute top-2 left-2 right-2 z-10 surface-elev/90 backdrop-blur rounded px-2 py-1 border border-racing-amber/60 animate-fade-in">
          <div className="text-[9px] font-display font-bold tracking-widest text-racing-amber truncate">
            🏁 {currentWinner.brand}
          </div>
        </div>

        {/* Carro do piloto vencedor — fluxo contínuo de baixo para cima */}
        {pilot && (
          <div
            key={currentWinner.startedAt}
            className="absolute left-0 right-0 bottom-0 flex justify-center pointer-events-none animate-car-run-up-lane car-chassis-vibrate"
            style={{ animationDuration: "8s" }}
          >
            <div style={{ width: "60%", maxWidth: "120px" }}>
              <CarRenderer pilot={pilot} view="top" speed={0.95} boosting={false} braking={false} />
            </div>
          </div>
        )}
      </div>

      {/* ── Fila de próximos vencedores ──────────────────────────────────── */}
      {queue.length > 0 && (
        <div className="relative z-10 mx-2 mb-2 surface-2 hud-border rounded p-2">
          <div className="text-[9px] tracking-widest font-display font-bold text-muted-foreground mb-1">
            FILA · PRÓXIMOS NO AR
          </div>
          <div className="space-y-1 max-h-[80px] overflow-hidden">
            {queue.map((w, i) => (
              <div
                key={`${w.brand}-${w.amount}`}
                className="flex items-center justify-between text-[10px] surface-elev rounded px-1.5 py-1"
              >
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className={`font-mono tabular-nums text-${w.color} font-bold w-3`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-foreground truncate text-[10px] leading-tight">
                      {w.brand}
                    </div>
                    <div className="text-muted-foreground truncate text-[9px] leading-tight">
                      {w.scuderia}
                    </div>
                  </div>
                </div>
                <span className="font-mono tabular-nums text-racing-amber font-bold text-[10px] ml-1">
                  ${(w.amount / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lances ao vivo ───────────────────────────────────────────────── */}
      <div className="relative z-10 mx-2 mb-2 surface-2 hud-border rounded p-2">
        <div className="flex items-center justify-between text-[9px] tracking-widest font-display font-bold mb-1">
          <span className="text-muted-foreground">LANCES AO VIVO</span>
          <span className="text-racing-amber tabular-nums">
            ${leadBid?.amount.toLocaleString() ?? "0"}
          </span>
        </div>
        <div className="space-y-0.5 max-h-[80px] overflow-hidden">
          {bids.slice(0, 4).map((b, i) => (
            <div
              key={b.at}
              className={`flex items-center justify-between text-[10px] font-mono tabular-nums ${i === 0 ? "text-racing-amber font-bold" : "text-muted-foreground"}`}
              style={i === 0 ? { animation: "auction-bid 0.5s ease-out" } : undefined}
            >
              <span className="truncate font-display font-bold text-[10px] max-w-[120px]">
                {b.brand}
              </span>
              <span>${b.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <button className="mt-2 w-full text-[10px] font-display font-bold tracking-widest py-1.5 rounded bg-racing-amber text-background hover:opacity-90 transition-opacity">
          ALUGAR SCUDERIA · DAR LANCE
        </button>
      </div>
    </aside>
  );
};
