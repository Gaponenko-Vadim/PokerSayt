import { filterCardsByMainPlayer } from "./foldHelpers";
import { calculateEquity } from "./allСombinations/calculateEquity";
import { full } from "../constants/positionsRanges8maxMtt";
import { PlayerData, TypeStatusRise, PlayerDataTwo } from "../components/type";
import { convertRangeToCards } from "./allСombinations/allTwoCardCombinations";
import { calculatePercentageRaiseBets } from "./calculatePercentageRaiseBets";
import { calculateMultiPotEquity } from "./calculateMultiPotEquity";
import { calculateFinalCoefficient } from "./helpersFunction/calculateDoflopCallHelper";

import {
  findPositionWithMostCombinations,
  protectionRange,
  doflopCallThreeBet,
  calculateDiscardedPercentage,
} from "./helpersFunction/calculateDoflopCallHelper";

export const calculateDoflopCall = (
  mainPlayerCards: string[],
  equity: number,
  sumBet: number,
  mainPlayerBet: string | null | undefined,
  positionMulti: string[],
  maxBet: number,
  infoPlayers: { [key: string]: PlayerData },
  maxCount: number,
  statusRise: TypeStatusRise,
  maxBetPlayers: PlayerDataTwo[]
): number => {
  const mainBet = parseFloat(mainPlayerBet || "");
  const equityDo1 = equity / 100;
  // const intermediatePositions = positionMulti.map((pos) => infoPlayers[pos]);

  const fullDiapason = full.flatMap((full: string) =>
    convertRangeToCards(full)
  );
  const range = protectionRange(
    positionMulti,
    infoPlayers,
    mainPlayerCards,
    maxCount,
    statusRise
  );

  const threeBet = doflopCallThreeBet(
    positionMulti,
    infoPlayers,
    mainPlayerCards,
    maxCount
  );

  const coefficientsAllPosition = calculateFinalCoefficient(
    positionMulti,
    maxCount
  );

  const intermediatePositions = positionMulti.map((pos) => {
    const player = infoPlayers[pos];
    let diapason: string[][];

    // Проверка bet для установки diapason
    if (
      player.bet === null || // Нет ставки
      (player.position === "SB" && player.bet === "0.5BB") || // SB с 0.5BB
      (player.position === "BB" && player.bet === "1BB") // BB с 1BB
    ) {
      diapason = mainPlayerCards
        ? filterCardsByMainPlayer(fullDiapason, mainPlayerCards)
        : fullDiapason;
    } else if (
      player.bet !== null &&
      ((player.position === "SB" &&
        parseFloat(player.bet.replace(/BB$/, "")) > 0.5) ||
        (player.position === "BB" &&
          parseFloat(player.bet.replace(/BB$/, "")) > 1))
    ) {
      diapason = mainPlayerCards
        ? filterCardsByMainPlayer(player.cards, mainPlayerCards)
        : player.cards; // Используем cards: string[][] из PlayerData
    } else {
      diapason = player.cardsdiaposon?.length
        ? player.cardsdiaposon.flatMap((range: string) =>
            convertRangeToCards(range)
          )
        : [];
    }

    return { position: player.position, diapason };
  });

  const cardsInfoPlayers = positionMulti.map((pos) => {
    const players = infoPlayers[pos];
    const cards = mainPlayerCards
      ? filterCardsByMainPlayer(players.cards, mainPlayerCards)
      : players.cards;
    return {
      position: players.position,
      cards: cards,
      action: players.action,
      bet: players.bet,
    };
  });

  const foldCall =
    maxCount != 0
      ? calculateDiscardedPercentage(intermediatePositions, range, infoPlayers)
      : calculateDiscardedPercentage(
          intermediatePositions,
          cardsInfoPlayers,
          infoPlayers
        );

  const foldCallThreeBet = calculateDiscardedPercentage(
    intermediatePositions,
    threeBet,
    infoPlayers
  );

  const aaa = calculateDiscardedPercentage(
    intermediatePositions,
    range,
    infoPlayers
  );

  // 1. Получаем данные о ставке
  const threeBetStavka = findPositionWithMostCombinations(
    foldCallThreeBet.discardedPercentages
  );

  const MultiStavka = findPositionWithMostCombinations(
    aaa.discardedPercentages
  );

  // 2. Проверяем все необходимые условия перед расчетом
  let equityThreeBet;
  if (
    mainPlayerCards &&
    mainPlayerCards.length > 0 &&
    threeBetStavka &&
    threeBetStavka.cards &&
    threeBetStavka.cards.length > 0
  ) {
    // 3. Только если все условия выполнены - делаем расчет
    equityThreeBet = calculateEquity(mainPlayerCards, threeBetStavka.cards);
  } else {
    // 4. В противном случае - возвращаем значение по умолчанию
    equityThreeBet = { equity: 0 };
  }

  const calculatePercentageRaise = calculatePercentageRaiseBets(
    maxBet,
    sumBet
  )[50];

  const newMaxBetPlayers = [...maxBetPlayers, MultiStavka.result];
  const multiCall = calculateMultiPotEquity(mainPlayerCards, newMaxBetPlayers);
  const ev1stage = () => {
    const AllFold = Math.min(
      (1 - foldCall.averageDiscardedPercentage / 100) * coefficientsAllPosition,
      1
    );
    const ThereWillTribute =
      1 - foldCallThreeBet.averageDiscardedPercentage / 100;
    const multiCallOponent = 1 - foldCall.averageDiscardedPercentage / 100;
    const mainStavka = maxBet - mainBet;
    const stavkaDoThreeBet = threeBetStavka.bet;
    const stavkaDoCallMultipot = MultiStavka.bet;
    const equityThreeBetNorm =
      equityThreeBet.equity !== null ? equityThreeBet.equity / 100 : 0;
    const multiCallNorm = multiCall !== null ? multiCall / 100 : 0;

    const callPriMnogixIgrakach =
      maxCount < 2
        ? (1 - AllFold) * (equityDo1 * (sumBet + mainStavka) - mainStavka) +
          ThereWillTribute *
            (equityThreeBetNorm *
              (sumBet +
                (calculatePercentageRaise - stavkaDoThreeBet) +
                (calculatePercentageRaise - mainBet)) -
              (calculatePercentageRaise - mainBet)) +
          ((AllFold - ThereWillTribute) *
            (multiCallNorm *
              (sumBet + (maxBet - stavkaDoCallMultipot) + mainStavka)) -
            mainStavka)
        : equityDo1 * (sumBet + mainStavka) - mainStavka;
    console.log("все сбросили", foldCall.averageDiscardedPercentage);
    return (() => {
      if (positionMulti.length === 1 || multiCallOponent < 0) {
        const result =
          (1 - AllFold) * (equityDo1 * (sumBet + mainStavka) - mainStavka) +
          AllFold *
            (equityThreeBetNorm *
              (sumBet +
                (calculatePercentageRaise - stavkaDoThreeBet) +
                (calculatePercentageRaise - mainBet)) -
              (calculatePercentageRaise - mainBet));

        return result;
      }

      return callPriMnogixIgrakach;
    })();
  };

  return ev1stage();
};
