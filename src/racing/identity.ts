// ─────────────────────────────────────────────────────────────────────────────
// TrustBank Racing — Race Identity Pack
// One source of truth per slug. All views derive from this.
// ─────────────────────────────────────────────────────────────────────────────

import type { Pilot } from "./types";

export type CarModelId =
  | "gt_03"   // GT3 silhouette — wide, low, aggressive
  | "hyper_x" // hypercar — sleek, long nose
  | "open_w"  // open-wheel formula style
  | "muscle"  // muscle / stock car
  | "ev_proto"; // electric prototype, smooth

export type LiveryId =
  | "racing_stripe"   // dual stripe down center
  | "diagonal_split"  // diagonal two-tone
  | "neon_edge"       // neon outline
  | "luxury_carbon"   // dark carbon + accent
  | "checkered_flag"  // checker side panels
  | "block_shadow";   // bold block color with shadow band

export type WheelStyle = "split-5" | "multi-spoke" | "turbofan" | "y-spoke";

export interface CarModel {
  id: CarModelId;
  name: string;
  category: "gt" | "hyper" | "formula" | "muscle" | "ev";
  // Silhouette ratio guidance (width:height) for different views
  aspect: { side: number; hero: number; top: number };
}

export interface LiveryTemplate {
  id: LiveryId;
  name: string;
  supportsNumber: boolean;
  supportsSponsors: boolean;
}

export const CAR_MODELS: CarModel[] = [
  { id: "gt_03",    name: "GT3 Apex",       category: "gt",      aspect: { side: 2.6, hero: 2.0, top: 1.2 } },
  { id: "hyper_x",  name: "Hyper X",        category: "hyper",   aspect: { side: 2.8, hero: 2.1, top: 1.3 } },
  { id: "open_w",   name: "Open Wheel F",   category: "formula", aspect: { side: 3.0, hero: 2.3, top: 1.4 } },
  { id: "muscle",   name: "Muscle V8",      category: "muscle",  aspect: { side: 2.5, hero: 1.95, top: 1.15 } },
  { id: "ev_proto", name: "EV Prototype",   category: "ev",      aspect: { side: 2.7, hero: 2.05, top: 1.25 } },
];

export const LIVERIES: LiveryTemplate[] = [
  { id: "racing_stripe",  name: "Racing Stripe",  supportsNumber: true, supportsSponsors: true },
  { id: "diagonal_split", name: "Diagonal Split", supportsNumber: true, supportsSponsors: true },
  { id: "neon_edge",      name: "Neon Edge",      supportsNumber: true, supportsSponsors: true },
  { id: "luxury_carbon",  name: "Luxury Carbon",  supportsNumber: true, supportsSponsors: true },
  { id: "checkered_flag", name: "Checkered Flag", supportsNumber: true, supportsSponsors: true },
  { id: "block_shadow",   name: "Block Shadow",   supportsNumber: true, supportsSponsors: true },
];

export interface RaceIdentityPack {
  slug: string;
  displayName: string;
  racingNumber: number;
  baseCarModelId: CarModelId;
  liveryTemplateId: LiveryId;
  primaryColor: string;   // hex / hsl
  secondaryColor: string;
  accentColor: string;
  wheelStyle: WheelStyle;
  sponsorSlots: string[]; // sponsor short names
}

// Curated palette (Forza-style)
const PALETTES: Array<{ p: string; s: string; a: string }> = [
  { p: "#e10600", s: "#0a0a0a", a: "#ffd400" }, // Ferrari red
  { p: "#0090ff", s: "#0a0a0a", a: "#ff5e00" }, // McLaren orange-blue
  { p: "#00d2be", s: "#0a0a0a", a: "#ffffff" }, // Petronas cyan
  { p: "#dc0000", s: "#3671c6", a: "#ffd400" }, // Red Bull
  { p: "#005793", s: "#e8002d", a: "#ffffff" }, // BMW
  { p: "#27f4d2", s: "#0a0a0a", a: "#e10600" }, // Mercedes EQ
  { p: "#ff8000", s: "#1a1a1a", a: "#ffffff" }, // McLaren classic
  { p: "#8b00ff", s: "#0a0a0a", a: "#00ffff" }, // Phantom purple
  { p: "#00ff88", s: "#0a0a0a", a: "#ffd400" }, // Aston neon
  { p: "#1a1a1a", s: "#e10600", a: "#ffd400" }, // Stealth
  { p: "#ffd400", s: "#0a0a0a", a: "#e10600" }, // Renault yellow
  { p: "#ff006e", s: "#0a0a0a", a: "#00ffff" }, // Hyper pink
  { p: "#3671c6", s: "#ffffff", a: "#dc0000" }, // Williams blue
];

const MODELS: CarModelId[] = ["gt_03", "hyper_x", "open_w", "muscle", "ev_proto"];
const LIVERY_IDS: LiveryId[] = ["racing_stripe", "diagonal_split", "neon_edge", "luxury_carbon", "checkered_flag", "block_shadow"];
const WHEELS: WheelStyle[] = ["split-5", "multi-spoke", "turbofan", "y-spoke"];

function hashSlug(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

const SPONSOR_POOL = [
  "TRUSTBANK", "BMW M", "PORSCHE", "SHELL", "RED BULL", "MONSTER",
  "PIRELLI", "PETRONAS", "MOBIL 1", "TAG HEUER", "NIKE", "SANTANDER",
];

const PACK_CACHE = new Map<string, RaceIdentityPack>();

/**
 * Derive a deterministic Race Identity Pack from a Pilot.
 * This is the SINGLE source of truth — all views (hero, ticker, boost, card)
 * must read from this.
 */
export function getIdentityPack(pilot: Pilot): RaceIdentityPack {
  const cached = PACK_CACHE.get(pilot.id);
  if (cached) return cached;

  const h = hashSlug(pilot.slug + pilot.id);
  const palette = PALETTES[h % PALETTES.length];
  const model = MODELS[(h >> 3) % MODELS.length];
  const livery = LIVERY_IDS[(h >> 6) % LIVERY_IDS.length];
  const wheel = WHEELS[(h >> 9) % WHEELS.length];

  // 2-3 sponsors deterministic
  const slotCount = 2 + ((h >> 12) % 2);
  const sponsors: string[] = [];
  for (let i = 0; i < slotCount; i++) {
    sponsors.push(SPONSOR_POOL[(h + i * 7) % SPONSOR_POOL.length]);
  }
  // Always lead with pilot's main sponsor
  if (pilot.sponsor && !sponsors.includes(pilot.sponsor)) {
    sponsors.unshift(pilot.sponsor);
  }

  const pack: RaceIdentityPack = {
    slug: pilot.slug,
    displayName: pilot.name,
    racingNumber: pilot.number,
    baseCarModelId: model,
    liveryTemplateId: livery,
    primaryColor: palette.p,
    secondaryColor: palette.s,
    accentColor: palette.a,
    wheelStyle: wheel,
    sponsorSlots: sponsors.slice(0, 3),
  };
  PACK_CACHE.set(pilot.id, pack);
  return pack;
}

export function getModel(id: CarModelId): CarModel {
  return CAR_MODELS.find((m) => m.id === id) ?? CAR_MODELS[0];
}
