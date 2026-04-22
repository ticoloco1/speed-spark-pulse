import { useRaceStore } from "@/racing/engine";
import { RaceCar } from "./RaceCar";
import { Heart, MessageCircle, PlayCircle } from "lucide-react";

export const RacingFeed = () => {
  const feed = useRaceStore((s) => s.feed);
  const pilots = useRaceStore((s) => s.pilots);

  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/40">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[10px] tracking-[0.2em] font-display font-bold">RACING FEED</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">global · live</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-border/50">
        {feed.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">Carregando feed ao vivo…</div>
        )}

        {feed.map((f) => {
          const p = pilots.find((pp) => pp.id === f.pilotId);
          if (!p) return null;
          const isPaid = f.kind === "paid";

          return (
            <div
              key={f.id}
              className={`p-3 animate-fade-in ${
                isPaid ? "bg-racing-red/5 border-l-2 border-racing-red" : ""
              }`}
            >
              {isPaid && (
                <div className="text-[9px] tracking-[0.2em] font-display font-bold text-racing-red mb-1.5">
                  BOOST PATROCINADO
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full surface-3 border border-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-display font-bold">{p.name.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display font-bold truncate">
                      {isPaid && f.sponsor ? f.sponsor : p.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {f.ageSec === 0 ? "agora" : `${Math.floor(f.ageSec / 60)} min ago`}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5 leading-snug">{f.text}</p>

                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-racing-red transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                      {f.likes}
                    </button>
                    <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {f.comments}
                    </button>
                    {isPaid && f.cta && (
                      <button className="ml-auto text-[10px] font-display font-bold tracking-widest text-racing-red hover:underline">
                        {f.cta} →
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-20 h-12 shrink-0 rounded overflow-hidden surface-2">
                  <RaceCar color={p.carColor} number={p.number} className="w-full h-full" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
