import { useEffect, useState } from "react";

interface VideoClip {
  id: string;
  title: string;
  kind: "PIT STOP" | "ULTRAPASSAGEM" | "POLE" | "CRASH" | "VITÓRIA";
  carNumber: number;
  carColor: string;
  sponsor: string;
  sponsorPaid: number;
  // YouTube embed id of a real-life racing clip (autoplay muted)
  youtubeId: string;
}

const CLIPS: VideoClip[] = [
  { id: "1", title: "Pit Stop relâmpago", kind: "PIT STOP", carNumber: 7,  carColor: "#dc2626", sponsor: "RED BULL",  sponsorPaid: 1840, youtubeId: "n7VpWTC6Ito" },
  { id: "2", title: "Ultrapassagem na curva 4", kind: "ULTRAPASSAGEM", carNumber: 12, carColor: "#2563eb", sponsor: "MOBIL 1",   sponsorPaid: 1320, youtubeId: "z7XoX9BLnGo" },
  { id: "3", title: "Pole position cravada", kind: "POLE", carNumber: 3,  carColor: "#facc15", sponsor: "SHELL",     sponsorPaid: 980,  youtubeId: "VnB6BpW8YbA" },
  { id: "4", title: "Vitória apertada", kind: "VITÓRIA", carNumber: 22, carColor: "#16a34a", sponsor: "MICHELIN",  sponsorPaid: 760,  youtubeId: "FN4MQI9NS2k" },
];

/**
 * 16:9 race-video showcase shown in the LEFT side of the profile.
 * Plays a stock racing clip and overlays the WINNING SPONSOR + the customizable
 * car number/color. The sponsor "wins" the slot 1h before the moment in the
 * race (simulated here by a 10s spotlight rotation between auction winners).
 */
export const RaceVideosPanel = () => {
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIdx((i) => (i + 1) % CLIPS.length);
          return 10;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const clip = CLIPS[idx];

  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[10px] tracking-[0.2em] font-display font-bold">
            VÍDEOS DA CORRIDA
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground tracking-widest">
          PRÓX EM {secondsLeft}s
        </span>
      </div>

      {/* 16:9 video */}
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          key={clip.id}
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${clip.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${clip.youtubeId}&modestbranding=1&playsinline=1`}
          title={clip.title}
          frameBorder={0}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />

        {/* SPONSOR LEILÃO — destaque alto */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="bg-racing-amber text-background px-2 py-1 rounded font-display font-black tracking-widest text-[11px] shadow-lg ring-1 ring-foreground/20 animate-fade-in">
            SPONSOR · {clip.sponsor}
          </div>
          <div className="bg-background/80 text-foreground px-2 py-0.5 rounded text-[9px] font-display tracking-widest">
            {clip.kind}
          </div>
        </div>

        {/* Lower-third — carro destaque */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/95 to-transparent p-2 flex items-end justify-between pointer-events-none">
          <div>
            <div className="text-[10px] text-muted-foreground tracking-widest font-display">CARRO EM DESTAQUE</div>
            <div className="flex items-center gap-2">
              <span
                className="font-display font-black text-2xl leading-none"
                style={{ color: clip.carColor, textShadow: "0 1px 4px rgba(0,0,0,.7)" }}
              >
                #{clip.carNumber}
              </span>
              <span className="text-[12px] font-display font-bold">{clip.title}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground tracking-widest">LANCE VENCEDOR</div>
            <div className="text-[14px] font-display font-bold text-racing-amber">
              ${clip.sponsorPaid.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Spotlight progress */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-racing-amber" style={{ width: `${(secondsLeft / 10) * 100}%` }} />
      </div>

      {/* Up-next strip */}
      <div className="p-2 grid grid-cols-4 gap-1.5 border-t border-border">
        {CLIPS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setIdx(i); setSecondsLeft(10); }}
            className={`text-left p-1.5 rounded text-[9px] font-display tracking-widest transition-colors ${
              i === idx ? "bg-racing-red text-primary-foreground" : "surface-2 hud-border hover:bg-secondary"
            }`}
          >
            <div className="font-bold">#{c.carNumber} · {c.kind}</div>
            <div className="opacity-80 truncate">{c.sponsor}</div>
          </button>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-border flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">
          Sponsors compram o slot 1h antes do momento na corrida.
        </span>
        <button className="text-[9px] font-display font-bold tracking-widest bg-racing-amber text-background px-2 py-1 rounded hover:opacity-90">
          DAR LANCE
        </button>
      </div>
    </div>
  );
};
