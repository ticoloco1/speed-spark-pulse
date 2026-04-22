// TrustBank Racing — core types

export type CarColor = "red" | "green" | "orange" | "blue" | "black" | "yellow" | "purple";

export interface Pilot {
  id: string;
  slug: string;
  name: string;
  number: number;
  country: string; // emoji flag
  team: string;
  carColor: CarColor;
  sponsor: string;
  bestLap: string; // "2:41.328"
  position: number;
  isAI: boolean;
  earnings: number;
  level: number;
}

export type WeatherKind = "clear" | "cloudy" | "rain" | "fog" | "night";

export interface RaceConditions {
  timeOfDay: "dawn" | "day" | "dusk" | "night";
  weather: WeatherKind;
  temperatureC: number;
  trackTempC: number;
  trackCondition: "dry" | "damp" | "wet";
  intensity: number; // 0..1
  online: number;
}

export type EventKind =
  | "overtake"
  | "boost"
  | "pit_stop"
  | "low_fuel"
  | "tire_wear"
  | "crash"
  | "safety_car"
  | "restart"
  | "fastest_lap"
  | "weather_change";

export interface RaceEvent {
  id: string;
  kind: EventKind;
  pilotId?: string;
  message: string;
  at: number; // timestamp ms
  intensity: "low" | "med" | "high";
}

export interface Boost {
  id: string;
  pilotId: string;
  sponsor: string;
  sponsorTagline?: string;
  amount: number; // dollars
  duration: number; // seconds total
  remaining: number; // seconds remaining
  isSafetyCar: boolean;
}

export interface FeedItem {
  id: string;
  pilotId: string;
  text: string;
  likes: number;
  comments: number;
  ageSec: number;
  kind: "organic" | "paid" | "video" | "sponsored";
  sponsor?: string;
  cta?: string;
}
