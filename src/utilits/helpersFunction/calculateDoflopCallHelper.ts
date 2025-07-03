import {
  DiscardedPercentage,
  TypeStatusRise,
  PlayerData,
  PlayerStack,
  PlayerStatus,
} from "../../components/type";
import { POSITION_RANGES } from "../../constants/pozition_ranges";
import { convertRangeToCards } from "../allСombinations/allTwoCardCombinations";
import { filterCardsByMainPlayer } from "../foldHelpers";

export const findPositionWithMostCombinations = (
  discardedPercentages: DiscardedPercentage[] | null | undefined
): {
  result: { position: string; cards: string[][] };
  cards: string[][];
} => {
  if (!discardedPercentages || discardedPercentages.length === 0) {
    return {
      result: { position: "Unknown", cards: [] },
      cards: [],
    };
  }

  const validPositions = discardedPercentages.filter(
    (dp) => dp.action !== "fold"
  );

  if (validPositions.length === 0) {
    const maxByCards = discardedPercentages.reduce((max, current) => {
      return current.cards.length > max.cards.length ? current : max;
    }, discardedPercentages[0]);
    return {
      result: {
        position: maxByCards.position,
        cards: maxByCards.cards,
      },
      cards: maxByCards.cards,
    };
  }

  let candidates = validPositions.filter((vp) => vp.action === "raise");

  if (candidates.length === 0) {
    candidates = validPositions.filter((vp) => vp.action === "call");
  }

  let selected: DiscardedPercentage;

  if (candidates.length > 0) {
    const parseBet = (bet: string | null): number => {
      if (!bet) return 0;
      return parseFloat(bet.replace("BB", "")) || 0;
    };

    const maxBet = Math.max(...candidates.map((vp) => parseBet(vp.bet)));

    const maxBetCandidates = candidates.filter(
      (vp) => parseBet(vp.bet) === maxBet
    );

    selected = maxBetCandidates.reduce((max, current) => {
      return current.cards.length > max.cards.length ? current : max;
    }, maxBetCandidates[0]);
  } else {
    selected = discardedPercentages.reduce((max, current) => {
      return current.cards.length > max.cards.length ? current : max;
    }, discardedPercentages[0]);
  }

  return {
    result: { position: selected.position, cards: selected.cards },
    cards: selected.cards,
  };
};

export const protectionRange = (
  positionMulti: string[],
  infoPlayers: { [key: string]: PlayerData },
  mainPlayerCards: string[],
  maxCount: number,
  statusRise: TypeStatusRise
): { position: string; cards: string[][] }[] => {
  return positionMulti.map((pos) => {
    const stack: PlayerStack = infoPlayers[pos].stack;
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

    return { position: pos, cards };
  });
};

export const doflopCallThreeBet = (
  positionMulti: string[],
  infoPlayers: { [key: string]: PlayerData },
  mainPlayerCards: string[],
  maxCount: number
): { position: string; cards: string[][] }[] => {
  return positionMulti.map((pos) => {
    const stack: PlayerStack = infoPlayers[pos].stack;
    const positionRanges = POSITION_RANGES[pos];
    const status: PlayerStatus = infoPlayers[pos]?.status || "active";

    let rangeSelection: string;

    if (maxCount === 0) {
      rangeSelection = "open";
    } else if (maxCount === 1) {
      rangeSelection = "threeBet";
    } else if (maxCount === 2) {
      rangeSelection = "fourBet";
    } else if (maxCount >= 3) {
      rangeSelection = "allIn";
    } else {
      rangeSelection = "allIn"; // Для maxCount < 1 или других
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

    return { position: pos, cards };
  });
};

export const doflopCallMultiPot = (
  positionMulti: string[],
  infoPlayers: { [key: string]: PlayerData },
  mainPlayerCards: string[],
  maxCount: number
): { position: string; cards: string[][] }[] => {
  return positionMulti.map((pos) => {
    const stack: PlayerStack = infoPlayers[pos].stack;
    const positionRanges = POSITION_RANGES[pos];
    const status: PlayerStatus = infoPlayers[pos]?.status || "active";

    let rangeSelection: string;

    if (maxCount === 0) {
      rangeSelection = "open";
    } else if (maxCount === 1) {
      rangeSelection = "threeBet";
    } else if (maxCount === 2) {
      rangeSelection = "fourBet";
    } else if (maxCount >= 3) {
      rangeSelection = "allIn";
    } else {
      rangeSelection = "allIn"; // Для maxCount < 1 или других
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

    return { position: pos, cards };
  });
};

export const calculateDiscardedPercentage = (
  intermediatePositions: { position: string; diapason: string[][] }[],
  cardsInfoPlayers: { position: string; cards: string[][] }[],
  infoPlayers: { [key: string]: PlayerData }
): {
  discardedPercentages: {
    position: string;
    bet: string | null;
    action: string;
    discardedPercentage: number;
    cards: string[][];
  }[];
  averageDiscardedPercentage: number;
} => {
  const discardedPercentages = intermediatePositions.map(
    ({ position, diapason }) => {
      // Находим соответствующие cards для позиции
      const playerCards =
        cardsInfoPlayers.find((p) => p.position === position)?.cards || [];

      // Преобразуем комбинации в строки для сравнения (например, ['As', 'Ad'] → 'AsAd')
      const diapasonSet = new Set(diapason.map((combo) => combo.join("")));
      const cardsSet = new Set(playerCards.map((combo) => combo.join("")));

      // Подсчитываем комбинации, которые есть в diapason, но отсутствуют в cards
      let discardedCount = 0;
      for (const combo of diapasonSet) {
        if (!cardsSet.has(combo)) {
          discardedCount++;
        }
      }

      // Вычисляем процент скинутых комбинаций с округлением до двух знаков
      const discardedPercentage =
        diapason.length > 0
          ? Number(((discardedCount / diapason.length) * 100).toFixed(2))
          : 0;

      const bet = infoPlayers[position].bet;
      const action = infoPlayers[position].action;
      return { position, bet, action, discardedPercentage, cards: playerCards };
    }
  );

  // Вычисляем средний процент скинутых комбинаций с округлением до двух знаков
  const totalDiscardedPercentage = discardedPercentages.reduce(
    (sum, { discardedPercentage }) => sum + discardedPercentage,
    0
  );
  const averageDiscardedPercentage =
    discardedPercentages.length > 0
      ? Number(
          (totalDiscardedPercentage / discardedPercentages.length).toFixed(2)
        )
      : 0;

  // Логирование для отладки
  console.log("calculateDiscardedPercentage result:", {
    intermediatePositions: intermediatePositions.map(
      ({ position, diapason }) => ({
        position,
        diapasonLength: diapason.length,
      })
    ),
    cardsInfoPlayers: cardsInfoPlayers.map(({ position, cards }) => ({
      position,
      cardsLength: cards.length,
    })),
    discardedPercentages,
    averageDiscardedPercentage,
  });

  return { discardedPercentages, averageDiscardedPercentage };
};
