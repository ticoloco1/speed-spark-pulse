import type { CarModelId } from "./identity";

import pilotGt3 from "@/assets/pilots/pilot-gt3.png";
import pilotHyper from "@/assets/pilots/pilot-hyper.png";
import pilotF1 from "@/assets/pilots/pilot-f1.png";
import pilotMuscle from "@/assets/pilots/pilot-muscle.png";
import pilotEv from "@/assets/pilots/pilot-ev.png";

/**
 * Photorealistic base pilot portraits — pearl-white Nomex suit so we can
 * tint with the Race Identity Pack primary color (same pipeline as cars).
 * Mapped by CarModelId so each pilot's portrait matches their car category.
 */
export const PILOT_PHOTOS: Record<CarModelId, string> = {
  gt_03: pilotGt3,
  hyper_x: pilotHyper,
  open_w: pilotF1,
  muscle: pilotMuscle,
  ev_proto: pilotEv,
};
