import { create } from "zustand";
import type { Boost, FeedItem, Pilot, RaceConditions, RaceEvent, WeatherKind } from "./types";
import { ALL_PILOTS } from "./pilots";

interface RaceState {
  pilots: Pilot[];
  conditions: RaceConditions;
  events: RaceEvent[];
  boosts: Boost[];
  feed: FeedItem[];
  tick: number;
  // mutators
  pushEvent: (e: RaceEvent) => void;
  pushFeed: (f: FeedItem) => void;
  pushBoost: (b: Boost) => void;
  setConditions: (c: Partial<RaceConditions>) => void;
  shufflePositions: () => void;
  decrementBoosts: () => void;
  incrementTick: () => void;
}

const FEED_TEMPLATES = [
  "Pushing hard in today's race! Feeling strong 💪",
  "Great overtake in turn 3! Who saw that? 🔥",
  "New fastest lap! Let's go! 🏁",
  "Big fight for P2! This race is insane!",
  "Pit stop done in 2.1s — flying laps incoming.",
  "Tires holding up better than expected.",
  "Nailed the apex on the final corner.",
  "Slipstream pass on the main straight 🚀",
  "Engine sounding sweet today.",
  "Sponsor boost paying off — moving up the grid.",
  "DRS open. Hunting P3.",
  "That was close! Side-by-side through the chicane.",
];

const SPONSORED_FEED = [
  { sponsor: "BMW PERFORMANCE", text: "Unleash the Ultimate Driving Machine.", cta: "LEARN MORE" },
  { sponsor: "RED BULL RACING", text: "It gives you wings on every lap.", cta: "DISCOVER" },
  { sponsor: "PORSCHE GT", text: "Engineered for the limit.", cta: "EXPLORE" },
  { sponsor: "SHELL V-POWER", text: "More power. More distance. Every lap.", cta: "FUEL UP" },
  { sponsor: "PIRELLI P-ZERO", text: "Grip that defines champions.", cta: "BUY NOW" },
];

export const useRaceStore = create<RaceState>((set) => ({
  pilots: ALL_PILOTS,
  conditions: {
    timeOfDay: "day",
    weather: "clear",
    temperatureC: 24,
    trackTempC: 38,
    trackCondition: "dry",
    intensity: 0.6,
    online: 100543,
  },
  events: [],
  boosts: [
    {
      id: "b_init",
      pilotId: "p_1",
      sponsor: "BMW PERFORMANCE",
      sponsorTagline: "Boost por",
      amount: 5000,
      duration: 60,
      remaining: 47,
      isSafetyCar: false,
    },
  ],
  feed: [],
  tick: 0,
  pushEvent: (e) =>
    set((s) => ({ events: [e, ...s.events].slice(0, 30) })),
  pushFeed: (f) =>
    set((s) => ({ feed: [f, ...s.feed].slice(0, 25) })),
  pushBoost: (b) =>
    set((s) => ({ boosts: [b, ...s.boosts].slice(0, 4) })),
  setConditions: (c) =>
    set((s) => ({ conditions: { ...s.conditions, ...c } })),
  shufflePositions: () =>
    set((s) => {
      // small swap among nearby positions for "live" effect
      const next = [...s.pilots];
      const i = 1 + Math.floor(Math.random() * (next.length - 2));
      const j = i + (Math.random() > 0.5 ? 1 : -1);
      if (j > 0 && j < next.length) {
        [next[i], next[j]] = [next[j], next[i]];
        next.forEach((p, idx) => (p.position = idx + 1));
      }
      return { pilots: next };
    }),
  decrementBoosts: () =>
    set((s) => {
      const updated = s.boosts
        .map((b) => ({ ...b, remaining: Math.max(0, b.remaining - 1) }))
        .filter((b) => b.remaining > 0);
      return { boosts: updated };
    }),
  incrementTick: () => set((s) => ({ tick: s.tick + 1 })),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Engine — single ticker that emits events, feed, weather changes, boosts
// ─────────────────────────────────────────────────────────────────────────────

let engineStarted = false;

const EVENT_KINDS: Array<{ kind: RaceEvent["kind"]; weight: number; msg: (name: string) => string; intensity: RaceEvent["intensity"] }> = [
  { kind: "overtake", weight: 28, msg: (n) => `${n} overtakes for position!`, intensity: "med" },
  { kind: "fastest_lap", weight: 12, msg: (n) => `${n} sets a new fastest lap! ⚡`, intensity: "high" },
  { kind: "boost", weight: 10, msg: (n) => `${n} activated NITRO BOOST 🚀`, intensity: "high" },
  { kind: "pit_stop", weight: 10, msg: (n) => `${n} enters pit lane.`, intensity: "low" },
  { kind: "low_fuel", weight: 8, msg: (n) => `${n} low fuel warning.`, intensity: "low" },
  { kind: "tire_wear", weight: 8, msg: (n) => `${n} tire wear critical.`, intensity: "low" },
  { kind: "crash", weight: 5, msg: (n) => `Incident! ${n} loses time in turn 3.`, intensity: "high" },
  { kind: "restart", weight: 4, msg: () => `Race restart — green flag!`, intensity: "high" },
];

function pickEvent() {
  const total = EVENT_KINDS.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of EVENT_KINDS) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return EVENT_KINDS[0];
}

function nextWeather(current: WeatherKind): WeatherKind {
  const transitions: Record<WeatherKind, WeatherKind[]> = {
    clear: ["clear", "clear", "cloudy", "cloudy"],
    cloudy: ["cloudy", "clear", "rain", "fog"],
    rain: ["rain", "cloudy", "rain"],
    fog: ["fog", "cloudy", "clear"],
    night: ["night", "night"],
  };
  const opts = transitions[current];
  return opts[Math.floor(Math.random() * opts.length)];
}

export function startEngine() {
  if (engineStarted) return;
  engineStarted = true;
  const store = useRaceStore.getState;

  // 1Hz tick — boosts countdown, position shuffle, feed/event production
  setInterval(() => {
    store().incrementTick();
    store().decrementBoosts();
    if (Math.random() < 0.35) store().shufflePositions();

    // Event every 1-3 seconds
    if (Math.random() < 0.55) {
      const e = pickEvent();
      const pilots = store().pilots;
      const p = pilots[Math.floor(Math.random() * Math.min(20, pilots.length))];
      store().pushEvent({
        id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        kind: e.kind,
        pilotId: p?.id,
        message: e.msg(p?.name ?? ""),
        at: Date.now(),
        intensity: e.intensity,
      });
    }

    // Feed every ~3s
    if (Math.random() < 0.3) {
      const pilots = store().pilots;
      const p = pilots[Math.floor(Math.random() * Math.min(30, pilots.length))];
      const isPaid = Math.random() < 0.18;
      if (isPaid) {
        const sp = SPONSORED_FEED[Math.floor(Math.random() * SPONSORED_FEED.length)];
        store().pushFeed({
          id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          pilotId: p.id,
          text: sp.text,
          likes: Math.floor(Math.random() * 800),
          comments: Math.floor(Math.random() * 80),
          ageSec: 0,
          kind: "paid",
          sponsor: sp.sponsor,
          cta: sp.cta,
        });
      } else {
        const text = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
        store().pushFeed({
          id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          pilotId: p.id,
          text,
          likes: Math.floor(Math.random() * 300),
          comments: Math.floor(Math.random() * 50),
          ageSec: 0,
          kind: "organic",
        });
      }
    }
  }, 1000);

  // Boost spawn every 18-30s
  setInterval(() => {
    const pilots = store().pilots;
    const p = pilots[Math.floor(Math.random() * Math.min(15, pilots.length))];
    const isSafety = Math.random() < 0.18;
    const sponsors = ["NIKE RACING", "BMW PERFORMANCE", "RED BULL", "MONSTER ENERGY", "PORSCHE", "SHELL V-POWER"];
    const sponsor = isSafety ? "PORSCHE SAFETY CAR" : sponsors[Math.floor(Math.random() * sponsors.length)];
    const duration = isSafety ? 60 : 30 + Math.floor(Math.random() * 90);
    const amount = isSafety ? 10000 : 1000 + Math.floor(Math.random() * 9000);
    store().pushBoost({
      id: `b_${Date.now()}`,
      pilotId: p.id,
      sponsor,
      amount,
      duration,
      remaining: duration,
      isSafetyCar: isSafety,
    });
  }, 22000);

  // Weather/time-of-day every 90s
  setInterval(() => {
    const c = store().conditions;
    const w = nextWeather(c.weather);
    const hours = new Date().getHours();
    let timeOfDay: RaceConditions["timeOfDay"] = "day";
    if (hours >= 5 && hours < 8) timeOfDay = "dawn";
    else if (hours >= 8 && hours < 17) timeOfDay = "day";
    else if (hours >= 17 && hours < 20) timeOfDay = "dusk";
    else timeOfDay = "night";

    const trackCondition: RaceConditions["trackCondition"] =
      w === "rain" ? "wet" : w === "fog" ? "damp" : "dry";
    const tempC = w === "rain" ? 14 : w === "fog" ? 12 : 18 + Math.floor(Math.random() * 14);
    store().setConditions({
      weather: w,
      timeOfDay,
      temperatureC: tempC,
      trackTempC: tempC + 12,
      trackCondition,
      online: 90000 + Math.floor(Math.random() * 25000),
    });
  }, 90000);
}
