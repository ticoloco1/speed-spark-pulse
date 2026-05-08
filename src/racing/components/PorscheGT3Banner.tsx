import { useEffect, useRef, useState } from "react";
import porscheGT3 from "@/assets/cars/porsche-gt3-side.png";
import { Upload, Clock, Calendar, CalendarDays, Move, Save, RotateCcw } from "lucide-react";

const COLORS = [
  { name: "Branco", hex: "#f4f4f5" },
  { name: "Vermelho", hex: "#dc2626" },
  { name: "Azul", hex: "#2563eb" },
  { name: "Verde", hex: "#16a34a" },
  { name: "Amarelo", hex: "#facc15" },
  { name: "Laranja", hex: "#ea580c" },
  { name: "Roxo", hex: "#7c3aed" },
  { name: "Rosa", hex: "#ec4899" },
  { name: "Ciano", hex: "#06b6d4" },
  { name: "Preto", hex: "#171717" },
];

type SponsorRate = "hour" | "day" | "month";
interface SponsorEntry {
  brand: string;
  rate: SponsorRate;
  paid: number;
  ts: number;
}

const RATE_PRICE: Record<SponsorRate, number> = { hour: 49, day: 499, month: 4999 };
const RATE_LABEL: Record<SponsorRate, string> = { hour: "/h", day: "/dia", month: "/mês" };

interface LogoConfig {
  xPct: number; // % of car width
  yPct: number; // % of car height
  widthPct: number; // % of car width
  opacity: number; // 0..1
}

const DEFAULT_LOGO: LogoConfig = { xPct: 44, yPct: 46, widthPct: 16, opacity: 1 };

interface Props {
  pilotName: string;
  number: number | string;
  defaultSponsorDoor?: string;
  defaultSponsorHood?: string;
  defaultSponsorFront?: string;
  storageKey?: string;
}

export const PorscheGT3Banner = ({
  pilotName,
  number,
  defaultSponsorDoor = "RED BULL",
  defaultSponsorHood = "MOBIL 1",
  defaultSponsorFront = "MICHELIN",
  storageKey = "racing-profile-banner",
}: Props) => {
  const [color, setColor] = useState(COLORS[0]);
  const [doorSponsor, setDoorSponsor] = useState(defaultSponsorDoor);
  const [hoodSponsor, setHoodSponsor] = useState(defaultSponsorHood);
  const [frontSponsor, setFrontSponsor] = useState(defaultSponsorFront);
  const [editingSponsors, setEditingSponsors] = useState(false);
  const [userLogo, setUserLogo] = useState<string | null>(null);
  const [logoCfg, setLogoCfg] = useState<LogoConfig>(DEFAULT_LOGO);
  const [logoEditMode, setLogoEditMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const carBoxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Load saved
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.color) setColor(s.color);
      if (s.doorSponsor) setDoorSponsor(s.doorSponsor);
      if (s.hoodSponsor) setHoodSponsor(s.hoodSponsor);
      if (s.frontSponsor) setFrontSponsor(s.frontSponsor);
      if (s.userLogo) setUserLogo(s.userLogo);
      if (s.logoCfg) setLogoCfg({ ...DEFAULT_LOGO, ...s.logoCfg });
    } catch {}
  }, [storageKey]);

  const save = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ color, doorSponsor, hoodSponsor, frontSponsor, userLogo, logoCfg })
    );
    setLogoEditMode(false);
  };

  const resetLogo = () => setLogoCfg(DEFAULT_LOGO);

  // Sponsor queue
  const [sponsors, setSponsors] = useState<SponsorEntry[]>([
    { brand: "TRUSTBANK", rate: "month", paid: 4999, ts: Date.now() - 5_000 },
    { brand: "VOLT ENERGY", rate: "day", paid: 499, ts: Date.now() - 12_000 },
    { brand: "NITRO+", rate: "hour", paid: 49, ts: Date.now() - 22_000 },
    { brand: "APEX TIRES", rate: "hour", paid: 49, ts: Date.now() - 30_000 },
  ]);
  const [bidBrand, setBidBrand] = useState("");
  const [bidRate, setBidRate] = useState<SponsorRate>("hour");

  useEffect(() => {
    const FAKE = ["AERO LAB", "TURBO MAX", "PIT ZERO", "GRID ONE", "RACE FUEL", "OCTANE 99"];
    const id = setInterval(() => {
      const rate: SponsorRate = (["hour", "day", "month"] as SponsorRate[])[Math.floor(Math.random() * 3)];
      setSponsors((s) => [
        { brand: FAKE[Math.floor(Math.random() * FAKE.length)], rate, paid: RATE_PRICE[rate], ts: Date.now() },
        ...s.slice(0, 5),
      ]);
    }, 14_000);
    return () => clearInterval(id);
  }, []);

  const submitBid = () => {
    const brand = bidBrand.trim().toUpperCase();
    if (!brand) return;
    setSponsors((s) => [{ brand, rate: bidRate, paid: RATE_PRICE[bidRate], ts: Date.now() }, ...s].slice(0, 8));
    setBidBrand("");
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setUserLogo(String(r.result));
      setLogoEditMode(true);
    };
    r.readAsDataURL(f);
  };

  // Drag logic
  const onLogoPointerDown = (e: React.PointerEvent) => {
    if (!logoEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: logoCfg.xPct,
      origY: logoCfg.yPct,
    };
  };
  const onLogoPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !carBoxRef.current) return;
    const rect = carBoxRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    setLogoCfg((c) => ({
      ...c,
      xPct: Math.max(0, Math.min(95, dragRef.current!.origX + dx)),
      yPct: Math.max(0, Math.min(95, dragRef.current!.origY + dy)),
    }));
  };
  const onLogoPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="space-y-2">
      <div className="relative h-72 md:h-80 overflow-hidden hud-border rounded-lg surface-1">
        <div className="absolute inset-0 bg-gradient-to-b from-racing-purple/30 via-background to-background" />

        {/* Track FX */}
        <div
          className="absolute inset-x-0 bottom-12 h-3 opacity-90"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, hsl(var(--racing-red)) 0 16px, hsl(var(--foreground)) 16px 32px)",
            animation: "track-scroll-x 0.6s linear infinite",
            backgroundSize: "200% 100%",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-12"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, hsl(var(--surface-2)) 0 60px, hsl(var(--surface-1)) 60px 120px)",
            animation: "track-scroll-x 0.4s linear infinite",
            backgroundSize: "200% 100%",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-5 h-0.5 opacity-80"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, hsl(var(--racing-amber)) 0 24px, transparent 24px 48px)",
            animation: "track-scroll-x 0.3s linear infinite",
            backgroundSize: "200% 100%",
          }}
        />

        {/* Speed lines */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {[20, 38, 55, 70, 82].map((t, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-foreground/60 to-transparent"
              style={{ top: `${t}%`, left: 0, right: 0, animation: `speed-line-pass ${0.5 + i * 0.1}s linear infinite` }}
            />
          ))}
        </div>

        {/* CAR — centered, full visible */}
        <div
          ref={carBoxRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] max-w-[860px] car-chassis-vibrate-soft"
        >
          <div className="relative">
            <img
              src={porscheGT3}
              alt={`GT3 #${number} ${pilotName}`}
              className="w-full h-auto select-none pointer-events-none block"
              style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,.55))" }}
              draggable={false}
            />
            {/* Color tint */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: color.hex,
                mixBlendMode: "multiply",
                WebkitMaskImage: `url(${porscheGT3})`,
                maskImage: `url(${porscheGT3})`,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                opacity: color.hex === "#f4f4f5" ? 0 : 0.85,
              }}
            />

            {/* HOOD */}
            <div
              className="absolute font-display font-black tracking-[0.18em] text-background bg-foreground/95 px-2 py-0.5 rounded-sm shadow"
              style={{ left: "14%", top: "54%", fontSize: "clamp(9px,1.1vw,13px)", transform: "skewX(-8deg)" }}
            >
              {hoodSponsor}
            </div>

            {/* DOOR LOGO / TEXT — positioned via logoCfg when image present */}
            {userLogo ? (
              <div
                onPointerDown={onLogoPointerDown}
                onPointerMove={onLogoPointerMove}
                onPointerUp={onLogoPointerUp}
                className={`absolute ${logoEditMode ? "cursor-move ring-2 ring-racing-amber" : ""}`}
                style={{
                  left: `${logoCfg.xPct}%`,
                  top: `${logoCfg.yPct}%`,
                  width: `${logoCfg.widthPct}%`,
                  opacity: logoCfg.opacity,
                  touchAction: "none",
                }}
              >
                <img
                  src={userLogo}
                  alt="Sua marca"
                  className="w-full h-auto block pointer-events-none"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.6))" }}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="absolute" style={{ left: "44%", top: "46%" }}>
                <div
                  className="font-display font-black tracking-[0.2em] text-background bg-racing-amber px-3 py-1 rounded-sm shadow-lg ring-1 ring-foreground/20"
                  style={{ fontSize: "clamp(11px,1.6vw,18px)" }}
                >
                  {doorSponsor}
                </div>
              </div>
            )}

            {/* REAR */}
            <div
              className="absolute font-display font-bold tracking-widest text-foreground bg-background/85 border border-border px-1.5 py-0.5 rounded-sm"
              style={{ right: "8%", top: "32%", fontSize: "clamp(8px,0.9vw,11px)" }}
            >
              {sponsors[0]?.brand ?? frontSponsor}
            </div>

            {/* Number */}
            <div
              className="absolute font-display font-black text-foreground bg-background/95 rounded-full flex items-center justify-center ring-2 ring-racing-red"
              style={{
                left: "33%",
                top: "46%",
                width: "clamp(28px,3.6vw,44px)",
                height: "clamp(28px,3.6vw,44px)",
                fontSize: "clamp(13px,1.8vw,22px)",
              }}
            >
              {number}
            </div>
          </div>
        </div>

        {/* Pilot plate */}
        <div className="absolute top-3 right-3 surface-2 hud-border rounded px-2 py-1">
          <div className="text-[9px] text-muted-foreground tracking-widest font-display">GT3 RACE</div>
          <div className="text-[12px] font-display font-bold">{pilotName} · #{number}</div>
        </div>

        {/* Color picker */}
        <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground tracking-widest font-display bg-background/70 px-1.5 py-0.5 rounded">
            COR
          </span>
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c)}
                title={c.name}
                className={`w-4 h-4 rounded-full border-2 transition-transform ${
                  color.name === c.name ? "border-foreground scale-125" : "border-background/60 hover:scale-110"
                }`}
                style={{ background: c.hex }}
                aria-label={`Pintar de ${c.name}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="absolute bottom-2 right-3 z-10 flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-[9px] font-display font-bold tracking-widest surface-2 hud-border px-2 py-1 rounded hover:bg-secondary"
          >
            <Upload className="w-3 h-3" />
            {userLogo ? "TROCAR LOGO" : "MINHA MARCA"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogo} />
          {userLogo && (
            <>
              <button
                onClick={() => setLogoEditMode((v) => !v)}
                className={`flex items-center gap-1 text-[9px] font-display font-bold tracking-widest px-2 py-1 rounded hover:opacity-90 ${
                  logoEditMode ? "bg-racing-amber text-background" : "surface-2 hud-border"
                }`}
              >
                <Move className="w-3 h-3" />
                {logoEditMode ? "EDITANDO" : "AJUSTAR LOGO"}
              </button>
              <button
                onClick={() => setUserLogo(null)}
                className="text-[9px] font-display font-bold tracking-widest surface-2 hud-border px-2 py-1 rounded hover:bg-secondary"
              >
                REMOVER
              </button>
            </>
          )}
          <button
            onClick={() => setEditingSponsors((v) => !v)}
            className="text-[9px] font-display font-bold tracking-widest bg-racing-red text-primary-foreground px-2 py-1 rounded hover:opacity-90"
          >
            {editingSponsors ? "OK" : "EDITAR SPONSORS"}
          </button>
          <button
            onClick={save}
            className="flex items-center gap-1 text-[9px] font-display font-bold tracking-widest bg-racing-amber text-background px-2 py-1 rounded hover:opacity-90"
          >
            <Save className="w-3 h-3" /> SALVAR
          </button>
        </div>

        {/* Logo editor panel */}
        {logoEditMode && userLogo && (
          <div className="absolute top-12 right-3 z-20 surface-1 hud-border rounded-md p-3 w-64 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-display font-bold tracking-widest">AJUSTAR LOGO</span>
              <button onClick={resetLogo} title="Resetar" className="text-muted-foreground hover:text-foreground">
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground">Arraste o logo na porta do carro para reposicionar.</p>
            <RangeRow
              label={`TAMANHO ${logoCfg.widthPct.toFixed(0)}%`}
              min={4}
              max={50}
              step={1}
              value={logoCfg.widthPct}
              onChange={(v) => setLogoCfg((c) => ({ ...c, widthPct: v }))}
            />
            <RangeRow
              label={`OPACIDADE ${(logoCfg.opacity * 100).toFixed(0)}%`}
              min={0.1}
              max={1}
              step={0.05}
              value={logoCfg.opacity}
              onChange={(v) => setLogoCfg((c) => ({ ...c, opacity: v }))}
            />
            <RangeRow
              label={`X ${logoCfg.xPct.toFixed(0)}%`}
              min={0}
              max={95}
              step={0.5}
              value={logoCfg.xPct}
              onChange={(v) => setLogoCfg((c) => ({ ...c, xPct: v }))}
            />
            <RangeRow
              label={`Y ${logoCfg.yPct.toFixed(0)}%`}
              min={0}
              max={95}
              step={0.5}
              value={logoCfg.yPct}
              onChange={(v) => setLogoCfg((c) => ({ ...c, yPct: v }))}
            />
            <button
              onClick={save}
              className="w-full flex items-center justify-center gap-1 text-[10px] font-display font-bold tracking-widest bg-racing-amber text-background px-2 py-1.5 rounded hover:opacity-90"
            >
              <Save className="w-3 h-3" /> SALVAR POSIÇÃO
            </button>
          </div>
        )}

        {/* Sponsor editor */}
        {editingSponsors && (
          <div className="absolute bottom-10 right-3 z-20 surface-1 hud-border rounded-md p-3 w-64 space-y-2 shadow-xl">
            <SponsorInput label="Capô" value={hoodSponsor} onChange={setHoodSponsor} />
            <SponsorInput label="Porta (texto)" value={doorSponsor} onChange={setDoorSponsor} />
            <SponsorInput label="Asa traseira" value={frontSponsor} onChange={setFrontSponsor} />
            <p className="text-[9px] text-muted-foreground">Até 14 caracteres. Se enviar uma logo, ela substitui o texto da porta.</p>
          </div>
        )}
      </div>

      {/* SPONSORS PAID */}
      <div className="surface-1 hud-border rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-[10px] font-display font-bold tracking-[0.2em]">SPONSORS PAGOS</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground tracking-widest font-display">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ${RATE_PRICE.hour}/h</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> ${RATE_PRICE.day}/dia</span>
            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> ${RATE_PRICE.month}/mês</span>
          </div>
        </div>

        <div className="overflow-hidden mb-3">
          <div className="flex gap-2 animate-[ticker-scroll-left_30s_linear_infinite] whitespace-nowrap">
            {[...sponsors, ...sponsors].map((s, i) => (
              <div key={i} className="surface-2 hud-border rounded px-2 py-1 flex items-center gap-2 shrink-0">
                <span className="font-display font-bold text-[11px]">{s.brand}</span>
                <span className="text-[9px] text-racing-amber font-display tracking-widest">
                  ${s.paid}{RATE_LABEL[s.rate]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={bidBrand}
            onChange={(e) => setBidBrand(e.target.value)}
            placeholder="SUA MARCA"
            maxLength={14}
            className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-[11px] font-display font-bold tracking-widest focus:outline-none focus:border-racing-red"
          />
          <select
            value={bidRate}
            onChange={(e) => setBidRate(e.target.value as SponsorRate)}
            className="bg-background border border-border rounded px-2 py-1.5 text-[10px] font-display font-bold tracking-widest"
          >
            <option value="hour">1 HORA · ${RATE_PRICE.hour}</option>
            <option value="day">1 DIA · ${RATE_PRICE.day}</option>
            <option value="month">1 MÊS · ${RATE_PRICE.month}</option>
          </select>
          <button
            onClick={submitBid}
            className="bg-racing-amber text-background text-[10px] font-display font-bold tracking-widest px-3 py-1.5 rounded hover:opacity-90"
          >
            COMPRAR SLOT
          </button>
        </div>
      </div>
    </div>
  );
};

const RangeRow = ({
  label, min, max, step, value, onChange,
}: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) => (
  <label className="block">
    <span className="block text-[9px] tracking-widest font-display text-muted-foreground mb-1">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-racing-amber"
    />
  </label>
);

const SponsorInput = ({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="block">
    <span className="block text-[9px] tracking-widest font-display text-muted-foreground mb-1">{label.toUpperCase()}</span>
    <input
      value={value}
      maxLength={14}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      className="w-full bg-background border border-border rounded px-2 py-1 text-[11px] font-display font-bold tracking-widest focus:outline-none focus:border-racing-red"
    />
  </label>
);
