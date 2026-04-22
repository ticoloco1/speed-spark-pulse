import { useMemo } from "react";
import type { Pilot } from "@/racing/types";
import { getIdentityPack } from "@/racing/identity";
import { PILOT_PHOTOS } from "@/racing/pilotPhotos";
import { cn } from "@/lib/utils";

interface PilotPortraitProps {
  pilot: Pilot;
  className?: string;
  showSponsorPatch?: boolean;
}

/**
 * Photorealistic pilot portrait wearing pearl-white Nomex suit, tinted
 * deterministically with the slug's Race Identity Pack primary color.
 * The sponsor patch overlays the chest area to identify their main partner.
 */
export const PilotPortrait = ({
  pilot,
  className,
  showSponsorPatch = true,
}: PilotPortraitProps) => {
  const pack = useMemo(() => getIdentityPack(pilot), [pilot]);
  const photo = PILOT_PHOTOS[pack.baseCarModelId] ?? PILOT_PHOTOS.gt_03;

  const hue = useMemo(() => hexToHueDelta(pack.primaryColor), [pack.primaryColor]);
  const tintFilter = `hue-rotate(${hue}deg) saturate(1.45) contrast(1.04) brightness(0.97) drop-shadow(0 12px 20px rgba(0,0,0,0.6))`;

  const mainSponsor = pack.sponsorSlots[0] ?? pilot.sponsor;

  return (
    <div className={cn("relative inline-block", className)} aria-label={`${pilot.name} portrait`}>
      {/* Spotlight backglow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 55% 70% at 50% 45%, ${pack.primaryColor}33, transparent 70%)`,
          filter: "blur(12px)",
        }}
      />

      <img
        src={photo}
        alt={`${pilot.name} in racing suit`}
        loading="lazy"
        width={768}
        height={1024}
        className="relative w-full h-full object-contain"
        style={{ filter: tintFilter }}
      />

      {/* Sponsor chest patch — sits over the blank panel on the suit */}
      {showSponsorPatch && mainSponsor && (
        <div
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: "32%",
            top: "34%",
            width: "32%",
            height: "9%",
            background: `linear-gradient(135deg, ${pack.secondaryColor}, ${pack.primaryColor})`,
            border: `1px solid ${pack.accentColor}`,
            borderRadius: "2px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            transform: "rotate(-1deg)",
          }}
        >
          <span
            className="font-display font-black tracking-[0.12em] text-white text-center leading-none px-1"
            style={{
              fontSize: "min(1.1vw, 11px)",
              textShadow: "0 1px 2px rgba(0,0,0,0.6)",
            }}
          >
            {mainSponsor}
          </span>
        </div>
      )}

      {/* Number badge on shoulder */}
      <div
        className="absolute pointer-events-none flex items-center justify-center font-display font-black"
        style={{
          left: "62%",
          top: "26%",
          width: "10%",
          height: "6%",
          color: pack.primaryColor,
          background: "rgba(255,255,255,0.95)",
          borderRadius: "3px",
          fontSize: "min(1.4vw, 14px)",
          border: `1px solid ${pack.accentColor}`,
        }}
      >
        {pack.racingNumber}
      </div>
    </div>
  );
};

/**
 * Same hue rotation pipeline used by CarRenderer — keeps the suit color
 * perfectly synced with the car paint for that slug.
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
  let delta = h - 35;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return Math.round(delta);
}
