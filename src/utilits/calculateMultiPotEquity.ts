// src/utils/equityCalculations.ts

import { calculateEquity } from "./allСombinations/calculateEquity";
import { equityFull } from "./equityFull";

// Типы данных
export type OpponentRange = {
  cards: string[][];
  equity: number;
  totalCountSum: number;
  handDetails: Array<{
    hand: string;
    combinations: number;
    equity: number;
    contribution: number;
  }>;
};

export type ValidEquityResult = {
  equity: number;
  totalCountSum: number;
  handDetails: OpponentRange["handDetails"];
  cardsLength: number;
  cards: string[][];
  playerIndex: number;
};

/**
 * Рассчитывает эквити для мультипота
 * @param mainPlayerCards Карты главного игрока
 * @param opponentsData Данные оппонентов
 * @returns Среднее значение эквити или null если расчет невозможен
 */
export const calculateMultiPotEquity = (
  mainPlayerCards: string[],
  opponentsData: {
    cards: string[][];
    equity?: number | null;
  }[]
): number | null => {
  if (!mainPlayerCards || mainPlayerCards.length !== 2) {
    return null;
  }

  // Рассчитываем эквити для каждого оппонента
  const results = opponentsData.map((opponent, index) => {
    if (opponent.cards && opponent.cards.length > 0) {
      const equityResult =
        opponent.equity !== undefined
          ? { equity: opponent.equity, totalCountSum: 1, handDetails: [] }
          : calculateEquity(mainPlayerCards, opponent.cards);

      return {
        ...equityResult,
        cardsLength: opponent.cards.length,
        cards: opponent.cards,
        playerIndex: index,
      };
    }
    return null;
  });

  // Фильтруем валидные результаты
  const validResults = results.filter(
    (result): result is ValidEquityResult =>
      result !== null && result.equity !== null
  );

  if (validResults.length === 0) {
    return null;
  }

  if (validResults.length > 1) {
    // Подготовка данных для equityFull
    const opponentRanges: OpponentRange[] = validResults.map((result) => ({
      cards: result.cards,
      equity: result.equity,
      totalCountSum: result.totalCountSum,
      handDetails: result.handDetails,
    }));

    return equityFull(opponentRanges, mainPlayerCards);
  }

  // Для одного оппонента
  return validResults[0].equity;
};
