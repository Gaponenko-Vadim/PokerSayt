import { TypeGameStadia } from "../components/type";
export const stackStadiaName = (
  stadia: TypeGameStadia,
  baseStartingStack: number
): number => {
  const stadiaStackMultipliers: Record<TypeGameStadia, number> = {
    initial: 1.0, // 100%
    Average: 0.45, // 45%
    late: 0.25, // 25%
    prize: 0.15, // 15%
  };

  return Math.round(baseStartingStack * stadiaStackMultipliers[stadia]);
};
