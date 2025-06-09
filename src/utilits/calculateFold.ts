import {
  getPositionsBehind,
  calculateFoldPercentagesBehind,
  calculatePAllFold,
  filterCardsByMainPlayer,
  calculateDefendRangeAndEquity,
  calculateFourBetMetrics,
  generateHint,
} from "./foldHelpers";
interface EquityFoldResult {
  status: string;
  position: string;
  stackSize: number;
  stack: string;
  cards: string[][];
  defendCards: string[][];
  defendRange: string[];
  LittleFoldPercentage: number;
  AverageFoldPercentage: number;
  BigFoldPercentage: number;
  MaxFoldPercentage: number;
  LittleEquityVsDefend: number | null;
  AverageEquityVsDefend: number | null;
  BigEquityVsDefend: number | null;
  MaxEquityVsDefend: number | null;
  FourBetPercentage: number;
  FourBetEquity: number | null;
  hint: string;
}

interface PlayerData {
  position: string;
  bet: string | null;
  cards: string[][];
  status: string;
  stackSize: number;
  stack: "middle" | "little" | "ultraShort" | "big";
  count: number;
}

export const calculateFold = (
  playersData: PlayerData[],
  mainPlayer: string[],
  positionMainPlayer: string,
  fullPosition: string[]
): EquityFoldResult[] => {
  const totalCombos = 1326;
  const raiseSizes = ["little", "average", "big", "max"] as const;

  // Получаем позиции за спиной
  const positionsBehind = getPositionsBehind(positionMainPlayer, fullPosition);
  // console.log("Позиции за спиной:", positionsBehind);

  // Рассчитываем проценты фолда для позиций за спиной
  const foldPercentagesBehind = calculateFoldPercentagesBehind(
    positionsBehind,
    playersData,
    totalCombos
  );

  // Рассчитываем P(all fold)
  const pAllFold = calculatePAllFold(foldPercentagesBehind);
  // Object.keys(pAllFold).forEach((raiseSize) =>
  //   console.log(
  //     `P(all fold) для ${raiseSize}: ${(pAllFold[raiseSize] * 100).toFixed(2)}%`
  //   )
  // );

  return playersData.map((player) => {
    // Фильтруем комбинации опена
    const filteredOpenCards = filterCardsByMainPlayer(player.cards, mainPlayer);
    const openCombos = filteredOpenCards.length;

    // Инициализируем результаты
    const foldPercentages: { [key: string]: number } = {
      little: 0,
      average: 0,
      big: 0,
      max: 0,
    };
    const equityVsDefend: { [key: string]: number | null } = {
      little: null,
      average: null,
      big: null,
      max: null,
    };

    // Рассчитываем 4-бет метрики
    const { fourBetPercentage, fourBetEquity } = calculateFourBetMetrics(
      player,
      mainPlayer,
      openCombos
    );

    // Рассчитываем метрики для каждого размера рейза
    const raiseResults = raiseSizes.map((raiseSize) =>
      calculateDefendRangeAndEquity(player, mainPlayer, raiseSize, openCombos)
    );

    // Сохраняем результаты
    raiseSizes.forEach((raiseSize, index) => {
      foldPercentages[raiseSize] =
        raiseResults[index].foldPercentage * pAllFold[raiseSize];
      equityVsDefend[raiseSize] = raiseResults[index].equityVsDefend;
    });

    // Основной результат для little
    const currentResult = raiseResults[0]; // little
    const defendCards = currentResult.defendCards;
    const defendRange = currentResult.defendRange;
    const rangeType = currentResult.rangeType;

    // Формируем подсказку
    const hint = generateHint(
      player,
      defendCards,
      openCombos,
      foldPercentages["little"],
      equityVsDefend["little"],
      fourBetEquity,
      rangeType,
      pAllFold["little"]
    );

    return {
      status: player.status,
      position: player.position,
      stackSize: player.stackSize,
      stack: player.stack,
      cards: filteredOpenCards,
      defendCards,
      defendRange,
      LittleFoldPercentage: parseFloat(foldPercentages["little"].toFixed(2)),
      AverageFoldPercentage: parseFloat(foldPercentages["average"].toFixed(2)),
      BigFoldPercentage: parseFloat(foldPercentages["big"].toFixed(2)),
      MaxFoldPercentage: parseFloat(foldPercentages["max"].toFixed(2)),
      LittleEquityVsDefend: equityVsDefend["little"]
        ? parseFloat((equityVsDefend["little"] / 100).toFixed(2))
        : null,
      AverageEquityVsDefend: equityVsDefend["average"]
        ? parseFloat((equityVsDefend["average"] / 100).toFixed(2))
        : null,
      BigEquityVsDefend: equityVsDefend["big"]
        ? parseFloat((equityVsDefend["big"] / 100).toFixed(2))
        : null,
      MaxEquityVsDefend: equityVsDefend["max"]
        ? parseFloat((equityVsDefend["max"] / 100).toFixed(2))
        : null,
      FourBetPercentage: fourBetPercentage,
      FourBetEquity: fourBetEquity
        ? parseFloat((fourBetEquity / 100).toFixed(2))
        : null,
      hint,
    };
  });
};
