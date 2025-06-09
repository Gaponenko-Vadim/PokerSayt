import { getPositionsBehind, filterCardsByMainPlayer } from "./foldHelpers";

type TcalculateAllin = (
  sumBet: number,
  maxBet: number,
  pozition: string,
  stackSize: number,
  equity: number,
  fullPosition: string[]
) => void;

export const calculateAllin: TcalculateAllin = (
  sumBet,
  maxBet,
  pozition,
  stackSize,
  equity,
  fullPosition
) => {
  return { sumBet, maxBet, stackSize, pozition, equity, fullPosition };
};
