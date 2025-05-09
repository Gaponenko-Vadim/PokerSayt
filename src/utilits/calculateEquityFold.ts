import { full } from "../constants/positionsRanges8maxMtt";
import { POSITION_RANGES } from "../constants/pozition_ranges";
import { convertRangeToCards } from "../utilits/allСombinations/allTwoCardCombinations";
import { PlayerStatus } from "../components/type";
import { calculateEquity } from "./allСombinations/calculateEquity";

// Интерфейсы
interface PlayerData {
  position: string;
  bet: string | null;
  cards: string[][]; // Диапазон опена
  status: string; // "tight", "standard", "weak"
  stackSize: number;
  stack: "middle" | "little" | "ultraShort" | "big";
  count: number; // Количество рейзов
}

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
  FourBetPercentage: number; // Процент fourBet от опена
  FourBetEquity: number | null; // Новое поле для эквити против fourBet
  hint: string;
}

export const calculateEquityFold = (
  playersData: PlayerData[],
  mainPlayer: string[],
  positionMainPlayer: string,
  fullPosition: string[]
): EquityFoldResult[] => {
  console.log("эквети фолд", playersData, "главный игрок", mainPlayer);

  const raiseSizes = ["little", "average", "big", "max"] as const;
  const totalCombos = 1326; // Общее количество комбинаций двух карт

  // Хранилище процентов фолда для positionsBehind
  const foldPercentagesBehind: { [key: string]: number[] } = {
    little: [],
    average: [],
    big: [],
    max: [],
  };

  // Определяем позиции, следующие за positionMainPlayer
  if (positionMainPlayer) {
    const standardOrder = [
      "UTG",
      "UTG+1",
      "MP",
      "MP+1",
      "HJ",
      "BT",
      "SB",
      "BB",
    ];
    const mainPlayerIndex = standardOrder.indexOf(positionMainPlayer);
    let positionsBehind: string[] = [];
    if (mainPlayerIndex >= 0) {
      positionsBehind = standardOrder
        .slice(mainPlayerIndex + 1)
        .filter((pos) => fullPosition.includes(pos));
    }
    console.log("Позиции за спиной:", positionsBehind);

    // Рассчитываем процент фолда для каждой позиции в positionsBehind
    positionsBehind.forEach((position) => {
      // Находим игрока на этой позиции или используем дефолтный
      const player =
        playersData.find((p) => p.position === position) ||
        ({
          position,
          status: "standard",
          stack: "middle",
          count: 1,
        } as PlayerData);

      const positionRanges = POSITION_RANGES[position];
      const range =
        positionRanges?.[player.status as PlayerStatus] ||
        positionRanges?.standard;

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
        // Не фильтруем по mainPlayer, используем полный диапазон
        const defendCombos = defendCards.length;

        const continuationPercentage = (defendCombos / totalCombos) * 100;
        const foldPercentage = 100 - continuationPercentage;

        // Сохраняем foldPercentage для позиции и raiseSize
        foldPercentagesBehind[raiseSize].push(foldPercentage);

        console.log(
          `Позиция: ${position}, Процент фолда для ${raiseSize}: ${foldPercentage.toFixed(
            2
          )}%`
        );
      });
    });
  }

  // Рассчитываем P(all fold) для каждого raiseSize
  const pAllFold: { [key: string]: number } = {};
  raiseSizes.forEach((raiseSize) => {
    if (foldPercentagesBehind[raiseSize].length === 0) {
      // Если нет позиций за спиной, P(all fold) = 1
      pAllFold[raiseSize] = 1;
    } else {
      // P(all fold) = произведение (foldPercentage / 100) для всех позиций
      pAllFold[raiseSize] = foldPercentagesBehind[raiseSize].reduce(
        (acc, foldPercentage) => acc * (foldPercentage / 100),
        1
      );
    }
    console.log(
      `P(all fold) для ${raiseSize}: ${(pAllFold[raiseSize] * 100).toFixed(2)}%`
    );
  });

  const result = playersData.map((player) => {
    // Удаляем из диапазона опена комбинации, содержащие карты главного игрока
    const filteredOpenCards = player.cards.filter(
      (cardPair) => !cardPair.some((card) => mainPlayer.includes(card))
    );
    const openCombos = filteredOpenCards.length;

    let hint: string = "";
    let defendCards: string[][] = [];
    let defendRange: string[] = [];
    let rangeType: string = "3-бет";

    // Получаем диапазон из POSITION_RANGES
    const positionRanges = POSITION_RANGES[player.position];
    const range =
      positionRanges?.[player.status as PlayerStatus] ||
      positionRanges?.standard;

    // Инициализируем проценты сброшенных карт и эквити
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

    // Рассчитываем процент fourBet от опена
    let fourBetPercentage: number = 0;
    const fourBetRaw = range?.[player.stack]?.fourBet || [];
    const fourBetCards = fourBetRaw.flatMap((hand: string) =>
      convertRangeToCards(hand)
    );
    // Фильтруем fourBet, исключая комбинации с картами главного игрока
    const filteredFourBetCards = fourBetCards.filter(
      (cardPair) => !cardPair.some((card) => mainPlayer.includes(card))
    );
    const fourBetCombos = filteredFourBetCards.length;
    // Рассчитываем процент fourBet от опена
    if (openCombos > 0) {
      fourBetPercentage = (fourBetCombos / openCombos) * 100;
    }

    // Рассчитываем эквити против fourBet
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

    // Рассчитываем foldPercentage и equityVsDefend для каждого размера 3-бета
    const raiseResults = raiseSizes.map((raiseSize) => {
      let foldPercentage: number = 0;
      let tempDefendCards: string[][] = [];
      let tempDefendRange: string[] = [];
      let tempRangeType: string = "3-бет";
      let tempEquityVsDefend: number | null = null;

      // Выбираем диапазон в зависимости от count
      let defendOpenRaw: string[] | "full" | undefined;
      if (player.count === 1) {
        switch (raiseSize) {
          case "little":
            defendOpenRaw = range?.[player.stack]?.defendThreeBetLittle;
            tempRangeType = "3-бет маленький";
            break;
          case "average":
            defendOpenRaw = range?.[player.stack]?.defendThreeBetAverage;
            tempRangeType = "3-бет средний";
            break;
          case "big":
            defendOpenRaw = range?.[player.stack]?.defendThreeBetBig;
            tempRangeType = "3-бет большой";
            break;
          case "max":
            defendOpenRaw = range?.[player.stack]?.defendThreeBetMax;
            tempRangeType = "3-бет олл-ин";
            break;
        }
      } else if (player.count === 2) {
        defendOpenRaw = range?.[player.stack]?.fourBet;
        tempRangeType = "4-бет";
      } else if (player.count > 2) {
        defendOpenRaw = range?.[player.stack]?.allIn;
        tempRangeType = "олл-ин";
      } else {
        defendOpenRaw = range?.[player.stack]?.defend_open;
        tempRangeType = "колл";
      }

      // Обрабатываем диапазон
      let defendOpenRange: string[];
      if (defendOpenRaw === full) {
        defendOpenRange = full;
      } else {
        defendOpenRange = defendOpenRaw || [];
      }

      // Обрабатываем пустой диапазон
      if (defendOpenRange.length === 0) {
        tempDefendCards = [];
        tempDefendRange = [];
        foldPercentage = 100;
        tempEquityVsDefend = null;
      } else {
        // Преобразуем диапазон в комбинации
        tempDefendCards = defendOpenRange.flatMap((hand: string) =>
          convertRangeToCards(hand)
        );

        // Удаляем комбинации, содержащие карты главного игрока
        const filteredDefendCards = tempDefendCards.filter(
          (cardPair) => !cardPair.some((card) => mainPlayer.includes(card))
        );
        const defendCombos = filteredDefendCards.length;

        // Формируем defendRange
        tempDefendRange = defendOpenRange.filter((hand) => {
          const handCombos = convertRangeToCards(hand);
          return handCombos.some(
            (combo) => !combo.some((card) => mainPlayer.includes(card))
          );
        });

        // Рассчитываем процент сброшенных комбинаций
        foldPercentage =
          openCombos > 0 ? ((openCombos - defendCombos) / openCombos) * 100 : 0;

        // Рассчитываем эквити против defendRange
        if (defendCombos > 0) {
          try {
            const result = calculateEquity(mainPlayer, filteredDefendCards);
            tempEquityVsDefend =
              result.equity !== null ? result.equity * 100 : null;
          } catch (error) {
            console.error(
              `Ошибка в calculateEquity для ${tempRangeType}:`,
              error
            );
            tempEquityVsDefend = null;
          }
        }
      }

      // Сохраняем foldPercentage и equityVsDefend
      foldPercentages[raiseSize] = parseFloat(foldPercentage.toFixed(2));
      equityVsDefend[raiseSize] = tempEquityVsDefend;

      return {
        raiseSize,
        foldPercentage: parseFloat(foldPercentage.toFixed(2)),
        defendCards: tempDefendCards,
        defendRange: tempDefendRange,
        rangeType: tempRangeType,
      };
    });

    // Корректируем foldPercentages, умножая на P(all fold)
    raiseSizes.forEach((raiseSize) => {
      foldPercentages[raiseSize] = parseFloat(
        (foldPercentages[raiseSize] * pAllFold[raiseSize]).toFixed(2)
      );
    });

    // Основной результат для little (по умолчанию)
    const currentResult =
      raiseResults.find((r) => r.raiseSize === "little") || raiseResults[0];

    // Устанавливаем параметры для текущего результата
    defendCards = currentResult.defendCards;
    defendRange = currentResult.defendRange;
    const foldPercentage = foldPercentages["little"];
    rangeType = currentResult.rangeType;

    // Устанавливаем подсказку (для little)
    if (defendCards.length >= openCombos) {
      foldPercentages["little"] = 0;
      equityVsDefend["little"] = null;
      hint = `Диапазон ${rangeType} для ${player.position} включает весь диапазон опена или шире (~${defendCards.length} комбинаций). Оппонент ответит на ваш рейз со всеми руками. Эквити вашей руки: не применимо.`;
    } else {
      hint = `Если вы сделаете рейз, оппонент на ${
        player.position
      } сбросит ${foldPercentage.toFixed(
        2
      )}% рук из диапазона опена относительно диапазона ${rangeType}, учитывая вероятность фолда всех поздних позиций (${(
        pAllFold["little"] * 100
      ).toFixed(2)}%). Эквити вашей руки против диапазона продолжения: ${
        equityVsDefend["little"]
          ? equityVsDefend["little"].toFixed(2)
          : "не применимо"
      }%. Эквити против 4-бет диапазона: ${
        fourBetEquity ? fourBetEquity.toFixed(2) : "не применимо"
      }%.`;
    }

    return {
      status: player.status,
      position: player.position,
      stackSize: player.stackSize,
      stack: player.stack,
      cards: filteredOpenCards,
      defendCards,
      defendRange,
      LittleFoldPercentage: foldPercentages["little"],
      AverageFoldPercentage: foldPercentages["average"],
      BigFoldPercentage: foldPercentages["big"],
      MaxFoldPercentage: foldPercentages["max"],
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
      FourBetPercentage: parseFloat(fourBetPercentage.toFixed(2)), // Процент fourBet от опена
      FourBetEquity: fourBetEquity
        ? parseFloat((fourBetEquity / 100).toFixed(2))
        : null, // Эквити против fourBet
      hint,
    };
  });

  return result;
};
