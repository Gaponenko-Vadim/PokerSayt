import { filterCardsByMainPlayer } from "./foldHelpers";
import { full } from "../constants/positionsRanges8maxMtt";
import { PlayerData, PlayerStack } from "../components/type";
import { POSITION_RANGES } from "../constants/pozition_ranges";
import { convertRangeToCards } from "./allСombinations/allTwoCardCombinations";
import { PlayerStatus, TypeStatusRise } from "../components/type";

const protectionRange = (
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

const calculateDiscardedPercentage = (
  intermediatePositions: { position: string; diapason: string[][] }[],
  cardsInfoPlayers: { position: string; cards: string[][] }[]
): {
  discardedPercentages: {
    position: string;
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

      return { position, discardedPercentage, cards: playerCards };
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

export const calculateDoflopCall = (
  mainPlayerCards: string[],
  equity: number,
  sumBet: number,
  mainPlayerBet: string | null | undefined,
  positionMulti: string[],
  maxBet: number,
  infoPlayers: { [key: string]: PlayerData },
  maxCount: number,
  statusRise: TypeStatusRise
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
    return { position: players.position, cards: cards };
  });

  const foldCall =
    maxCount != 0
      ? calculateDiscardedPercentage(intermediatePositions, range)
      : calculateDiscardedPercentage(intermediatePositions, cardsInfoPlayers);

  const ev1stage =
    (1 - foldCall.averageDiscardedPercentage / 100) *
    (equityDo1 * (sumBet + mainBet) - (maxBet - mainBet));
  // Логирование для отладки

  console.log(
    "fold",
    foldCall,
    "mainPlayerCard",
    mainPlayerCards,
    "equity",
    equityDo1,
    "sumBet",
    sumBet,
    "mainPlayerBet",
    mainBet,
    "positionMulti",
    positionMulti,
    "maxBet",
    maxBet,
    intermediatePositions,
    " maxCount",
    maxCount,
    "cardsCall",
    cardsInfoPlayers,
    "stavka",
    range,
    "sfdaf",
    foldCall.discardedPercentages
  );
  return ev1stage;
};
