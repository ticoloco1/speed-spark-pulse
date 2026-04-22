import { Link } from "react-router-dom";
import { Bell, Fuel, Gem, Mail } from "lucide-react";
import { useRaceStore } from "@/racing/engine";

export const RacingHeader = () => {
  const c = useRaceStore((s) => s.conditions);
  return (
    <header className="h-14 surface-1 border-b border-border flex items-center justify-between px-4 z-30">
      <Link to="/racing" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-racing-red to-racing-red/60 flex items-center justify-center font-display font-bold text-sm">
          T
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold tracking-tight text-base">TRUSTBANK</div>
          <div className="text-[9px] text-racing-red font-display font-bold tracking-[0.2em] -mt-0.5">RACING ⚡</div>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 surface-2 rounded px-2.5 py-1.5">
          <Fuel className="w-3.5 h-3.5 text-racing-amber" />
          <span className="font-mono text-xs font-bold tabular-nums">$25,430</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 surface-2 rounded px-2.5 py-1.5">
          <Gem className="w-3.5 h-3.5 text-racing-red" />
          <span className="font-mono text-xs font-bold tabular-nums">3,240</span>
        </div>
        <button className="p-2 rounded hover:bg-secondary transition-colors relative">
          <Mail className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-2 rounded hover:bg-secondary transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-racing-red rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-racing-red to-racing-purple border-2 border-background ring-2 ring-racing-red/40" />
      </div>
    </header>
  );
};
