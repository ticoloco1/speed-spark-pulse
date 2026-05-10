import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RacingHeader } from "@/racing/components/RacingHeader";
import { SEO } from "@/components/SEO";
import { toast } from "@/hooks/use-toast";
import { Gavel, Trophy, Zap, TrendingUp, Loader2 } from "lucide-react";

type Slot = {
  id: string;
  kind: string;
  scope: string;
  label: string;
  description: string | null;
  min_rate_per_second: number;
};

type Bid = {
  id: string;
  slot_id: string;
  bidder_id: string;
  sponsor_name: string;
  sponsor_color: string | null;
  rate_per_second: number;
  duration_seconds: number;
  total_amount: number;
  status: string;
  message: string | null;
  created_at: string;
};

export default function Marketplace() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s, b] = await Promise.all([
        supabase.from("sponsor_slots").select("*").eq("is_active", true).order("min_rate_per_second", { ascending: false }),
        supabase.from("sponsor_bids").select("*").order("rate_per_second", { ascending: false }).limit(200),
      ]);
      if (!mounted) return;
      setSlots((s.data ?? []) as Slot[]);
      setBids((b.data ?? []) as Bid[]);
      if (s.data?.[0]) setSelected(s.data[0] as Slot);
      setLoading(false);
    })();

    const ch = supabase
      .channel("marketplace-bids")
      .on("postgres_changes", { event: "*", schema: "public", table: "sponsor_bids" }, (payload) => {
        setBids((prev) => {
          if (payload.eventType === "DELETE") return prev.filter((x) => x.id !== (payload.old as Bid).id);
          const row = payload.new as Bid;
          const next = prev.filter((x) => x.id !== row.id);
          return [row, ...next].sort((a, b) => b.rate_per_second - a.rate_per_second).slice(0, 200);
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  const bidsBySlot = useMemo(() => {
    const map: Record<string, Bid[]> = {};
    for (const b of bids) (map[b.slot_id] ??= []).push(b);
    return map;
  }, [bids]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO title="Sponsor Marketplace · Hashpo" description="Leilão de boosts e espaços patrocinados. Quem paga mais por segundo aparece primeiro." />
      <RacingHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full p-3 space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl tracking-tight flex items-center gap-2">
              <Gavel className="w-6 h-6 text-racing-amber" />
              SPONSOR MARKETPLACE
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leilão ao vivo · prioridade calculada por <span className="text-racing-amber font-mono">$/segundo</span>
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-display tracking-widest">
            <span className="live-dot" /> AO VIVO
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-12 gap-3">
            {/* Slots list */}
            <aside className="col-span-12 md:col-span-4 space-y-2">
              <div className="text-[10px] tracking-widest font-display font-bold text-muted-foreground px-1">ESPAÇOS DISPONÍVEIS</div>
              {slots.map((s) => {
                const top = bidsBySlot[s.id]?.[0];
                const isSel = selected?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`w-full text-left surface-1 hud-border rounded-md p-3 transition hover:border-racing-amber ${isSel ? "border-racing-amber" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display font-bold text-sm">{s.label}</div>
                        <div className="text-[11px] text-muted-foreground">{s.description}</div>
                      </div>
                      <span className="text-[9px] font-display tracking-widest px-1.5 py-0.5 rounded bg-racing-amber/10 text-racing-amber">{s.kind.toUpperCase()}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">min ${Number(s.min_rate_per_second).toFixed(2)}/s</span>
                      {top ? (
                        <span className="font-mono text-racing-green flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> ${Number(top.rate_per_second).toFixed(2)}/s
                        </span>
                      ) : (
                        <span className="text-muted-foreground">sem lances</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Detail + bid */}
            <section className="col-span-12 md:col-span-8 space-y-3">
              {selected && (
                <>
                  <SlotHeader slot={selected} top={bidsBySlot[selected.id]?.[0]} />
                  <BidComposer slot={selected} userId={user?.id ?? null} currentTop={bidsBySlot[selected.id]?.[0]?.rate_per_second ?? 0} />
                  <BidLeaderboard bids={bidsBySlot[selected.id] ?? []} />
                </>
              )}
              <LiveBidFeed bids={bids.slice(0, 30)} slots={slots} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function SlotHeader({ slot, top }: { slot: Slot; top?: Bid }) {
  return (
    <div className="surface-1 hud-border rounded-md p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] tracking-widest font-display text-racing-amber">SELECIONADO</div>
          <h2 className="font-display font-bold text-xl">{slot.label}</h2>
          <p className="text-xs text-muted-foreground">{slot.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Stat label="MIN $/s" value={`$${Number(slot.min_rate_per_second).toFixed(2)}`} />
          <Stat label="LÍDER $/s" value={top ? `$${Number(top.rate_per_second).toFixed(2)}` : "—"} highlight />
          <Stat label="LÍDER" value={top?.sponsor_name ?? "—"} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="surface-2 rounded px-3 py-2 min-w-[90px]">
      <div className="text-[9px] tracking-widest text-muted-foreground font-display">{label}</div>
      <div className={`font-mono font-bold text-sm ${highlight ? "text-racing-green" : ""}`}>{value}</div>
    </div>
  );
}

function BidComposer({ slot, userId, currentTop }: { slot: Slot; userId: string | null; currentTop: number }) {
  const minBid = Math.max(Number(slot.min_rate_per_second), currentTop + 0.01);
  const [rate, setRate] = useState<number>(Number(minBid.toFixed(2)));
  const [duration, setDuration] = useState(60);
  const [sponsorName, setSponsorName] = useState("");
  const [color, setColor] = useState("#ff2d2d");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setRate(Number(minBid.toFixed(2))); }, [slot.id, minBid]);

  const submit = async () => {
    if (!userId) {
      toast({ title: "Login necessário", description: "Entre para dar lance no leilão." });
      return;
    }
    if (!sponsorName.trim()) {
      toast({ title: "Nome do sponsor", description: "Informe o nome do anunciante." });
      return;
    }
    if (rate < minBid) {
      toast({ title: "Lance baixo", description: `Mínimo $${minBid.toFixed(2)}/s` });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("sponsor_bids").insert({
      slot_id: slot.id,
      bidder_id: userId,
      sponsor_name: sponsorName.trim(),
      sponsor_color: color,
      rate_per_second: rate,
      duration_seconds: duration,
      status: "queued",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Lance enviado", description: `${sponsorName} · $${rate.toFixed(2)}/s × ${duration}s` });
    setSponsorName("");
  };

  const total = (rate * duration).toFixed(2);

  return (
    <div className="surface-1 hud-border rounded-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-racing-amber" />
        <div className="font-display font-bold text-sm tracking-widest">DAR LANCE</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="SPONSOR">
          <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="ACME RACING" className="w-full bg-transparent text-sm font-mono outline-none" />
        </Field>
        <Field label="$/SEGUNDO">
          <input type="number" step="0.01" min={minBid} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full bg-transparent text-sm font-mono outline-none" />
        </Field>
        <Field label="DURAÇÃO (s)">
          <input type="number" step="10" min={10} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-transparent text-sm font-mono outline-none" />
        </Field>
        <Field label="COR">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-transparent h-6 cursor-pointer" />
        </Field>
      </div>
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <div className="text-[11px] text-muted-foreground">
          mínimo <span className="text-racing-amber font-mono">${minBid.toFixed(2)}/s</span> · total <span className="text-racing-green font-mono">${total}</span>
        </div>
        <button
          onClick={submit}
          disabled={submitting}
          className="px-4 py-2 rounded bg-racing-amber text-background text-[11px] font-display font-bold tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gavel className="w-3 h-3" />}
          ENVIAR LANCE
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="surface-2 rounded px-2 py-1.5 block">
      <div className="text-[9px] tracking-widest text-muted-foreground font-display">{label}</div>
      {children}
    </label>
  );
}

function BidLeaderboard({ bids }: { bids: Bid[] }) {
  return (
    <div className="surface-1 hud-border rounded-md p-3">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-racing-amber" />
        <div className="font-display font-bold text-sm tracking-widest">FILA DE PRIORIDADE</div>
        <span className="text-[10px] text-muted-foreground">(maior $/s aparece primeiro)</span>
      </div>
      {bids.length === 0 ? (
        <div className="text-xs text-muted-foreground py-6 text-center">Sem lances ainda — seja o primeiro.</div>
      ) : (
        <div className="space-y-1">
          {bids.slice(0, 10).map((b, i) => (
            <div key={b.id} className="flex items-center justify-between gap-2 surface-2 rounded px-2 py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-display font-bold w-6 ${i === 0 ? "text-racing-green" : "text-muted-foreground"}`}>#{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: b.sponsor_color ?? "#888" }} />
                <span className="text-xs font-mono truncate">{b.sponsor_name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                <span className="text-racing-amber">${Number(b.rate_per_second).toFixed(2)}/s</span>
                <span className="text-muted-foreground">{b.duration_seconds}s</span>
                <span className="text-racing-green">${Number(b.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LiveBidFeed({ bids, slots }: { bids: Bid[]; slots: Slot[] }) {
  const slotMap = useMemo(() => Object.fromEntries(slots.map((s) => [s.id, s])), [slots]);
  return (
    <div className="surface-1 hud-border rounded-md p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="live-dot" />
        <div className="font-display font-bold text-sm tracking-widest">FEED DE LANCES AO VIVO</div>
      </div>
      <div className="space-y-1 max-h-[320px] overflow-auto">
        {bids.map((b) => {
          const s = slotMap[b.slot_id];
          return (
            <div key={b.id} className="flex items-center justify-between gap-2 text-[11px] py-1 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.sponsor_color ?? "#888" }} />
                <span className="font-mono truncate">{b.sponsor_name}</span>
                <span className="text-muted-foreground truncate">→ {s?.label ?? b.slot_id.slice(0, 8)}</span>
              </div>
              <span className="text-racing-amber font-mono shrink-0">${Number(b.rate_per_second).toFixed(2)}/s</span>
            </div>
          );
        })}
        {bids.length === 0 && <div className="text-xs text-muted-foreground py-6 text-center">Aguardando lances…</div>}
      </div>
    </div>
  );
}
