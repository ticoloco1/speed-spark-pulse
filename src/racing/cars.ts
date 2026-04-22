import type { CarColor } from "./types";
import carRed from "@/assets/car-red.png";
import carGreen from "@/assets/car-green.png";
import carOrange from "@/assets/car-orange.png";
import carBlue from "@/assets/car-blue.png";
import carBlack from "@/assets/car-black.png";
import carYellow from "@/assets/car-yellow.png";
import carPurple from "@/assets/car-purple.png";
import safetyCar from "@/assets/safety-car.png";

export const CAR_IMAGES: Record<CarColor, string> = {
  red: carRed,
  green: carGreen,
  orange: carOrange,
  blue: carBlue,
  black: carBlack,
  yellow: carYellow,
  purple: carPurple,
};

export const SAFETY_CAR_IMG = safetyCar;

export const CAR_TINTS: Record<CarColor, string> = {
  red: "hsl(0 84% 55%)",
  green: "hsl(142 76% 45%)",
  orange: "hsl(24 100% 55%)",
  blue: "hsl(210 100% 56%)",
  black: "hsl(0 0% 25%)",
  yellow: "hsl(48 100% 55%)",
  purple: "hsl(270 80% 60%)",
};
