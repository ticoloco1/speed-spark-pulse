import type { Pilot } from "@/racing/types";
import { useRaceStore } from "@/racing/engine";
import { Link } from "react-router-dom";
import { RaceCar } from "./RaceCar";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

interface PilotLeaderboardProps {
  pilot: Pilot;
}

export const PilotLeaderboard = ({ pilot }: PilotLeaderboardProps) => {
  const allPilots = useRaceStore((s) => s.pilots);
  const sorted = [...allPilots].sort((a, b) => a.position - b.position);
  const idx = sorted.findIndex((p) => p.id === pilot.id);

  // Show 3 above, the pilot, and 3 below
  const start = Math.max(0, idx - 3);
  const end = Math.min(sorted.length, idx + 4);
  const window = sorted.slice(start, end);

  // Top 3 always shown above the window if not already included
  const top3 = sorted.slice(0, 3);
  const showTop = start > 3;

  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-background/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] font-display font-bold">CLASSIFICAÇÃO</span>
          <span className="live-dot" />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">posição ao vivo</span>
      </div>

      <div className="divide-y divide-border/50">
        {showTop && (
          <>
            {top3.map((p) => (
              <Row key={p.id} p={p} highlight={false} />
            ))}
            <div className="px-3 py-1.5 text-[10px] text-muted-foreground tracking-widest font-display bg-background/30 text-center">
              ···
            </div>
          </>
        )}
        {window.map((p) => (
          <Row key={p.id} p={p} highlight={p.id === pilot.id} />
        ))}
      </div>
    </div>
  );
};

const Row = ({ p, highlight }: { p: Pilot; highlight: boolean }) => {
  // Deterministic delta indicator
  const trend = (p.id.charCodeAt(p.id.length - 1) % 3) - 1; // -1, 0, 1
  const TrendIcon = trend > 0 ? ChevronUp : trend < 0 ? ChevronDown : Minus;
  const trendColor = trend > 0 ? "text-racing-green" : trend < 0 ? "text-racing-red" : "text-muted-foreground";

  return (
    <Link
      to={`/racing/${p.slug}`}
      className={`flex items-center gap-3 px-3 py-2 transition-colors ${
        highlight ? "bg-racing-red/15 border-l-2 border-racing-red" : "hover:bg-secondary/50"
      }`}
    >
      <div
        className={`w-7 text-center font-display font-bold text-sm tabular-nums ${
          p.position === 1 ? "text-racing-amber" : highlight ? "text-racing-red" : "text-muted-foreground"
        }`}
      >
        {p.position}
      </div>
      <div className="w-12 h-7 shrink-0">
        <RaceCar color={p.carColor} number={p.number} className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-display font-bold truncate">{p.name}</span>
          <span className="text-[10px]">{p.country}</span>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono truncate">
          #{p.number} · {p.bestLap}
        </div>
      </div>
      <TrendIcon className={`w-4 h-4 ${trendColor}`} />
    </Link>
  );
};
