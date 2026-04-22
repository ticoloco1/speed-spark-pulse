import { useMemo } from "react";
import type { Pilot } from "@/racing/types";
import { getIdentityPack, type RaceIdentityPack, type CarModelId, type LiveryId, type WheelStyle } from "@/racing/identity";
import { cn } from "@/lib/utils";

export type CarView = "side" | "hero" | "top" | "ticker" | "card" | "boost";

interface CarRendererProps {
  pilot?: Pilot;
  pack?: RaceIdentityPack;
  view?: CarView;
  speed?: number;          // 0..1 — drives wheel spin + motion blur intensity
  braking?: boolean;       // brake lights on
  boosting?: boolean;      // exhaust flash + nitro glow
  flip?: boolean;
  showSponsors?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Single source of truth for rendering a car.
 * Pure SVG, parametric: model + livery + colors + number + sponsors + wheels.
 * Same component renders hero / ticker / boost / card.
 */
export const CarRenderer = ({
  pilot,
  pack: packProp,
  view = "side",
  speed = 0.6,
  braking = false,
  boosting = false,
  flip = false,
  showSponsors = true,
  className,
  ariaLabel,
}: CarRendererProps) => {
  const pack = useMemo(() => {
    if (packProp) return packProp;
    if (pilot) return getIdentityPack(pilot);
    throw new Error("CarRenderer requires either pilot or pack");
  }, [pilot, packProp]);

  const isTop = view === "top";
  const wheelDuration = useMemo(() => {
    // faster spin at higher speed (min 0.18s, max 1.4s)
    const s = Math.max(0.05, Math.min(1, speed));
    return `${(1.4 - s * 1.22).toFixed(2)}s`;
  }, [speed]);

  // viewBox tuning per view
  const viewBox = isTop ? "0 0 240 320" : "0 0 360 140";

  return (
    <div
      className={cn("relative inline-block w-full", className)}
      aria-label={ariaLabel ?? `${pack.displayName} #${pack.racingNumber}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {/* Motion blur trail behind car */}
      {speed > 0.3 && !isTop && (
        <div
          className="absolute inset-y-0 right-[55%] pointer-events-none"
          style={{
            width: `${Math.min(80, 20 + speed * 70)}%`,
            background: `linear-gradient(90deg, transparent 0%, ${pack.primaryColor}33 40%, ${pack.primaryColor}66 80%, transparent 100%)`,
            filter: "blur(6px)",
            opacity: speed * 0.7,
          }}
        />
      )}

      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{
          filter: boosting
            ? `drop-shadow(0 0 18px ${pack.accentColor}cc) drop-shadow(0 6px 14px rgba(0,0,0,0.6))`
            : "drop-shadow(0 6px 14px rgba(0,0,0,0.55))",
        }}
      >
        <defs>
          {/* Body gradient: paint depth */}
          <linearGradient id={`body-${pack.slug}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(pack.primaryColor, 0.18)} />
            <stop offset="55%" stopColor={pack.primaryColor} />
            <stop offset="100%" stopColor={darken(pack.primaryColor, 0.3)} />
          </linearGradient>

          {/* Window gradient */}
          <linearGradient id={`glass-${pack.slug}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2030" />
            <stop offset="60%" stopColor="#0a0c12" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Tire */}
          <radialGradient id={`tire-${pack.slug}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="70%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Brake glow (active when braking) */}
          <radialGradient id={`brake-${pack.slug}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4400" stopOpacity="1" />
            <stop offset="60%" stopColor="#cc0000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#660000" stopOpacity="0" />
          </radialGradient>

          {/* Underbody shadow */}
          <radialGradient id={`shadow-${pack.slug}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Headlight */}
          <radialGradient id={`headlight-${pack.slug}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fff8b0" />
            <stop offset="100%" stopColor="#ffaa00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {isTop ? (
          <TopView pack={pack} wheelDuration={wheelDuration} braking={braking} boosting={boosting} showSponsors={showSponsors} />
        ) : (
          <SideView
            pack={pack}
            wheelDuration={wheelDuration}
            braking={braking}
            boosting={boosting}
            showSponsors={showSponsors}
            view={view}
          />
        )}
      </svg>

      {/* Speed lines overlay (foreground) */}
      {speed > 0.55 && !isTop && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, #ffffffaa, transparent)`,
              opacity: speed * 0.5,
              animation: "speed-line-pass 0.6s linear infinite",
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDE / HERO / TICKER / BOOST view — lateral 3/4
// ─────────────────────────────────────────────────────────────────────────────

interface ViewProps {
  pack: RaceIdentityPack;
  wheelDuration: string;
  braking: boolean;
  boosting: boolean;
  showSponsors: boolean;
  view?: CarView;
}

function SideView({ pack, wheelDuration, braking, boosting, showSponsors }: ViewProps) {
  const { primaryColor, secondaryColor, accentColor } = pack;

  return (
    <g>
      {/* Ground shadow */}
      <ellipse cx="180" cy="125" rx="150" ry="10" fill={`url(#shadow-${pack.slug})`} />

      {/* === Body silhouette varies by car model === */}
      <CarBody modelId={pack.baseCarModelId} pack={pack} />

      {/* === Livery overlay (paint pattern) === */}
      <Livery liveryId={pack.liveryTemplateId} pack={pack} />

      {/* Window/glass */}
      <CarGlass modelId={pack.baseCarModelId} pack={pack} />

      {/* Race number */}
      <NumberBadge pack={pack} />

      {/* Sponsors */}
      {showSponsors && <SponsorDecals pack={pack} />}

      {/* Headlight (front, right side of car) */}
      <circle cx="298" cy="78" r="6" fill={`url(#headlight-${pack.slug})`} />
      <circle cx="298" cy="78" r="2.5" fill="#ffffff" opacity={boosting ? 1 : 0.85} />

      {/* Brake light (rear, left side) — accent always, glow when braking */}
      <rect x="58" y="74" width="10" height="6" rx="1" fill={braking ? "#ff2200" : "#660000"} />
      {braking && <circle cx="63" cy="77" r="14" fill={`url(#brake-${pack.slug})`} opacity="0.9" />}

      {/* Exhaust flash on boost */}
      {boosting && (
        <g>
          <ellipse cx="48" cy="98" rx="22" ry="6" fill={accentColor} opacity="0.85">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.18s" repeatCount="indefinite" />
            <animate attributeName="rx" values="16;26;16" dur="0.18s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="44" cy="98" rx="14" ry="3.5" fill="#ffffff" opacity="0.95">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
        </g>
      )}

      {/* Wheels — front + rear with spinning rims */}
      <Wheel cx={92}  cy={108} r={22} style={pack.wheelStyle} duration={wheelDuration} pack={pack} />
      <Wheel cx={272} cy={108} r={22} style={pack.wheelStyle} duration={wheelDuration} pack={pack} />

      {/* Side skirt accent */}
      <rect x="60" y="118" width="240" height="3" fill={accentColor} opacity="0.7" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP view — bird's-eye (used in ticker/grid)
// ─────────────────────────────────────────────────────────────────────────────

function TopView({ pack, wheelDuration, braking, boosting, showSponsors }: ViewProps) {
  const { primaryColor, secondaryColor, accentColor } = pack;
  return (
    <g>
      {/* Shadow */}
      <ellipse cx="120" cy="305" rx="78" ry="8" fill={`url(#shadow-${pack.slug})`} />

      {/* Front + rear wheels (4 visible) */}
      <rect x="20" y="60"  width="22" height="44" rx="4" fill={`url(#tire-${pack.slug})`} />
      <rect x="198" y="60" width="22" height="44" rx="4" fill={`url(#tire-${pack.slug})`} />
      <rect x="20" y="216" width="22" height="44" rx="4" fill={`url(#tire-${pack.slug})`} />
      <rect x="198" y="216" width="22" height="44" rx="4" fill={`url(#tire-${pack.slug})`} />

      {/* Body */}
      <path
        d="M 60 30 Q 90 18 120 18 Q 150 18 180 30 L 188 80 L 195 160 L 188 240 L 180 290 Q 150 300 120 300 Q 90 300 60 290 L 52 240 L 45 160 L 52 80 Z"
        fill={`url(#body-${pack.slug})`}
        stroke={darken(primaryColor, 0.4)}
        strokeWidth="1"
      />

      {/* Top livery (stripe down center) */}
      {pack.liveryTemplateId === "racing_stripe" && (
        <>
          <rect x="108" y="20" width="10" height="280" fill={secondaryColor} />
          <rect x="124" y="20" width="10" height="280" fill={secondaryColor} />
        </>
      )}
      {pack.liveryTemplateId === "diagonal_split" && (
        <polygon points="60,30 180,30 188,80 60,290 52,240 52,80" fill={secondaryColor} opacity="0.9" />
      )}
      {pack.liveryTemplateId === "neon_edge" && (
        <path
          d="M 60 30 Q 90 18 120 18 Q 150 18 180 30 L 188 80 L 195 160 L 188 240 L 180 290 Q 150 300 120 300 Q 90 300 60 290 L 52 240 L 45 160 L 52 80 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="3"
        />
      )}
      {pack.liveryTemplateId === "checkered_flag" && (
        <g opacity="0.85">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={50 + (i % 4) * 8} y={250 + Math.floor(i / 4) * 8} width="8" height="8" fill={i % 2 === 0 ? secondaryColor : "#ffffff"} />
          ))}
        </g>
      )}

      {/* Cockpit/glass */}
      <ellipse cx="120" cy="160" rx="40" ry="55" fill={`url(#glass-${pack.slug})`} />

      {/* Number on roof */}
      <text
        x="120"
        y="170"
        textAnchor="middle"
        fontSize="44"
        fontWeight="900"
        fontFamily="'Rajdhani', sans-serif"
        fill="#ffffff"
        stroke={secondaryColor}
        strokeWidth="2"
      >
        {pack.racingNumber}
      </text>

      {/* Front lights */}
      <rect x="78" y="22" width="22" height="6" rx="2" fill="#ffeebb" opacity={boosting ? 1 : 0.7} />
      <rect x="140" y="22" width="22" height="6" rx="2" fill="#ffeebb" opacity={boosting ? 1 : 0.7} />

      {/* Rear lights */}
      <rect x="78" y="290" width="22" height="6" rx="2" fill={braking ? "#ff2200" : "#660000"} />
      <rect x="140" y="290" width="22" height="6" rx="2" fill={braking ? "#ff2200" : "#660000"} />

      {/* Sponsor on hood */}
      {showSponsors && pack.sponsorSlots[0] && (
        <text
          x="120"
          y="60"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fontFamily="'Rajdhani', sans-serif"
          fill="#ffffff"
          opacity="0.95"
          letterSpacing="1"
        >
          {pack.sponsorSlots[0]}
        </text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Body silhouettes per car model (side view)
// ─────────────────────────────────────────────────────────────────────────────

function CarBody({ modelId, pack }: { modelId: CarModelId; pack: RaceIdentityPack }) {
  const fill = `url(#body-${pack.slug})`;
  const stroke = darken(pack.primaryColor, 0.4);

  switch (modelId) {
    case "gt_03":
      // Wide GT3 stance
      return (
        <path
          d="M 50 100 L 60 80 Q 80 65 110 60 L 160 50 Q 200 48 240 55 L 280 65 Q 300 72 310 85 L 314 100 L 300 110 L 60 110 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1"
        />
      );
    case "hyper_x":
      // Long sleek hypercar
      return (
        <path
          d="M 40 105 L 55 85 Q 80 70 120 62 L 180 50 Q 230 48 280 58 L 310 75 Q 320 90 322 105 L 305 112 L 55 112 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1"
        />
      );
    case "open_w":
      // Open-wheel formula
      return (
        <g>
          <path
            d="M 60 100 L 70 88 Q 90 80 130 78 L 200 76 Q 240 78 270 84 L 295 95 L 295 105 L 70 105 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1"
          />
          {/* Front wing */}
          <rect x="295" y="100" width="22" height="4" fill={pack.secondaryColor} />
          {/* Rear wing */}
          <rect x="44" y="58" width="14" height="3" fill={pack.secondaryColor} />
          <rect x="48" y="58" width="3" height="32" fill={pack.secondaryColor} />
        </g>
      );
    case "muscle":
      // Boxier muscle car
      return (
        <path
          d="M 55 105 L 60 88 Q 80 78 110 75 L 160 72 Q 210 72 250 78 L 290 88 L 295 105 L 60 105 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1"
        />
      );
    case "ev_proto":
      // Smooth EV
      return (
        <path
          d="M 48 102 Q 55 78 100 65 Q 150 55 220 58 Q 280 63 308 80 Q 318 92 316 105 L 300 110 L 58 110 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1"
        />
      );
  }
}

function CarGlass({ modelId, pack }: { modelId: CarModelId; pack: RaceIdentityPack }) {
  const fill = `url(#glass-${pack.slug})`;
  switch (modelId) {
    case "gt_03":
      return <path d="M 130 65 L 175 55 Q 220 56 250 65 L 245 82 L 145 82 Z" fill={fill} />;
    case "hyper_x":
      return <path d="M 130 70 L 200 58 Q 250 60 280 70 L 275 88 L 145 88 Z" fill={fill} />;
    case "open_w":
      return <ellipse cx="180" cy="86" rx="22" ry="6" fill={fill} />;
    case "muscle":
      return <path d="M 130 78 L 170 73 Q 215 73 250 78 L 248 92 L 138 92 Z" fill={fill} />;
    case "ev_proto":
      return <path d="M 120 70 Q 180 60 240 65 Q 270 68 280 78 L 275 92 L 130 92 Z" fill={fill} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Livery overlays (paint design on top of body)
// ─────────────────────────────────────────────────────────────────────────────

function Livery({ liveryId, pack }: { liveryId: LiveryId; pack: RaceIdentityPack }) {
  switch (liveryId) {
    case "racing_stripe":
      return (
        <g opacity="0.95">
          <path d="M 60 95 L 305 95 L 305 100 L 60 100 Z" fill={pack.secondaryColor} />
          <path d="M 60 87 L 305 87 L 305 90 L 60 90 Z" fill={pack.accentColor} />
        </g>
      );
    case "diagonal_split":
      return (
        <polygon
          points="60,110 60,95 305,55 305,75 305,80 305,110"
          fill={pack.secondaryColor}
          opacity="0.92"
        />
      );
    case "neon_edge":
      return (
        <path
          d="M 50 100 L 60 80 Q 80 65 110 60 L 160 50 Q 200 48 240 55 L 280 65 Q 300 72 310 85 L 314 100"
          fill="none"
          stroke={pack.accentColor}
          strokeWidth="2.5"
        />
      );
    case "luxury_carbon":
      return (
        <g opacity="0.85">
          <pattern id={`carbon-${pack.slug}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill={darken(pack.primaryColor, 0.5)} />
            <rect width="3" height="3" fill={darken(pack.primaryColor, 0.65)} />
            <rect x="3" y="3" width="3" height="3" fill={darken(pack.primaryColor, 0.65)} />
          </pattern>
          <path
            d="M 60 95 L 305 80 L 305 100 L 60 110 Z"
            fill={`url(#carbon-${pack.slug})`}
          />
          <rect x="60" y="92" width="245" height="2" fill={pack.accentColor} />
        </g>
      );
    case "checkered_flag":
      return (
        <g opacity="0.92">
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={i}
              x={210 + (i % 7) * 14}
              y={75 + Math.floor(i / 7) * 12}
              width="14"
              height="12"
              fill={i % 2 === 0 ? pack.secondaryColor : "#ffffff"}
            />
          ))}
        </g>
      );
    case "block_shadow":
      return (
        <g>
          <path d="M 60 95 L 305 95 L 305 110 L 60 110 Z" fill={darken(pack.primaryColor, 0.45)} />
          <rect x="60" y="92" width="245" height="3" fill={pack.accentColor} />
        </g>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Wheels — spinning rims
// ─────────────────────────────────────────────────────────────────────────────

function Wheel({
  cx, cy, r, style, duration, pack,
}: { cx: number; cy: number; r: number; style: WheelStyle; duration: string; pack: RaceIdentityPack }) {
  return (
    <g>
      {/* Tire */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#tire-${pack.slug})`} />
      {/* Tire sidewall ring */}
      <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="#222" strokeWidth="0.5" />
      {/* Brake caliper hint */}
      <rect x={cx - 4} y={cy - r + 3} width="8" height="5" fill={pack.accentColor} opacity="0.85" rx="1" />

      {/* Rim — spins */}
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: `wheel-spin ${duration} linear infinite` }}>
        <circle cx={cx} cy={cy} r={r * 0.62} fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r * 0.18} fill="#0a0a0a" stroke={pack.accentColor} strokeWidth="0.8" />
        <RimSpokes cx={cx} cy={cy} r={r * 0.55} style={style} accent={pack.accentColor} />
      </g>
    </g>
  );
}

function RimSpokes({ cx, cy, r, style, accent }: { cx: number; cy: number; r: number; style: WheelStyle; accent: string }) {
  const count = style === "split-5" ? 5 : style === "multi-spoke" ? 10 : style === "y-spoke" ? 6 : 8;
  const isTurbofan = style === "turbofan";
  const spokes = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 360) / count;
    if (isTurbofan) {
      const x1 = cx + Math.cos((angle * Math.PI) / 180) * r * 0.3;
      const y1 = cy + Math.sin((angle * Math.PI) / 180) * r * 0.3;
      const x2 = cx + Math.cos(((angle + 25) * Math.PI) / 180) * r;
      const y2 = cy + Math.sin(((angle + 25) * Math.PI) / 180) * r;
      spokes.push(<path key={i} d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} stroke="#5a5a5a" strokeWidth="2.5" fill="none" />);
    } else {
      const x2 = cx + Math.cos((angle * Math.PI) / 180) * r;
      const y2 = cy + Math.sin((angle * Math.PI) / 180) * r;
      spokes.push(<line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#5a5a5a" strokeWidth="2" />);
    }
  }
  return <g>{spokes}</g>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Number + sponsor decals
// ─────────────────────────────────────────────────────────────────────────────

function NumberBadge({ pack }: { pack: RaceIdentityPack }) {
  return (
    <g>
      {/* Door circle background */}
      <circle cx="180" cy="92" r="16" fill="#ffffff" opacity="0.95" />
      <circle cx="180" cy="92" r="16" fill="none" stroke={pack.secondaryColor} strokeWidth="1.5" />
      <text
        x="180"
        y="98"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fontFamily="'Rajdhani', sans-serif"
        fill={pack.primaryColor}
      >
        {pack.racingNumber}
      </text>
    </g>
  );
}

function SponsorDecals({ pack }: { pack: RaceIdentityPack }) {
  const slots = pack.sponsorSlots.slice(0, 2);
  return (
    <g fontFamily="'Rajdhani', sans-serif" fontWeight="800">
      {/* Front fender */}
      {slots[0] && (
        <text x="252" y="92" textAnchor="middle" fontSize="8" fill="#ffffff" opacity="0.95" letterSpacing="0.5">
          {slots[0]}
        </text>
      )}
      {/* Rear quarter */}
      {slots[1] && (
        <text x="108" y="92" textAnchor="middle" fontSize="8" fill="#ffffff" opacity="0.95" letterSpacing="0.5">
          {slots[1]}
        </text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────────────────────────────────────

function lighten(hex: string, amt: number): string {
  return shift(hex, amt);
}
function darken(hex: string, amt: number): string {
  return shift(hex, -amt);
}
function shift(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return hex;
  const r = clamp(parseInt(c.slice(0, 2), 16) + Math.round(255 * amt));
  const g = clamp(parseInt(c.slice(2, 4), 16) + Math.round(255 * amt));
  const b = clamp(parseInt(c.slice(4, 6), 16) + Math.round(255 * amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
function clamp(v: number) { return Math.max(0, Math.min(255, v)); }
