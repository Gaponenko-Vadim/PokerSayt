import { calculatePercentageRaiseBets } from "./calculatePercentageRaiseBets";
// import { protectionRangeThreeBet } from "./helpersFunction/calculateDoflopThreeBetHelper";
import { protectionRangeCallMaxBetThreeBet } from "./helpersFunction/calculateDoflopThreeBetHelper";
import { calculateFinalCoefficient } from "./helpersFunction/calculateDoflopCallHelper";
import { PlayerDataTwo } from "../components/type";
import { protectionRangeMaxBetThreeBetMyThreeBet } from "./helpersFunction/calculateDoflopThreeBetHelper";
export const calculateDoflopThreeBet = (
  positionMulti: string[],
  maxBet: number,
  sumBet: number,
  mainPlayerBet: string | null | undefined,
  maxBetPlayers: PlayerDataTwo[],
  mainPlayerCards: string[],
  maxCount: number,
  callPlayersCount: number,
  equity: number,
  maxBetPosition: string
): {
  little: { littleBetFinal: number; stavka: number };
  average: {
    averageBetFinal: number;
    stavka: number;
  };
  big: {
    bigBetFinal: number;
    stavka: number;
  };
  max: {
    maxBetFinal: number;
    stavka: number;
  };
} => {
  const coefficientsAllPosition = calculateFinalCoefficient(
    positionMulti,
    maxCount,
    maxBetPosition
  );
  const mainBet = parseFloat(mainPlayerBet || "");
  const resultStavka = calculatePercentageRaiseBets(
    maxBet,
    sumBet,
    callPlayersCount,
    maxCount
  );

  const betThreeBet = protectionRangeMaxBetThreeBetMyThreeBet(
    maxBetPlayers,
    mainPlayerCards,
    maxCount
  );

  const littleBet = protectionRangeCallMaxBetThreeBet(
    maxBetPlayers,
    mainPlayerCards,
    maxCount,
    "little"
  );

  const averageBet = protectionRangeCallMaxBetThreeBet(
    maxBetPlayers,
    mainPlayerCards,
    maxCount,
    "average"
  );

  const bigBet = protectionRangeCallMaxBetThreeBet(
    maxBetPlayers,
    mainPlayerCards,
    maxCount,
    "big"
  );

  const maximumBet = protectionRangeCallMaxBetThreeBet(
    maxBetPlayers,
    mainPlayerCards,
    maxCount,
    "max"
  );

  const final = (fold: number, stavka: number) => {
    const maxBetMyThreeBet = stavka;
    const sumBetposleMyThreeBet = sumBet + maxBetMyThreeBet - mainBet;

    const callThreeBet = Math.min((1 - fold) * coefficientsAllPosition, 1);
    const resultStavkatThreeBetNaThreeBet = calculatePercentageRaiseBets(
      maxBetMyThreeBet,
      sumBetposleMyThreeBet,
      callPlayersCount,
      maxCount
    );
    const odinTest =
      callThreeBet *
      ((equity / 100) *
        (sumBetposleMyThreeBet +
          (maxBetMyThreeBet - maxBet) +
          -(maxBetMyThreeBet - mainBet)) -
        (maxBetMyThreeBet - mainBet));

    const odinSbrosilTest =
      callThreeBet < 1 ? (1 - callThreeBet) * sumBet - mainBet : 0;
    const odinThreeBet =
      (betThreeBet.equityThreeBet / 100) *
        (sumBetposleMyThreeBet +
          resultStavkatThreeBetNaThreeBet[50] -
          maxBet +
          (resultStavkatThreeBetNaThreeBet[50] - maxBetMyThreeBet - mainBet)) -
      (resultStavkatThreeBetNaThreeBet[50] - mainBet);

    const betFinalTest =
      betThreeBet.fold * (odinTest + odinSbrosilTest) +
      (1 - betThreeBet.fold) * odinThreeBet;

    console.log(
      "2222222222222222222222222222222222222222222222",
      callThreeBet,
      betThreeBet.equityThreeBet / 100,
      resultStavkatThreeBetNaThreeBet[50],
      "(callThreeBet)",
      betThreeBet.fold,
      odinThreeBet,
      "(1 - betThreeBet.fold) ",
      betThreeBet.fold,
      sumBetposleMyThreeBet,
      maxCount,
      mainBet,

      maxBetMyThreeBet,
      betFinalTest
    );

    return betFinalTest;
  };

  const littleBetFinal = final(littleBet.fold, resultStavka[33]);
  const averageBetFinal = final(averageBet.fold, resultStavka[50]);
  const bigBetFinal = final(bigBet.fold, resultStavka[75]);
  const maxBetFinal = final(maximumBet.fold, resultStavka[100]);

  return {
    little: {
      littleBetFinal: littleBetFinal,
      stavka: resultStavka[33],
    },
    average: {
      averageBetFinal: averageBetFinal,
      stavka: resultStavka[50],
    },
    big: {
      bigBetFinal: bigBetFinal,
      stavka: resultStavka[75],
    },
    max: {
      maxBetFinal: maxBetFinal,
      stavka: resultStavka[100],
    },
  };
};
