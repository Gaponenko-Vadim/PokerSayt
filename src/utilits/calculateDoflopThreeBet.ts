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
  callPlayersCount: number
  // equity: number
) => {
  const coefficientsAllPosition = calculateFinalCoefficient(positionMulti);
  const mainBet = parseFloat(mainPlayerBet || "");
  const resultStavka = calculatePercentageRaiseBets(
    maxBet,
    sumBet,
    callPlayersCount,
    maxCount
  );

  const sumBetposleMyThreeBet = sumBet + resultStavka[33] - mainBet;
  const maxBetMyThreeBet = resultStavka[33];
  const resultStavkatThreeBetNaThreeBet = calculatePercentageRaiseBets(
    maxBetMyThreeBet,
    sumBetposleMyThreeBet,
    callPlayersCount,
    maxCount
  );

  const littleBet = protectionRangeCallMaxBetThreeBet(
    maxBetPlayers,
    mainPlayerCards,
    maxCount,
    "little"
  );
  const betThreeBet = protectionRangeMaxBetThreeBetMyThreeBet(
    maxBetPlayers,
    mainPlayerCards,
    maxCount
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
  const threeLittleThreeBet = 1 - betThreeBet.fold;
  const callLittleThreeBet = (1 - littleBet.fold) * coefficientsAllPosition;
  const littleBetFinal =
    (1 - callLittleThreeBet) * (sumBet - mainBet) +
    (callLittleThreeBet - threeLittleThreeBet) *
      ((littleBet.equityCallThreeBet / 100) *
        (sumBet + (resultStavka[33] - mainBet) + (resultStavka[33] - maxBet))) -
    (resultStavka[33] - mainBet) +
    threeLittleThreeBet *
      ((betThreeBet.equityThreeBet / 100) *
        (sumBetposleMyThreeBet +
          resultStavkatThreeBetNaThreeBet[50] +
          (resultStavkatThreeBetNaThreeBet[50] - mainBet)) -
        (resultStavkatThreeBetNaThreeBet[50] - mainBet));

  console.log(
    "positionMulti",
    positionMulti,
    callLittleThreeBet,
    "переставил",
    resultStavkatThreeBetNaThreeBet[50],
    "betThreeBet",
    betThreeBet.equityThreeBet,
    littleBet.equityCallThreeBet,
    maxCount
  );

  return littleBetFinal;
  // return resultStavka[75];
};
