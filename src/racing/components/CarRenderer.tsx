import { useMemo } from "react";
import type { Pilot } from "@/racing/types";
import { getIdentityPack, type RaceIdentityPack } from "@/racing/identity";
import { CAR_PHOTOS, type CarRenderView } from "@/racing/carPhotos";
import { cn } from "@/lib/utils";

export type CarView = "side" | "hero" | "top" | "ticker" | "card" | "boost";

interface CarRendererProps {
  pilot?: Pilot;
  pack?: RaceIdentityPack;
  view?: CarView;
  speed?: number;          // 0..1 — drives motion blur intensity
  braking?: boolean;       // brake glow
  boosting?: boolean;      // accent glow + bloom
  flip?: boolean;
  showSponsors?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Single source of truth for rendering a car.
 * Photorealistic PNG base + per-slug color tint (hue rotation / multiply blend)
 * + overlay number/livery/sponsors.
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

  // Map composite views down to a base photo angle.
  const baseView: CarRenderView = view === "top"
    ? "top"
    : view === "hero"
    ? "hero"
    : "side";

  const photoSet = CAR_PHOTOS[pack.baseCarModelId] ?? CAR_PHOTOS.gt_03;
  const photo = photoSet[baseView] ?? photoSet.side;

  // Color tint via CSS filters — hue rotation toward primary color, with
  // saturation/contrast/brightness boosts for richer paint reading.
  const hue = useMemo(() => hexToHueDelta(pack.primaryColor), [pack.primaryColor]);
  const tintFilter = `hue-rotate(${hue}deg) saturate(1.55) contrast(1.05) brightness(0.96)`;
  const glow = boosting
    ? ` drop-shadow(0 0 22px ${pack.accentColor}cc) drop-shadow(0 8px 18px rgba(0,0,0,0.55))`
    : ` drop-shadow(0 8px 14px rgba(0,0,0,0.55))`;

  // Motion blur — only on side/hero, scaled by speed
  const blurAmount = speed > 0.4 && baseView !== "top" ? Math.min(2, speed * 1.4) : 0;

  return (
    <div
      className={cn("relative inline-block w-full h-full", className)}
      aria-label={ariaLabel ?? `${pack.displayName} #${pack.racingNumber}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {/* Speed trail behind car (side/hero only) */}
      {speed > 0.35 && baseView !== "top" && (
        <div
          className="absolute inset-y-0 right-[55%] pointer-events-none"
          style={{
            width: `${Math.min(75, 18 + speed * 70)}%`,
            background: `linear-gradient(90deg, transparent 0%, ${pack.primaryColor}33 40%, ${pack.primaryColor}66 80%, transparent 100%)`,
            filter: "blur(8px)",
            opacity: speed * 0.7,
          }}
        />
      )}

      {/* Brake glow halo */}
      {braking && baseView !== "top" && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: "2%", top: "55%",
            width: "16%", height: "30%",
            background: "radial-gradient(circle, #ff3300cc, #ff000044 40%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      )}

      {/* The car itself — tinted photo */}
      <img
        src={photo}
        alt=""
        loading="lazy"
        className="relative w-full h-full object-contain"
        style={{
          filter: tintFilter + glow,
          transform: blurAmount > 0 ? `translateX(0)` : undefined,
        }}
      />

      {/* Subtle motion-blur ghost behind */}
      {blurAmount > 0 && (
        <img
          src={photo}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            filter: `${tintFilter} blur(${blurAmount * 4}px)`,
            opacity: speed * 0.35,
            transform: "translateX(-6px)",
          }}
        />
      )}

      {/* Number badge overlay (only on side/hero where door is visible) */}
      {baseView !== "top" && (
        <div
          className="absolute pointer-events-none flex items-center justify-center font-display font-black"
          style={{
            left: "44%", top: "47%",
            width: "10%", height: "16%",
            color: pack.primaryColor,
            background: "radial-gradient(circle, #ffffffee 60%, transparent 75%)",
            borderRadius: "50%",
            fontSize: "min(2.8vw, 26px)",
            textShadow: `0 1px 2px rgba(0,0,0,0.3)`,
            opacity: 0.95,
          }}
        >
          {pack.racingNumber}
        </div>
      )}

      {/* Number badge for TOP view — on the roof */}
      {baseView === "top" && (
        <div
          className="absolute pointer-events-none flex items-center justify-center font-display font-black text-white"
          style={{
            left: "32%", top: "42%",
            width: "36%", height: "16%",
            fontSize: "min(7vw, 64px)",
            textShadow: `0 2px 8px rgba(0,0,0,0.7), 0 0 2px ${pack.secondaryColor}`,
            letterSpacing: "-0.03em",
          }}
        >
          {pack.racingNumber}
        </div>
      )}

      {/* Sponsor decals — accent stripe + sponsor name */}
      {showSponsors && baseView !== "top" && pack.sponsorSlots[0] && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              left: "6%", right: "6%", top: "67%", height: "3px",
              background: `linear-gradient(90deg, transparent, ${pack.accentColor}, transparent)`,
              opacity: 0.85,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute pointer-events-none font-display font-bold tracking-[0.15em] text-white text-center"
            style={{
              left: "55%", top: "55%", width: "30%",
              fontSize: "min(1.2vw, 11px)",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              opacity: 0.9,
            }}
          >
            {pack.sponsorSlots[0]}
          </div>
        </>
      )}

      {/* Sponsor name on top view (hood) */}
      {showSponsors && baseView === "top" && pack.sponsorSlots[0] && (
        <div
          className="absolute pointer-events-none font-display font-bold tracking-[0.18em] text-white text-center"
          style={{
            left: "20%", top: "16%", width: "60%",
            fontSize: "min(2vw, 16px)",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            opacity: 0.92,
          }}
        >
          {pack.sponsorSlots[0]}
        </div>
      )}

      {/* Boost glow ring */}
      {boosting && (
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(ellipse at center, ${pack.accentColor}33, transparent 60%)`,
            mixBlendMode: "screen",
            animation: "live-pulse 1.6s ease-in-out infinite",
          }}
        />
      )}

      {/* Speed line sweeping past */}
      {speed > 0.55 && baseView !== "top" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, #ffffffaa, transparent)",
              opacity: speed * 0.55,
              animation: "speed-line-pass 0.5s linear infinite",
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Convert a hex color to the hue-rotate degrees needed to shift our
 * neutral pearl-white base toward the target color. The base photos
 * have a slight warm cream tint (~hue 35°), so we rotate from there.
 */
function hexToHueDelta(hex: string): number {
  const c = hex.replace("#", "");
  if (c.length !== 6) return 0;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d) % 6; break;
    case g: h = (b - r) / d + 2; break;
    case b: h = (r - g) / d + 4; break;
  }
  h = h * 60;
  if (h < 0) h += 360;
  // Base cream is ~35°; target hue rotation = h - 35
  let delta = h - 35;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return Math.round(delta);
}
