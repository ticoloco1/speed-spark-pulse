import { useState } from "react";
import { useRaceStore } from "@/racing/engine";
import { CarRenderer, type CarView } from "@/racing/components/CarRenderer";
import { getIdentityPack } from "@/racing/identity";

const VIEWS: CarView[] = ["hero", "side", "top", "ticker", "boost", "card"];

export default function RenderTest() {
  const pilots = useRaceStore((s) => s.pilots);
  const [slug, setSlug] = useState(pilots[0]?.slug ?? "");
  const [speed, setSpeed] = useState(0.7);
  const [braking, setBraking] = useState(false);
  const [boosting, setBoosting] = useState(false);

  const pilot = pilots.find((p) => p.slug === slug) ?? pilots[0];
  const pack = pilot ? getIdentityPack(pilot) : null;

  if (!pilot || !pack) {
    return <div className="p-6 text-foreground">No pilots loaded.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <header>
        <h1 className="font-display font-bold text-2xl tracking-tight">CAR RENDER TEST</h1>
        <p className="text-xs text-muted-foreground">
          Preview a single slug across every view from one Race Identity Pack.
        </p>
      </header>

      {/* Controls */}
      <section className="surface-1 hud-border rounded-md p-4 grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-display font-bold tracking-widest text-muted-foreground">PILOT / SLUG</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="surface-2 hud-border rounded px-2 py-2 text-sm font-mono text-foreground"
          >
            {pilots.slice(0, 40).map((p) => (
              <option key={p.id} value={p.slug}>
                #{p.number} · {p.name} · {p.slug}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-display font-bold tracking-widest text-muted-foreground">
            SPEED · {speed.toFixed(2)}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="accent-racing-red"
          />
        </label>

        <label className="flex items-center gap-2 surface-2 hud-border rounded px-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={braking}
            onChange={(e) => setBraking(e.target.checked)}
            className="accent-racing-red"
          />
          <span className="text-xs font-display font-bold tracking-widest">BRAKING</span>
        </label>

        <label className="flex items-center gap-2 surface-2 hud-border rounded px-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={boosting}
            onChange={(e) => setBoosting(e.target.checked)}
            className="accent-racing-amber"
          />
          <span className="text-xs font-display font-bold tracking-widest">BOOSTING</span>
        </label>
      </section>

      {/* Identity Pack inspector */}
      <section className="surface-1 hud-border rounded-md p-4">
        <div className="text-[10px] tracking-widest font-display font-bold text-muted-foreground mb-2">
          RACE IDENTITY PACK
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs font-mono">
          <Field label="slug" value={pack.slug} />
          <Field label="number" value={`#${pack.racingNumber}`} />
          <Field label="model" value={pack.baseCarModelId} />
          <Field label="livery" value={pack.liveryTemplateId} />
          <Field label="wheel" value={pack.wheelStyle} />
          <Field label="sponsors" value={pack.sponsorSlots.join(" · ")} />
          <div>
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">colors</div>
            <div className="flex gap-1 mt-1">
              <Swatch color={pack.primaryColor} label="P" />
              <Swatch color={pack.secondaryColor} label="S" />
              <Swatch color={pack.accentColor} label="A" />
            </div>
          </div>
        </div>
      </section>

      {/* All views grid */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {VIEWS.map((v) => (
          <div key={v} className="surface-1 hud-border rounded-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-widest font-display font-bold text-racing-red">
                VIEW · {v.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{frameSize(v)}</span>
            </div>
            <div className={frameClass(v)}>
              <CarRenderer
                pilot={pilot}
                view={v}
                speed={speed}
                braking={braking}
                boosting={boosting}
                className="w-full h-full"
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function frameClass(v: CarView) {
  const base = "relative bg-gradient-to-b from-black/60 to-black/20 rounded border border-border overflow-hidden flex items-center justify-center p-3";
  if (v === "top") return `${base} h-[360px]`;
  if (v === "hero") return `${base} h-[260px]`;
  if (v === "ticker") return `${base} h-[80px]`;
  if (v === "card") return `${base} h-[120px]`;
  if (v === "boost") return `${base} h-[160px]`;
  return `${base} h-[180px]`;
}

function frameSize(v: CarView) {
  switch (v) {
    case "hero": return "260h · big";
    case "top": return "360h · vertical";
    case "ticker": return "80h · scroll";
    case "card": return "120h · profile";
    case "boost": return "160h · auction";
    default: return "180h · standard";
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="text-foreground truncate">{value}</div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-7 h-7 rounded border border-border"
        style={{ backgroundColor: color }}
        title={color}
      />
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}
