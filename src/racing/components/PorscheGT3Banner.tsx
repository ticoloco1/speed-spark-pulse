import { useState } from "react";
import porscheGt3 from "@/assets/cars/porsche-gt3-side.png";

const COLORS = [
  { name: "Branco", hex: "#f4f4f5", hue: 0, sat: 0.2 },
  { name: "Vermelho", hex: "#dc2626", hue: 0, sat: 1.6 },
  { name: "Azul", hex: "#2563eb", hue: 220, sat: 1.4 },
  { name: "Verde", hex: "#16a34a", hue: 120, sat: 1.4 },
  { name: "Amarelo", hex: "#facc15", hue: 50, sat: 1.5 },
  { name: "Laranja", hex: "#ea580c", hue: 25, sat: 1.5 },
  { name: "Roxo", hex: "#7c3aed", hue: 270, sat: 1.4 },
  { name: "Preto", hex: "#0a0a0a", hue: 0, sat: 0.1 },
];

interface Props {
  pilotName: string;
  number: number | string;
  defaultSponsorDoor?: string;
  defaultSponsorHood?: string;
  defaultSponsorFront?: string;
}

/**
 * Editable Porsche GT3 banner used inside the profile.
 * - Background "drives" (parallax scroll of asphalt + rails)
 * - Color picker tints the car
 * - Three editable sponsor slots: door / hood / front bumper
 */
export const PorscheGT3Banner = ({
  pilotName,
  number,
  defaultSponsorDoor = "RED BULL",
  defaultSponsorHood = "MOBIL 1",
  defaultSponsorFront = "MICHELIN",
}: Props) => {
  const [color, setColor] = useState(COLORS[1]);
  const [doorSponsor, setDoorSponsor] = useState(defaultSponsorDoor);
  const [hoodSponsor, setHoodSponsor] = useState(defaultSponsorHood);
  const [frontSponsor, setFrontSponsor] = useState(defaultSponsorFront);
  const [editing, setEditing] = useState(false);

  const carFilter = `hue-rotate(${color.hue}deg) saturate(${color.sat}) brightness(${
    color.hex === "#0a0a0a" ? 0.4 : 0.95
  }) contrast(1.05) drop-shadow(0 18px 24px rgba(0,0,0,.55))`;

  return (
    <div className="relative h-64 md:h-72 overflow-hidden hud-border rounded-lg surface-1">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-racing-purple/30 via-background to-background" />

      {/* Animated guard-rails / track behind the car (forward-motion illusion) */}
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
      {/* Center dashed line */}
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
            style={{
              top: `${t}%`,
              left: 0,
              right: 0,
              animation: `speed-line-pass ${0.5 + i * 0.1}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* THE PORSCHE — large, vibrating slightly */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] w-[92%] max-w-[820px] car-chassis-vibrate-soft">
        <div className="relative">
          <img
            src={porscheGt3}
            alt={`Porsche GT3 #${number} ${pilotName}`}
            className="w-full h-auto select-none pointer-events-none"
            style={{ filter: carFilter }}
            draggable={false}
          />

          {/* HOOD SPONSOR (front-left, top of bonnet) */}
          <div
            className="absolute font-display font-black tracking-[0.18em] text-background bg-foreground/95 px-2 py-0.5 rounded-sm shadow"
            style={{
              left: "10%",
              top: "44%",
              fontSize: "clamp(9px, 1.1vw, 13px)",
              transform: "skewX(-8deg)",
            }}
          >
            {hoodSponsor}
          </div>

          {/* DOOR SPONSOR (mid car, big readable) */}
          <div
            className="absolute font-display font-black tracking-[0.2em] text-background bg-racing-amber px-3 py-1 rounded-sm shadow-lg ring-1 ring-foreground/20"
            style={{
              left: "44%",
              top: "48%",
              fontSize: "clamp(11px, 1.6vw, 18px)",
            }}
          >
            {doorSponsor}
          </div>

          {/* FRONT BUMPER SPONSOR */}
          <div
            className="absolute font-display font-bold tracking-widest text-foreground bg-background/85 border border-border px-1.5 py-0.5 rounded-sm"
            style={{
              left: "4%",
              top: "62%",
              fontSize: "clamp(8px, 0.9vw, 11px)",
            }}
          >
            {frontSponsor}
          </div>

          {/* Number on the door (small, doesn't compete with door sponsor) */}
          <div
            className="absolute font-display font-black text-foreground bg-background/95 rounded-full flex items-center justify-center ring-2 ring-racing-red"
            style={{
              left: "33%",
              top: "47%",
              width: "clamp(28px, 3.6vw, 44px)",
              height: "clamp(28px, 3.6vw, 44px)",
              fontSize: "clamp(13px, 1.8vw, 22px)",
            }}
          >
            {number}
          </div>
        </div>
      </div>

      {/* Top-right: pilot name plate */}
      <div className="absolute top-3 right-3 surface-2 hud-border rounded px-2 py-1">
        <div className="text-[9px] text-muted-foreground tracking-widest font-display">PORSCHE 911 GT3</div>
        <div className="text-[12px] font-display font-bold">{pilotName} · #{number}</div>
      </div>

      {/* Bottom-left: color picker */}
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

      {/* Bottom-right: edit sponsors */}
      <div className="absolute bottom-2 right-3 z-10">
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-[9px] font-display font-bold tracking-widest bg-racing-red text-primary-foreground px-2 py-1 rounded hover:opacity-90"
        >
          {editing ? "OK" : "EDITAR SPONSORS"}
        </button>
      </div>

      {/* Editor panel */}
      {editing && (
        <div className="absolute bottom-10 right-3 z-20 surface-1 hud-border rounded-md p-3 w-64 space-y-2 shadow-xl">
          <SponsorInput label="Capô" value={hoodSponsor} onChange={setHoodSponsor} />
          <SponsorInput label="Porta (destaque)" value={doorSponsor} onChange={setDoorSponsor} />
          <SponsorInput label="Frente" value={frontSponsor} onChange={setFrontSponsor} />
          <p className="text-[9px] text-muted-foreground">
            Use até 14 caracteres por slot. Slot da porta vai a leilão a cada 25s.
          </p>
        </div>
      )}
    </div>
  );
};

const SponsorInput = ({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="block">
    <span className="block text-[9px] tracking-widest font-display text-muted-foreground mb-1">
      {label.toUpperCase()}
    </span>
    <input
      value={value}
      maxLength={14}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      className="w-full bg-background border border-border rounded px-2 py-1 text-[11px] font-display font-bold tracking-widest focus:outline-none focus:border-racing-red"
    />
  </label>
);
