import type { Pilot, CarColor } from "./types";

const COLORS: CarColor[] = ["red", "green", "orange", "blue", "black", "yellow", "purple"];

const FIRST = [
  "Marie", "Cryptox", "Speedking", "Alex99", "Fastlife", "Booster", "Racerbr", "Maxdrive",
  "Nitromax", "Ironwolf", "Veloce", "Speedx", "Streetking", "Drivefast", "Racerone", "Turbomax",
  "Fastlion", "Ghostrive", "Vortex", "Phantom", "Apex", "Drift", "Nova", "Blaze",
  "Zenith", "Kairo", "Solis", "Orion", "Helix", "Reaper", "Falcon", "Volt",
  "Comet", "Onyx", "Cobra", "Storm", "Talon", "Echo", "Rogue", "Sable",
  "Raze", "Vega", "Lyra", "Nyx", "Atlas", "Krypton", "Spectra", "Halo",
];

const TEAMS = [
  "TrustBank Racing", "Apex Motorsport", "Velocity GT", "Phantom Squad", "Nitro Dynamics",
  "Carbon Crew", "Vortex Racing", "Black Falcon", "Red Horizon", "North Pole",
];

const SPONSORS = [
  "TRUSTBANK", "RED BULL", "MONSTER", "SHELL", "PORSCHE", "BMW M", "PETRONAS", "MOBIL 1",
  "PIRELLI", "TAG HEUER", "IWC", "SANTANDER", "MCLAREN", "NIKE",
];

const FLAGS = ["🇧🇷", "🇺🇸", "🇩🇪", "🇮🇹", "🇫🇷", "🇬🇧", "🇪🇸", "🇯🇵", "🇨🇦", "🇲🇽", "🇦🇷", "🇳🇱"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function fmtLap(seed: number) {
  const r = rng(seed);
  const min = 2;
  const sec = 41 + Math.floor(r() * 4);
  const ms = Math.floor(r() * 1000);
  return `${min}:${String(sec).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

export function generatePilots(count = 100): Pilot[] {
  const r = rng(42);
  const pilots: Pilot[] = [];
  for (let i = 0; i < count; i++) {
    const name = FIRST[i % FIRST.length] + (i >= FIRST.length ? Math.floor(i / FIRST.length) : "");
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    pilots.push({
      id: `p_${i + 1}`,
      slug,
      name: name.toUpperCase(),
      number: i === 0 ? 7 : Math.floor(r() * 999) + 1,
      country: FLAGS[i % FLAGS.length],
      team: TEAMS[i % TEAMS.length],
      carColor: COLORS[i % COLORS.length],
      sponsor: SPONSORS[i % SPONSORS.length],
      bestLap: fmtLap(i + 1),
      position: i + 1,
      isAI: i !== 0,
      earnings: Math.floor(r() * 50000) + 1000,
      level: Math.floor(r() * 30) + 5,
    });
  }
  // ensure leader is Marie
  pilots[0].name = "MARIE";
  pilots[0].slug = "marie";
  pilots[0].number = 7;
  pilots[0].country = "🇧🇷";
  pilots[0].team = "TrustBank Racing";
  pilots[0].carColor = "red";
  pilots[0].sponsor = "TRUSTBANK";
  pilots[0].bestLap = "2:41.328";
  pilots[0].earnings = 25430;
  pilots[0].level = 24;
  pilots[0].isAI = false;
  return pilots;
}

export const ALL_PILOTS = generatePilots(120);
