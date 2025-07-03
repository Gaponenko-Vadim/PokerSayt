import { full } from "../constants/positionsRanges8maxMtt";
import { POSITION_RANGES } from "../constants/pozition_ranges";
import { convertRangeToCards } from "./allСombinations/allTwoCardCombinations";
import { PlayerStatus } from "../components/type";
import { calculateEquity } from "./allСombinations/calculateEquity";

interface PlayerData {
  position: string;
  bet: string | null;
  cards: string[][];
  status: string;
  stackSize: number;
  stack: "middle" | "little" | "ultraShort" | "big";
  count: number;
}

// Определяет позиции за спиной главного игрока

// Рассчитывает проценты фолда для позиций за спиной
export function calculateFoldPercentagesBehind(
  positionsBehind: string[],
  playersData: PlayerData[],
  totalCombos: number
): { [key: string]: number[] } {
  const raiseSizes = ["little", "average", "big", "max"] as const;
  const foldPercentagesBehind: { [key: string]: number[] } = {
    little: [],
    average: [],
    big: [],
    max: [],
  };

  positionsBehind.forEach((position) => {
    const player =
      playersData.find((p) => p.position === position) ||
      ({
        position,
        status: "standard",
        stack: "middle",
        count: 1,
      } as PlayerData);

    const positionRanges = POSITION_RANGES[position];
    const range = positionRanges?.[player.status as PlayerStatus];
    raiseSizes.forEach((raiseSize) => {
      let defendOpenRaw: string[] | "full" | undefined;
      switch (raiseSize) {
        case "little":
          defendOpenRaw = range?.[player.stack]?.defendThreeBetLittle;
          break;
        case "average":
          defendOpenRaw = range?.[player.stack]?.defendThreeBetAverage;
          break;
        case "big":
          defendOpenRaw = range?.[player.stack]?.defendThreeBetBig;
          break;
        case "max":
          defendOpenRaw = range?.[player.stack]?.defendThreeBetMax;
          break;
      }

      const defendOpenRange: string[] =
        defendOpenRaw === full ? full : defendOpenRaw || [];
      const defendCards: string[][] = defendOpenRange.flatMap((hand) =>
        convertRangeToCards(hand)
      );
      const defendCombos = defendCards.length;
      const continuationPercentage = (defendCombos / totalCombos) * 100;
      const foldPercentage = 100 - continuationPercentage;

      foldPercentagesBehind[raiseSize].push(foldPercentage);
    });
  });

  return foldPercentagesBehind;
}

// Рассчитывает P(all fold) для каждого размера рейза
export function calculatePAllFold(foldPercentagesBehind: {
  [key: string]: number[];
}): { [key: string]: number } {
  const raiseSizes = ["little", "average", "big", "max"] as const;
  const pAllFold: { [key: string]: number } = {};

  raiseSizes.forEach((raiseSize) => {
    pAllFold[raiseSize] =
      foldPercentagesBehind[raiseSize].length === 0
        ? 1
        : foldPercentagesBehind[raiseSize].reduce(
            (acc, foldPercentage) => acc * (foldPercentage / 100),
            1
          );
  });

  return pAllFold;
}

// Фильтрует комбинации, исключая карты главного игрока
export function filterCardsByMainPlayer(
  cards: string[][],
  mainPlayer: string[]
): string[][] {
  return cards.filter(
    (cardPair) => !cardPair.some((card) => mainPlayer.includes(card))
  );
}

// Рассчитывает диапазон защиты, процент фолда и эквити
export function calculateDefendRangeAndEquity(
  player: PlayerData,
  mainPlayer: string[],
  raiseSize: string,
  openCombos: number
): {
  foldPercentage: number;
  defendCards: string[][];
  defendRange: string[];
  rangeType: string;
  equityVsDefend: number | null;
} {
  const positionRanges = POSITION_RANGES[player.position];
  const range =
    positionRanges?.[player.status as PlayerStatus] || positionRanges?.standard;

  let defendOpenRaw: string[] | "full" | undefined;
  let rangeType: string = "3-бет";

  if (player.count === 1) {
    switch (raiseSize) {
      case "little":
        defendOpenRaw = range?.[player.stack]?.defendThreeBetLittle;
        rangeType = "3-бет маленький";
        break;
      case "average":
        defendOpenRaw = range?.[player.stack]?.defendThreeBetAverage;
        rangeType = "3-бет средний";
        break;
      case "big":
        defendOpenRaw = range?.[player.stack]?.defendThreeBetBig;
        rangeType = "3-бет большой";
        break;
      case "max":
        defendOpenRaw = range?.[player.stack]?.defendThreeBetMax;
        rangeType = "3-бет олл-ин";
        break;
    }
  } else if (player.count === 2) {
    defendOpenRaw = range?.[player.stack]?.fourBet;
    rangeType = "4-бет";
  } else if (player.count > 2) {
    defendOpenRaw = range?.[player.stack]?.allIn;
    rangeType = "олл-ин";
  } else {
    defendOpenRaw = range?.[player.stack]?.defend_open;
    rangeType = "колл";
  }

  const defendOpenRange: string[] =
    defendOpenRaw === "full" ? full : defendOpenRaw || [];
  let defendCards: string[][] = [];
  let defendRange: string[] = [];
  let foldPercentage: number = 0;
  let equityVsDefend: number | null = null;

  if (defendOpenRange.length === 0) {
    foldPercentage = 100;
    equityVsDefend = null;
  } else {
    defendCards = defendOpenRange.flatMap((hand: string) =>
      convertRangeToCards(hand)
    );
    const filteredDefendCards = filterCardsByMainPlayer(
      defendCards,
      mainPlayer
    );
    const defendCombos = filteredDefendCards.length;

    defendRange = defendOpenRange.filter((hand) => {
      const handCombos = convertRangeToCards(hand);
      return handCombos.some(
        (combo) => !combo.some((card) => mainPlayer.includes(card))
      );
    });

    foldPercentage =
      openCombos > 0 ? ((openCombos - defendCombos) / openCombos) * 100 : 0;

    if (defendCombos > 0) {
      try {
        const result = calculateEquity(mainPlayer, filteredDefendCards);
        equityVsDefend = result.equity !== null ? result.equity * 100 : null;
      } catch (error) {
        console.error(`Ошибка в calculateEquity для ${rangeType}:`, error);
        equityVsDefend = null;
      }
    }
  }

  return {
    foldPercentage: parseFloat(foldPercentage.toFixed(2)),
    defendCards,
    defendRange,
    rangeType,
    equityVsDefend,
  };
}

// Рассчитывает процент и эквити для 4-бета
export function calculateFourBetMetrics(
  player: PlayerData,
  mainPlayer: string[],
  openCombos: number
): { fourBetPercentage: number; fourBetEquity: number | null } {
  const positionRanges = POSITION_RANGES[player.position];
  const range =
    positionRanges?.[player.status as PlayerStatus] || positionRanges?.standard;
  const fourBetRaw = range?.[player.stack]?.fourBet || [];
  const fourBetCards = fourBetRaw.flatMap((hand: string) =>
    convertRangeToCards(hand)
  );
  const filteredFourBetCards = filterCardsByMainPlayer(
    fourBetCards,
    mainPlayer
  );
  const fourBetCombos = filteredFourBetCards.length;

  const fourBetPercentage =
    openCombos > 0 ? (fourBetCombos / openCombos) * 100 : 0;

  let fourBetEquity: number | null = null;
  if (filteredFourBetCards.length > 0) {
    try {
      const result = calculateEquity(mainPlayer, filteredFourBetCards);
      fourBetEquity = result.equity !== null ? result.equity * 100 : null;
    } catch (error) {
      console.error("Ошибка в calculateEquity для fourBet:", error);
      fourBetEquity = null;
    }
  }

  return {
    fourBetPercentage: parseFloat(fourBetPercentage.toFixed(2)),
    fourBetEquity,
  };
}

// Формирует подсказку (hint)
export function generateHint(
  player: PlayerData,
  defendCards: string[][],
  openCombos: number,
  foldPercentage: number,
  equityVsDefend: number | null,
  fourBetEquity: number | null,
  rangeType: string,
  pAllFold: number
): string {
  if (defendCards.length >= openCombos) {
    return `Диапазон ${rangeType} для ${player.position} включает весь диапазон опена или шире (~${defendCards.length} комFundamentинаций). Оппонент ответит на ваш рейз со всеми руками. Эквити вашей руки: не применимо.`;
  }
  return `Если вы сделаете рейз, оппонент на ${
    player.position
  } сбросит ${foldPercentage.toFixed(
    2
  )}% рук из диапазона опена относительно диапазона ${rangeType}, учитывая вероятность фолда всех поздних позиций (${(
    pAllFold * 100
  ).toFixed(2)}%). Эквити вашей руки против диапазона продолжения: ${
    equityVsDefend ? equityVsDefend.toFixed(2) : "не применимо"
  }%. Эквити против 4-бет диапазона: ${
    fourBetEquity ? fourBetEquity.toFixed(2) : "не применимо"
  }%.`;
}
