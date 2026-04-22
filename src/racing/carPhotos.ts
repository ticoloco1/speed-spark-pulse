import type { CarModelId } from "./identity";

import gt3Side from "@/assets/cars/gt3-side.png";
import gt3Hero from "@/assets/cars/gt3-hero.png";
import gt3Top from "@/assets/cars/gt3-top.png";
import hyperSide from "@/assets/cars/hyper-side.png";
import hyperHero from "@/assets/cars/hyper-hero.png";
import hyperTop from "@/assets/cars/hyper-top.png";
import f1Side from "@/assets/cars/f1-side.png";
import f1Hero from "@/assets/cars/f1-hero.png";
import f1Top from "@/assets/cars/f1-top.png";
import muscleSide from "@/assets/cars/muscle-side.png";
import muscleHero from "@/assets/cars/muscle-hero.png";
import muscleTop from "@/assets/cars/muscle-top.png";
import evSide from "@/assets/cars/ev-side.png";
import evHero from "@/assets/cars/ev-hero.png";
import evTop from "@/assets/cars/ev-top.png";

export type CarRenderView = "side" | "hero" | "top";

/**
 * Photorealistic base car PNGs.
 * 5 models × 3 views — neutral pearl-white paint so we can tint per-slug.
 */
export const CAR_PHOTOS: Record<CarModelId, Record<CarRenderView, string>> = {
  gt_03:   { side: gt3Side,    hero: gt3Hero,    top: gt3Top },
  hyper_x: { side: hyperSide,  hero: hyperHero,  top: hyperTop },
  open_w:  { side: f1Side,     hero: f1Hero,     top: f1Top },
  muscle:  { side: muscleSide, hero: muscleHero, top: muscleTop },
  ev_proto:{ side: evSide,     hero: evHero,     top: evTop },
};
