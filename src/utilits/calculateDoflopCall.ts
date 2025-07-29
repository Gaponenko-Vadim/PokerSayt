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

  const coefficientsAllPosition = calculateFinalCoefficient(positionMulti);

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
    const AllFold =
      (1 - foldCall.averageDiscardedPercentage / 100) * coefficientsAllPosition;
    const ThereWillTribute =
      1 - foldCallThreeBet.averageDiscardedPercentage / 100;
    const multiCallOponent = 1 - foldCall.averageDiscardedPercentage / 100;
    const mainStavka = maxBet - mainBet;
    const stavkaDoThreeBet = threeBetStavka.bet;
    const stavkaDoCallMultipot = MultiStavka.bet;
    // console.log(
    //   "все сбросили",
    //   foldCall.averageDiscardedPercentage,
    //   "equity против основного опонента",
    //   equityDo1,
    //   "equity против трибетта",
    //   equityThreeBet.equity,
    //   "equity против мультипотта",
    //   multiCall,
    //   "процент того что сделает трибетт",
    //   foldCallThreeBet.averageDiscardedPercentage,
    //   "ответ с коэфицентом",
    //   AllFold,
    //   "coefficientsAllPosition",
    //   coefficientsAllPosition,
    //   ThereWillTribute,
    //   multiCallOponent
    // );
    return (() => {
      if (positionMulti.length === 1 || multiCallOponent < 0) {
        const result =
          (1 - AllFold) * (equityDo1 * (sumBet + mainStavka) - mainStavka) +
          AllFold *
            ((equityThreeBet.equity / 100) *
              (sumBet +
                (calculatePercentageRaise - stavkaDoThreeBet) +
                (calculatePercentageRaise - mainBet)) -
              (calculatePercentageRaise - mainBet));

        return result;
      }

      return (
        (1 - AllFold) * (equityDo1 * (sumBet + mainStavka) - mainStavka) +
        ThereWillTribute *
          ((equityThreeBet.equity / 100) *
            (sumBet +
              (calculatePercentageRaise - stavkaDoThreeBet) +
              (calculatePercentageRaise - mainBet)) -
            (calculatePercentageRaise - mainBet)) +
        ((AllFold - ThereWillTribute) *
          ((multiCall / 100) *
            (sumBet + (maxBet - stavkaDoCallMultipot) + mainStavka)) -
          mainStavka)
      );

      //
      // } else if (multiCallOponent < 0) {
      //   return (
      //     AllFold * (equityDo1 * (sumBet + mainStavka) - mainBet) +
      //     (ThereWillTribute *
      //       ((equityThreeBet.equity / 100) *
      //         (sumBet +
      //           (calculatePercentageRaise - stavkaDoThreeBet) +
      //           (calculatePercentageRaise - mainBet))) -
      //       (calculatePercentageRaise - mainBet))
      //   );
      // } else
      //   return (
      //     AllFold * (equityDo1 * (sumBet + mainStavka) - mainStavka) +
      //     ThereWillTribute *
      //       ((equityThreeBet.equity / 100) *
      //         (sumBet +
      //           (calculatePercentageRaise - stavkaDoThreeBet) +
      //           (calculatePercentageRaise - mainBet)) -
      //         (calculatePercentageRaise - mainBet)) +
      //     multiCallOponent *
      //       ((multiCall / 100) *
      //         (sumBet + (maxBet - stavkaDoCallMultipot) + mainStavka) -
      //         mainStavka)
      //   );
    })();
  };
  // Логирование для отладки

  // console.log(
  //   "fold",
  //   foldCall,
  //   "mainPlayerCard",
  //   mainPlayerCards,
  //   "equity",
  //   equityDo1,
  //   "sumBet",
  //   sumBet,
  //   "mainPlayerBet",
  //   mainBet,
  //   "positionMulti",
  //   positionMulti,
  //   "maxBet",
  //   maxBet,
  //   intermediatePositions,
  //   " maxCount",
  //   maxCount,
  //   "cardsCall",
  //   cardsInfoPlayers,
  //   "stavka",
  //   range,
  //   "threeBetstavka",
  //   threeBet,
  //   "call",
  //   foldCall.discardedPercentages,
  //   "threeBet",

  //   threeBetStavka.result,
  //   " foldCallThreeBet",
  //   foldCallThreeBet.averageDiscardedPercentage,
  //   "equityThreeBet",
  //   equityThreeBet.equity,
  //   "reise",
  //   calculatePercentageRaise,
  //   "dfrgf",
  //   MultiStavka.result,
  //   "maxBetPlayers",
  //   newMaxBetPlayers,
  //   "multiCall",
  //   multiCall
  // );
  // console.log("agreeeeeeeaedffffgggggggggggggggggggggggggggg", positionMulti);
  return ev1stage();
};
// сделать высчет ставки рейза - что стаит , от сам бет
