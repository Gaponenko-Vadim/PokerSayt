import {
  TypeStatusRise,
  PlayerData,
  PlayerStack,
  PlayerStatus,
  PlayerDataTwo,
  RangeActionsVarant,
} from "../../components/type";
import { POSITION_RANGES } from "../../constants/pozition_ranges";
import { convertRangeToCards } from "../allСombinations/allTwoCardCombinations";
import { filterCardsByMainPlayer } from "../foldHelpers";
import { full } from "../../constants/positionsRanges8maxMtt";
import { calculateEquity } from "../allСombinations/calculateEquity";
export const foldCardPercentage = (
  defoldDiaposon: string[][],
  diapason: string[][]
): number => {
  // Получаем уникальные карты из исходного диапазона
  const final = diapason.length / defoldDiaposon.length;
  return 1 - final;
};

export const getLongestCardsDiaposon = (
  maxBetPlayers: PlayerDataTwo[],
  mainPlayerCards: string[]
): {
  diaposon: string[][];
  position: string | null;
  status: PlayerStatus;
  stack: PlayerStack;
  bet: string | null;
} => {
  const fullDiapason = full.flatMap((full: string) =>
    convertRangeToCards(full)
  );
  // Проверяем, есть ли игроки в maxBetPlayers
  if (!maxBetPlayers.length) {
    console.log("Ошибка: maxBetPlayers пуст");
    return {
      diaposon: [],
      position: null,
      status: "standard",
      stack: "middle",
      bet: null,
    };
  }

  // Находим объект с самым длинным массивом cards
  const playerWithLongestCards = maxBetPlayers.reduce(
    (maxPlayer, currentPlayer) => {
      if (!currentPlayer.cards || !currentPlayer.cards.length) {
        return maxPlayer;
      }
      return !maxPlayer.cards ||
        currentPlayer.cards.length > maxPlayer.cards.length
        ? currentPlayer
        : maxPlayer;
    },
    {} as PlayerDataTwo
  );

  // Проверяем, найден ли игрок с валидным массивом cards
  if (
    !playerWithLongestCards.cards ||
    playerWithLongestCards.cards.length === 0
  ) {
    console.log("Ошибка: Не найдено валидных карт в maxBetPlayers");
    return {
      diaposon: [],
      position: null,
      status: "standard",
      stack: "middle",
      bet: null,
    };
  }
  let diaposonFinal: string[][];
  if (
    playerWithLongestCards.bet === null || // Нет ставки
    (playerWithLongestCards.position === "SB" &&
      playerWithLongestCards.bet === "0.5BB") || // SB с 0.5BB
    (playerWithLongestCards.position === "BB" &&
      playerWithLongestCards.bet === "1BB") // BB с 1BB
  ) {
    diaposonFinal = mainPlayerCards
      ? filterCardsByMainPlayer(fullDiapason, mainPlayerCards)
      : fullDiapason;
  } else {
    diaposonFinal = filterCardsByMainPlayer(
      playerWithLongestCards.cards,
      mainPlayerCards
    );
  }

  // Применяем filterCardsByMainPlayer к cards игрока с самым длинным массивом

  console.log("sfdaaaaaaadddddddddddd", diaposonFinal.length);
  return {
    diaposon: diaposonFinal,
    position: playerWithLongestCards.position || null,
    status: playerWithLongestCards.status,
    stack: playerWithLongestCards.stack,
    bet: playerWithLongestCards.bet,
  };
};

export const protectionRangeThreeBet = (
  positionMulti: string[],
  infoPlayers: { [key: string]: PlayerData },
  mainPlayerCards: string[],
  maxCount: number,
  statusRise: TypeStatusRise
): { position: string; cards: string[][]; betFinal: number }[] => {
  return positionMulti.map((pos) => {
    const stack: PlayerStack = infoPlayers[pos].stack;
    const betString = infoPlayers[pos].bet;
    const betFinal: number = betString
      ? parseFloat(betString.replace(/[^0-9.]/g, ""))
      : 0;
    const positionRanges = POSITION_RANGES[pos];
    const status: PlayerStatus = infoPlayers[pos]?.status || "active";

    let rangeSelection: string;

    if (maxCount === 1) {
      if (statusRise === "little") {
        rangeSelection = "open";
      } else if (statusRise === "average") {
        rangeSelection = "open";
      } else if (statusRise === "big") {
        rangeSelection = "defendThreeBetAverage";
      } else {
        rangeSelection = "open"; // Для statusRise === "no" или других
        alert("Ошибка: Что-то пошло не так!");
      }
    } else if (maxCount === 2) {
      if (statusRise === "little") {
        rangeSelection = "defendThreeBetLittle";
      } else if (statusRise === "average") {
        rangeSelection = "defendThreeBetAverage";
      } else if (statusRise === "big") {
        rangeSelection = "defendThreeBetBig";
      } else if (statusRise === "max") {
        rangeSelection = "defendThreeBetMax";
      } else {
        rangeSelection = "threeBet";
      }
    } else if (maxCount === 3) {
      if (statusRise === "big") {
        rangeSelection = "fourBet";
      } else {
        rangeSelection = "fourBet"; // Для других statusRise
      }
    } else if (maxCount >= 4) {
      if (statusRise === "big") {
        rangeSelection = "allIn";
      } else {
        rangeSelection = "allIn";
      }
    } else {
      rangeSelection = "open"; // Для maxCount < 1 или других
    }

    // Проверка, что rangeSelection является ключом RangeActions
    const rangeActions = positionRanges?.[status]?.[stack];
    const diapason =
      rangeActions && rangeSelection in rangeActions
        ? rangeActions[rangeSelection as keyof typeof rangeActions] || []
        : [];

    const diapasonCombination = diapason.flatMap((range: string) =>
      convertRangeToCards(range)
    );
    const cards =
      diapasonCombination && mainPlayerCards
        ? filterCardsByMainPlayer(diapasonCombination, mainPlayerCards)
        : diapasonCombination;

    if (!diapason.length) {
      console.log(
        `Warning: No range found for ${pos}, ${status}, ${stack}, ${rangeSelection}`
      );
    }

    return { position: pos, cards, betFinal };
  });
};

export const protectionRangeCallMaxBetThreeBet = (
  maxBetPlayers: PlayerDataTwo[],
  mainPlayerCards: string[],
  maxCount: number,
  statusRise: TypeStatusRise
): {
  diaposon: string[][];
  fold: number;
  equityCallThreeBet: number;
} => {
  const diaposonCallMyThreeBet = getLongestCardsDiaposon(
    maxBetPlayers,
    mainPlayerCards
  );

  const positionStatus = diaposonCallMyThreeBet.status;
  const positionStack = diaposonCallMyThreeBet.stack;
  const positionMaxBet = diaposonCallMyThreeBet.position;
  const defoldDiapason = diaposonCallMyThreeBet.diaposon;

  let rangeSelection: RangeActionsVarant;

  if (maxCount + 1 === 1) {
    rangeSelection = statusRise === "big" ? "defendThreeBetAverage" : "open";
  } else if (maxCount + 1 === 2) {
    rangeSelection =
      statusRise === "little"
        ? "defendThreeBetLittle"
        : statusRise === "average"
        ? "defendThreeBetAverage"
        : statusRise === "big"
        ? "defendThreeBetBig"
        : statusRise === "max"
        ? "defendThreeBetMax"
        : "threeBet";
  } else if (maxCount + 1 === 3) {
    rangeSelection = "fourBet";
  } else {
    rangeSelection = maxCount >= 4 ? "allIn" : "open";
  }

  const rawRange = positionMaxBet
    ? POSITION_RANGES[positionMaxBet]?.[positionStatus]?.[positionStack]?.[
        rangeSelection
      ]
    : undefined;

  const diapasonCombination = rawRange
    ? rawRange.flatMap((range: string) => convertRangeToCards(range))
    : [];

  const diapason = mainPlayerCards
    ? filterCardsByMainPlayer(diapasonCombination, mainPlayerCards)
    : diapasonCombination;

  const finalFold = foldCardPercentage(defoldDiapason, diapason);

  // Извлекаем только equity из результата calculateEquity
  const equityResult =
    mainPlayerCards && diapason.length > 0
      ? calculateEquity(mainPlayerCards, diapason)
      : { equity: 0 };

  const equityCallThreeBet =
    typeof equityResult === "number" ? equityResult : equityResult.equity ?? 0;

  console.log(
    "Fold percentage and diapason length22:",
    finalFold,
    diapason.length,
    equityCallThreeBet,
    maxCount
  );

  return {
    diaposon: diapason,
    fold: finalFold,
    equityCallThreeBet,
  };
};

export const protectionRangeMaxBetThreeBetMyThreeBet = (
  maxBetPlayers: PlayerDataTwo[],
  mainPlayerCards: string[],
  maxCount: number
): {
  diaposon: string[][];
  fold: number;
  equityThreeBet: number;
} => {
  const diaposonCallMyThreeBet = getLongestCardsDiaposon(
    maxBetPlayers,
    mainPlayerCards
  );

  const positionStatus = diaposonCallMyThreeBet.status;
  const positionStack = diaposonCallMyThreeBet.stack;
  const positionMaxBet = diaposonCallMyThreeBet.position;
  const defoldDiapason = diaposonCallMyThreeBet.diaposon;

  let rangeSelection: RangeActionsVarant;

  if (maxCount === 0) {
    rangeSelection = "threeBet";
  } else if (maxCount === 1) {
    rangeSelection = "fourBet";
  } else if (maxCount === 2) {
    rangeSelection = "allIn";
  } else {
    rangeSelection = maxCount >= 2 ? "allIn" : "allIn";
  }

  const rawRange = positionMaxBet
    ? POSITION_RANGES[positionMaxBet]?.[positionStatus]?.[positionStack]?.[
        rangeSelection
      ]
    : undefined;

  const diapasonCombination = rawRange
    ? rawRange.flatMap((range: string) => convertRangeToCards(range))
    : [];

  const diapason = mainPlayerCards
    ? filterCardsByMainPlayer(diapasonCombination, mainPlayerCards)
    : diapasonCombination;

  const finalFold = foldCardPercentage(defoldDiapason, diapason);

  // Извлекаем только equity из результата calculateEquity
  const equityResult =
    mainPlayerCards && diapason.length > 0
      ? calculateEquity(mainPlayerCards, diapason)
      : { equity: 0 };

  const equityThreeBet =
    typeof equityResult === "number" ? equityResult : equityResult.equity ?? 0;

  return {
    diaposon: diapason,
    fold: finalFold,
    equityThreeBet,
  };
};
