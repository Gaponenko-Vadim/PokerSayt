import rages from "./positionsRanges8maxMtt";
import { PlayerStatus } from "../components/type";

interface RangeActions {
  open: string[];

  defend_open?: string[];
  defendThreeBetLittle?: string[];
  defendThreeBetAverage?: string[];
  defendThreeBetBig?: string[];
  defendThreeBetMax?: string[];
  threeBet: string[];
  multiThreeBet: string[];
  fourBet: string[];
  allIn: string[];
}

interface Range {
  middle: RangeActions;
  little: RangeActions;
  ultraShort: RangeActions;
  big: RangeActions;
}

export const POSITION_RANGES: Record<
  string,
  Partial<Record<PlayerStatus, Range>>
> = {
  UTG: {
    standard: rages.utgRangeStandardAverage,
    tight: rages.utgRangeTightAverage,
    weak: rages.utgRangeWeakAverage,
  },
  "UTG+1": {
    standard: rages.utg1RangeStandardAverage,
    tight: rages.utg1RangeTightAverage,
    weak: rages.utg1RangeWeakAverage,
  },
  MP: {
    standard: rages.mpRangeStandardAverage,
    tight: rages.mpRangeTightAverage,
    weak: rages.mpRangeWeakAverage,
  },
  "MP+1": {
    standard: rages.mpPlus1RangeStandardAverage,
    tight: rages.mpPlus1RangeTightAverage,
    weak: rages.mpPlus1RangeWeakAverage,
  },
  HJ: {
    standard: rages.hjRangeStandardAverage,
    tight: rages.hjRangeTightAverage,
    weak: rages.hjRangeWeakAverage,
  },
  BT: {
    standard: rages.btnRangeStandardAverage,
    tight: rages.btnRangeTightAverage,
    weak: rages.btnRangeWeakAverage,
  },
  SB: {
    standard: rages.sbRangeStandardAverage,
    tight: rages.sbRangeTightAverage,
    weak: rages.sbRangeWeakAverage,
  },
  BB: {
    standard: rages.bbRangeStandardAverage,
    tight: rages.bbRangeTightAverage,
    weak: rages.bbRangeWeakAverage,
  },
};
