import { useRaceStore } from "@/racing/engine";
import { Cloud, CloudFog, CloudRain, Moon, Sun, Sunrise, Sunset, Thermometer, Users } from "lucide-react";

const WEATHER_ICON = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  fog: CloudFog,
  night: Moon,
};

const TIME_ICON = {
  dawn: Sunrise,
  day: Sun,
  dusk: Sunset,
  night: Moon,
};

const TIME_LABEL = {
  dawn: "AMANHECER",
  day: "DIA",
  dusk: "ANOITECER",
  night: "NOITE",
};

const COND_LABEL = {
  dry: "DRY",
  damp: "DAMP",
  wet: "WET",
};

export const WeatherHud = () => {
  const c = useRaceStore((s) => s.conditions);
  const W = WEATHER_ICON[c.weather];
  const T = TIME_ICON[c.timeOfDay];

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 surface-1 hud-border rounded px-2.5 py-1.5">
        <T className="w-3.5 h-3.5 text-racing-amber" />
        <span className="font-display font-semibold tracking-wider text-[10px]">{TIME_LABEL[c.timeOfDay]}</span>
      </div>
      <div className="flex items-center gap-1.5 surface-1 hud-border rounded px-2.5 py-1.5">
        <W className="w-3.5 h-3.5 text-foreground/70" />
        <span className="font-mono text-[11px] tabular-nums">{c.temperatureC}°C</span>
      </div>
      <div className="flex items-center gap-1.5 surface-1 hud-border rounded px-2.5 py-1.5">
        <Thermometer className="w-3.5 h-3.5 text-racing-red" />
        <span className="font-mono text-[11px] tabular-nums">TRACK {c.trackTempC}°</span>
      </div>
      <div className="flex items-center gap-1.5 surface-1 hud-border rounded px-2.5 py-1.5">
        <span className={`w-2 h-2 rounded-full ${
          c.trackCondition === "dry" ? "bg-racing-green" : c.trackCondition === "damp" ? "bg-racing-amber" : "bg-racing-blue"
        }`} />
        <span className="font-display font-semibold tracking-wider text-[10px]">{COND_LABEL[c.trackCondition]}</span>
      </div>
      <div className="flex items-center gap-1.5 surface-1 hud-border rounded px-2.5 py-1.5">
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-mono text-[11px] tabular-nums">{c.online.toLocaleString()}</span>
        <span className="text-[10px] text-muted-foreground">ONLINE</span>
      </div>
    </div>
  );
};
