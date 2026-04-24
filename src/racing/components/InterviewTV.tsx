import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Tv, Loader2 } from "lucide-react";
import { db, type DbPilot } from "@/racing/db";
import { supabase } from "@/integrations/supabase/client";

interface Interview {
  pilot: DbPilot;
  lowerThird: string;
  headline: string;
  quote: string;
}

const FORMATS: Array<"pit" | "post-race" | "breaking" | "grid"> = ["pit", "post-race", "breaking", "grid"];
const ROTATION_MS = 18000;

/**
 * TV-style panel cycling through AI-generated pilot interviews.
 * Photo (or fallback) + lower-third chyron + headline + quote.
 * Photo & content change each rotation ("a cada passagem de carro").
 */
export function InterviewTV() {
  const [pilots, setPilots] = useState<DbPilot[]>([]);
  const [current, setCurrent] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const cursor = useRef(0);
  const formatIdx = useRef(0);

  useEffect(() => {
    db.listPilots().then(setPilots).catch(() => setPilots([]));
  }, []);

  useEffect(() => {
    if (pilots.length === 0) return;
    let cancelled = false;

    const fetchOne = async () => {
      const pilot = pilots[cursor.current % pilots.length];
      const format = FORMATS[formatIdx.current % FORMATS.length];
      cursor.current++;
      formatIdx.current++;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("pilot-interview", {
          body: {
            pilot: {
              name: pilot.name, number: pilot.number,
              team: pilot.team, sponsor: pilot.sponsor, country: pilot.country,
            },
            format,
          },
        });
        if (cancelled) return;
        if (error) throw error;
        setCurrent({
          pilot,
          lowerThird: data?.lowerThird ?? "LIVE",
          headline: data?.headline ?? `${pilot.name.toUpperCase()} EM DESTAQUE`,
          quote: data?.quote ?? "Carro está colado, vamos com tudo.",
        });
      } catch {
        if (!cancelled) {
          setCurrent({
            pilot,
            lowerThird: "LIVE",
            headline: `${pilot.name.toUpperCase()} NA TRANSMISSÃO`,
            quote: "Vamos com tudo nessa próxima volta.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOne();
    const interval = setInterval(fetchOne, ROTATION_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [pilots]);

  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/60">
        <div className="flex items-center gap-1.5">
          <Tv className="w-3 h-3 text-racing-red" />
          <span className="text-[10px] tracking-[0.2em] font-display font-bold text-racing-red">TV · ENTREVISTAS IA</span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">CH 04</span>
      </div>

      {/* TV screen */}
      <div className="relative aspect-[4/3] bg-background overflow-hidden">
        {/* Photo */}
        {current?.pilot.photo_url ? (
          <img
            src={current.pilot.photo_url}
            alt={current.pilot.name}
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            key={current.pilot.id}
          />
        ) : current ? (
          <div
            key={current.pilot.id}
            className="absolute inset-0 w-full h-full animate-fade-in flex items-center justify-center"
            style={{
              background: `radial-gradient(ellipse at center, hsl(var(--racing-${current.pilot.car_color === "black" ? "purple" : current.pilot.car_color}) / 0.35), hsl(var(--background)))`,
            }}
          >
            <div className="font-display font-bold text-7xl text-foreground/40">#{current.pilot.number}</div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}

        {/* Scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 2px, hsl(var(--background)) 2px 3px)",
          }}
          aria-hidden
        />

        {/* Top tag — sponsor + scuderia */}
        {current ? (
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
            <div className="px-2 py-0.5 bg-background/80 backdrop-blur rounded-sm text-[9px] font-display font-bold tracking-[0.15em] uppercase truncate">
              {current.pilot.sponsor}
            </div>
            <div className="px-2 py-0.5 bg-racing-red text-primary-foreground rounded-sm text-[9px] font-display font-bold tracking-[0.15em] uppercase animate-pulse">
              ● LIVE
            </div>
          </div>
        ) : null}

        {/* Lower-third chyron */}
        {current ? (
          <div className="absolute inset-x-0 bottom-0 animate-slide-in-left">
            <div className="bg-racing-red text-primary-foreground px-2 py-0.5 text-[9px] font-display font-bold tracking-[0.2em] inline-block">
              {current.lowerThird}
            </div>
            <div className="bg-background/90 backdrop-blur border-t-2 border-racing-red px-3 py-2">
              <div className="font-display font-bold text-sm leading-tight line-clamp-2">{current.headline}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                <Link to={`/racing/${current.pilot.slug}`} className="hover:text-racing-red">
                  #{current.pilot.number} {current.pilot.name} · {current.pilot.team}
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            <Loader2 className="w-3 h-3 animate-spin text-racing-amber" />
          </div>
        ) : null}
      </div>

      {/* Quote */}
      <div className="p-3 bg-background/40">
        <div className="text-[9px] tracking-[0.2em] font-display font-bold text-muted-foreground mb-1">QUOTE</div>
        <div className="text-xs italic leading-snug min-h-[40px]">
          {current ? `"${current.quote}"` : "Aguardando boletim..."}
        </div>
      </div>
    </div>
  );
}
