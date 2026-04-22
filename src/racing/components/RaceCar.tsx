import { CAR_IMAGES } from "@/racing/cars";
import type { CarColor } from "@/racing/types";
import { cn } from "@/lib/utils";

interface RaceCarProps {
  color: CarColor;
  number?: number;
  className?: string;
  flip?: boolean;
}

export const RaceCar = ({ color, number, className, flip }: RaceCarProps) => {
  return (
    <div className={cn("relative", className)}>
      <img
        src={CAR_IMAGES[color]}
        alt={`Race car #${number ?? ""}`}
        loading="lazy"
        className={cn("w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]", flip && "scale-x-[-1]")}
      />
    </div>
  );
};
