import { CarRenderer, type CarView } from "./CarRenderer";
import type { Pilot } from "@/racing/types";
import { cn } from "@/lib/utils";

interface RaceCarProps {
  pilot?: Pilot;
  // Legacy props (color/number) kept for back-compat — prefer pilot.
  color?: string;
  number?: number;
  className?: string;
  flip?: boolean;
  view?: CarView;
  speed?: number;
  braking?: boolean;
  boosting?: boolean;
}

/**
 * Back-compat wrapper. Prefer using <CarRenderer pilot={...} /> directly.
 * If only a Pilot is passed, the Race Identity Pack drives the visual.
 */
export const RaceCar = ({
  pilot,
  number,
  className,
  flip,
  view = "side",
  speed = 0.5,
  braking = false,
  boosting = false,
}: RaceCarProps) => {
  if (!pilot) {
    // Minimal fallback for legacy callers without a pilot
    return <div className={cn("w-full h-full", className)} />;
  }
  return (
    <CarRenderer
      pilot={pilot}
      view={view}
      speed={speed}
      braking={braking}
      boosting={boosting}
      flip={flip}
      className={className}
      ariaLabel={`Race car #${number ?? pilot.number}`}
    />
  );
};
