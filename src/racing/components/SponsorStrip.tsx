const SPONSORS = [
  "RED BULL", "PORSCHE", "BMW M", "MONSTER", "NIKE", "PETRONAS", "MCLAREN", "SHELL", "SANTANDER", "IWC",
];

const ALL_SPONSORS = [
  "Mercedes-Benz", "Audi", "Coca-Cola", "Heineken", "TAG Heuer", "Pirelli", "Mobil 1", "GoPro", "Oakley", "acer", "BB", "PlayStation",
  "AMD", "Red Bull", "PETRONAS", "Santander", "IWC", "Shell", "McLaren", "Monster", "BMW", "INF", "Porsche",
];

export const SponsorStrip = ({ variant = "top" }: { variant?: "top" | "bottom" }) => {
  const list = variant === "top" ? SPONSORS : ALL_SPONSORS;
  return (
    <div className={`flex items-center gap-3 ${variant === "top" ? "py-2" : "py-2.5"}`}>
      <div className="text-[10px] tracking-[0.2em] font-display font-bold text-muted-foreground shrink-0 px-3">
        {variant === "top" ? "TOP SPONSORS" : "TODOS OS PATROCINADORES NA PISTA"}
      </div>
      <div className="flex-1 overflow-hidden mask-fade-x">
        <div className="flex items-center gap-3 animate-ticker-left-slow whitespace-nowrap">
          {[...list, ...list, ...list].map((s, i) => (
            <div
              key={`${s}-${i}`}
              className="shrink-0 surface-1 hud-border rounded px-4 py-2 text-xs font-display font-bold tracking-wide text-foreground/70 hover:text-foreground transition-colors"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
      {variant === "bottom" && (
        <button className="shrink-0 px-3 py-1.5 text-[10px] font-display font-bold tracking-widest border border-border rounded hover:bg-secondary transition-colors mr-3">
          VER TODOS
        </button>
      )}
    </div>
  );
};
