import { useEffect, useRef, useState } from "react";
import { Mic, Loader2, RefreshCw } from "lucide-react";
import { useRaceStore } from "@/racing/engine";

const REFRESH_MS = 25000;

/**
 * Live race commentary panel powered by Lovable AI streaming.
 * Renders token-by-token narration that refreshes periodically.
 */
export function CommentaryPanel() {
  const leader = useRaceStore((s) => s.pilots[0]);
  const events = useRaceStore((s) => s.events);
  const conditions = useRaceStore((s) => s.conditions);
  const tick = useRaceStore((s) => s.tick);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stream = async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setText("");
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/race-commentary`;
      const resp = await fetch(url, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          leader: leader ? { name: leader.name, number: leader.number, team: leader.team } : null,
          recentEvents: events.slice(0, 8).map((e) => ({ kind: e.kind, message: e.message })),
          weather: conditions.weather,
          trackCondition: conditions.trackCondition,
          online: conditions.online,
          lap: Math.max(1, Math.floor(tick / 30)),
        }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.text().catch(() => "");
        throw new Error(err || `status ${resp.status}`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buffer += decoder.decode(r.value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) setText((t) => t + delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setText((t) => t || "Locutor temporariamente fora do ar — voltamos em instantes.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    stream();
    const interval = setInterval(stream, REFRESH_MS);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-racing-red/20 border-2 border-racing-red flex items-center justify-center">
            <Mic className="w-4 h-4 text-racing-red" />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.2em] font-display font-bold text-racing-red flex items-center gap-1.5">
              <span className="live-dot" /> LOCUTOR · IA
            </div>
            <div className="text-sm font-display font-bold">Cabine de Transmissão</div>
          </div>
        </div>
        <button
          onClick={() => stream()}
          disabled={loading}
          className="px-2 py-1 surface-2 hud-border rounded text-[10px] font-display font-bold tracking-widest hover:bg-secondary disabled:opacity-50 inline-flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          NOVO BOLETIM
        </button>
      </div>

      <div className="flex-1 surface-2 hud-border rounded-md p-4 overflow-auto">
        <div className="text-[10px] tracking-[0.2em] font-display font-bold text-muted-foreground mb-2">AO VIVO · NARRAÇÃO</div>
        <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
          {text || (loading ? "Conectando ao locutor..." : "Aguardando próximo boletim...")}
          {loading ? <span className="inline-block w-2 h-4 bg-racing-red ml-0.5 align-middle animate-pulse" /> : null}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
        <div className="surface-2 hud-border rounded px-2 py-1">
          <div className="text-muted-foreground tracking-widest">LÍDER</div>
          <div className="font-display font-bold truncate">#{leader?.number} {leader?.name}</div>
        </div>
        <div className="surface-2 hud-border rounded px-2 py-1">
          <div className="text-muted-foreground tracking-widest">CLIMA</div>
          <div className="font-display font-bold uppercase">{conditions.weather}</div>
        </div>
        <div className="surface-2 hud-border rounded px-2 py-1">
          <div className="text-muted-foreground tracking-widest">VOLTA</div>
          <div className="font-display font-bold">{Math.max(1, Math.floor(tick / 30))}</div>
        </div>
      </div>
    </div>
  );
}
