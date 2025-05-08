import {
  calculateCoffTwoDiapazon,
  calculateCoffThreeDiapazon,
} from "./calculateCoff"; // Укажите правильный путь к файлу

interface OpponentRange {
  cards: string[][]; // Диапазон карт оппонента
  equity: number; // Эквити против главного игрока
  totalCountSum: number; // Общее количество комбинаций в диапазоне
}

export const equityFull = (
  opponentRanges: OpponentRange[], // Массив диапазонов оппонентов
  selectedCards: string[] = [] // Карты главного игрока
): number | null => {
  // Если нет диапазонов, возвращаем null
  if (opponentRanges.length === 0) return null;
  // Если один диапазон, возвращаем его эквити
  if (opponentRanges.length === 1) return opponentRanges[0].equity;

  // Логика для двух диапазонов
  if (opponentRanges.length === 2) {
    const range1 = opponentRanges[0].cards;
    const range2 = opponentRanges[1].cards;
    const equity1 = opponentRanges[0].equity;
    const equity2 = opponentRanges[1].equity;
    const totalCountSum1 = opponentRanges[0].totalCountSum;
    const totalCountSum2 = opponentRanges[1].totalCountSum;

    // Проверяем размеры диапазонов
    // console.log("Initial range1 length:", range1.length);
    // console.log("Initial range2 length:", range2.length);
    // console.log("Filtered range1 length (totalCountSum1):", totalCountSum1);
    // console.log("Filtered range2 length (totalCountSum2):", totalCountSum2);

    // Рассчитываем заблокированные комбинации
    const blockedCombos1 = range1.length - totalCountSum1;
    const blockedCombos2 = range2.length - totalCountSum2;
    // console.log("Blocked combos for range1:", blockedCombos1);
    // console.log("Blocked combos for range2:", blockedCombos2);

    // Рассчитываем процент от 1326 комбинаций
    const totalCombinations = 1326;
    const percentageRange1 = (totalCountSum1 / totalCombinations) * 100;
    const percentageRange2 = (totalCountSum2 / totalCombinations) * 100;
    // console.log(
    //   "Percentage of range1 from 1326:",
    //   percentageRange1.toFixed(2) + "%"
    // );
    // console.log(
    //   "Percentage of range2 from 1326:",
    //   percentageRange2.toFixed(2) + "%"
    // );

    const averageEquity = (equity1 / 100) * (equity2 / 100);

    // Рассчитываем коэффициент coff с помощью calculateCoffTwoDiapazon
    const coff = calculateCoffTwoDiapazon(selectedCards, averageEquity);

    // Рассчитываем эквити
    const equity = averageEquity * coff;
    const finalEquity = equity * 100;

    // console.log("Equity1:", equity1.toFixed(2) + "%");
    // console.log("Equity2:", equity2.toFixed(2) + "%");
    // console.log("Final equity:", finalEquity.toFixed(2) + "%");
    // console.log("Coff:", coff);
    // console.log("Средняя эквити:", (averageEquity * 100).toFixed(2) + "%");

    return finalEquity;
  }

  // Логика для трех диапазонов
  if (opponentRanges.length === 3) {
    const range1 = opponentRanges[0].cards;
    const range2 = opponentRanges[1].cards;
    const range3 = opponentRanges[2].cards;
    const equity1 = opponentRanges[0].equity;
    const equity2 = opponentRanges[1].equity;
    const equity3 = opponentRanges[2].equity;
    const totalCountSum1 = opponentRanges[0].totalCountSum;
    const totalCountSum2 = opponentRanges[1].totalCountSum;
    const totalCountSum3 = opponentRanges[2].totalCountSum;

    // Проверяем размеры диапазонов
    // console.log("Initial range1 length:", range1.length);
    // console.log("Initial range2 length:", range2.length);
    // console.log("Initial range3 length:", range3.length);
    // console.log("Filtered range1 length (totalCountSum1):", totalCountSum1);
    // console.log("Filtered range2 length (totalCountSum2):", totalCountSum2);
    // console.log("Filtered range3 length (totalCountSum3):", totalCountSum3);

    // Рассчитываем заблокированные комбинации
    const blockedCombos1 = range1.length - totalCountSum1;
    const blockedCombos2 = range2.length - totalCountSum2;
    const blockedCombos3 = range3.length - totalCountSum3;
    // console.log("Blocked combos for range1:", blockedCombos1);
    // console.log("Blocked combos for range2:", blockedCombos2);
    // console.log("Blocked combos for range3:", blockedCombos3);

    // Рассчитываем процент от 1326 комбинаций
    const totalCombinations = 1326;
    const percentageRange1 = (totalCountSum1 / totalCombinations) * 100;
    const percentageRange2 = (totalCountSum2 / totalCombinations) * 100;
    const percentageRange3 = (totalCountSum3 / totalCombinations) * 100;
    // console.log(
    //   "Percentage of range1 from 1326:",
    //   percentageRange1.toFixed(2) + "%"
    // );
    // console.log(
    //   "Percentage of range2 from 1326:",
    //   percentageRange2.toFixed(2) + "%"
    // );
    // console.log(
    //   "Percentage of range3 from 1326:",
    //   percentageRange3.toFixed(2) + "%"
    // );

    const averageEquity = (equity1 / 100) * (equity2 / 100) * (equity3 / 100);

    // Рассчитываем коэффициент coff с помощью calculateCoffThreeDiapazon
    const coff = calculateCoffThreeDiapazon(selectedCards, averageEquity);

    // Рассчитываем эквити
    const equity = averageEquity * coff;
    const finalEquity = equity * 100;

    // console.log("Equity1:", equity1.toFixed(2) + "%");
    // console.log("Equity2:", equity2.toFixed(2) + "%");
    // console.log("Equity3:", equity3.toFixed(2) + "%");
    // console.log("Final equity:", finalEquity.toFixed(2) + "%");
    // console.log("Coff:", coff);
    // console.log("Средняя эквити:", (averageEquity * 100).toFixed(2) + "%");

    return finalEquity;
  }

  // Логика для четырех и более диапазонов
  // Перемножаем эквити всех диапазонов
  const combinedEquity = opponentRanges.reduce((product, range) => {
    return product * (range.equity / 100); // Нормализуем эквити в [0, 1]
  }, 1);

  // Преобразуем обратно в проценты
  const finalEquity = combinedEquity * 100;

  // Ограничиваем эквити в диапазоне [0, 100]
  const clampedEquity = Math.min(Math.max(finalEquity, 0), 100);

  // console.log("Combined equity:", clampedEquity.toFixed(2) + "%");

  return clampedEquity;
};
