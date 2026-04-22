import { useState } from "react";

const ITEMS = [
  { name: "TURBO TITANIUM X", level: 3, price: 12500 },
  { name: "PNEU ULTRA GRIP", level: 2, price: 3200 },
  { name: "RODA FORGED V2", level: 2, price: 4800 },
  { name: "FREIO CARBON", level: 3, price: 5600 },
  { name: "AEROFÓLIO GT", level: 2, price: 2750 },
];

const TABS = ["DESTAQUES", "MOTOR", "TURBO", "PNEUS"];

export const GaragePanel = () => {
  const [tab, setTab] = useState("DESTAQUES");
  return (
    <div className="surface-1 hud-border rounded-md overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-background/40 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] font-display font-bold">GARAGEM — McLAREN 720S GT3</span>
        <button className="text-[10px] font-display font-bold tracking-widest text-racing-red hover:underline">VER CARRO</button>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 text-xs">
        <Spec label="POTÊNCIA" value="820 HP" />
        <Spec label="TORQUE" value="79.5 kgfm" />
        <Spec label="PESO" value="1,285 kg" />
        <Spec label="0-100 km/h" value="2.7s" />
        <Spec label="CLASSE" value="GT PRO" />
      </div>

      <div className="px-3 flex gap-1 overflow-x-auto scrollbar-hide border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[10px] tracking-widest font-display font-bold whitespace-nowrap border-b-2 ${
              tab === t ? "border-racing-red text-racing-red" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border/50">
        {ITEMS.map((it) => (
          <div key={it.name} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors">
            <div className="w-8 h-8 rounded surface-3 border border-border" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-display font-bold truncate">{it.name}</div>
              <div className="text-[10px] text-muted-foreground">NÍVEL {it.level}</div>
            </div>
            <div className="text-racing-green font-mono text-sm font-bold tabular-nums">${it.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Spec = ({ label, value }: { label: string; value: string }) => (
  <div className="surface-2 hud-border rounded p-2">
    <div className="text-[10px] text-muted-foreground tracking-widest font-display">{label}</div>
    <div className="font-display font-bold text-sm">{value}</div>
  </div>
);
