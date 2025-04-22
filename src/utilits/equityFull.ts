export const equityFull = (
  range1: string[][],
  range2: string[][],
  selectedCards: string[] = [],
  equity1: number,
  equity2: number,
  totalCountSum1: number,
  totalCountSum2: number
): number | null => {
  // Функция для проверки, являются ли карты одномастными
  const isSuited = (cards: string[]): boolean => {
    if (cards.length < 2) return false;
    const suits = cards.map((card) => card.slice(1)); // Берем масть, начиная со второго символа
    return new Set(suits).size === 1; // Одномастные, если все масти одинаковые
  };

  // Функция для проверки, находятся ли карты рядом по рангу
  const isConsecutive = (cards: string[]): boolean => {
    if (cards.length < 2) return false;
    const ranks = "23456789TJQKA"; // Порядок рангов
    const cardRanks = cards.map((card) => ranks.indexOf(card[0])); // Индекс ранга
    return Math.abs(cardRanks[0] - cardRanks[1]) === 1; // Рядом, если разница между индексами равна 1
  };

  // Функция для проверки, является ли рука карманной парой
  const isPocketPair = (cards: string[]): boolean => {
    if (cards.length < 2) return false;
    return cards[0][0] === cards[1][0]; // Карманная пара, если ранги одинаковые
  };

  // Функция для проверки, есть ли пробел между картами
  const hasGap = (cards: string[]): boolean => {
    if (cards.length < 2) return false;
    const ranks = "23456789TJQKA"; // Порядок рангов
    const cardRanks = cards.map((card) => ranks.indexOf(card[0])); // Индекс ранга
    return Math.abs(cardRanks[0] - cardRanks[1]) > 1; // Пробел, если разница между индексами больше 1
  };

  // Проверяем размеры диапазонов
  console.log("Initial range1 length:", range1.length);
  console.log("Initial range2 length:", range2.length);
  console.log("Filtered range1 length (totalCountSum1):", totalCountSum1);
  console.log("Filtered range2 length (totalCountSum2):", totalCountSum2);

  // Рассчитываем заблокированные комбинации
  const blockedCombos1 = range1.length - totalCountSum1;
  const blockedCombos2 = range2.length - totalCountSum2;
  console.log("Blocked combos for range1:", blockedCombos1);
  console.log("Blocked combos for range2:", blockedCombos2);

  // Рассчитываем процент от 1326 комбинаций
  const totalCombinations = 1326;
  const percentageRange1 = (totalCountSum1 / totalCombinations) * 100;
  const percentageRange2 = (totalCountSum2 / totalCombinations) * 100;
  console.log(
    "Percentage of range1 from 1326:",
    percentageRange1.toFixed(2) + "%"
  );
  console.log(
    "Percentage of range2 from 1326:",
    percentageRange2.toFixed(2) + "%"
  );

  let coff: number; // Объявляем coff без начального значения, так как оно всегда переопределяется
  const averageEquity = (equity1 / 100) * (equity2 / 100);

  // Определяем характеристики выбранных карт
  const suited = isSuited(selectedCards);
  const consecutive = isConsecutive(selectedCards);
  const pocketPair = isPocketPair(selectedCards);
  const gap = hasGap(selectedCards);

  // Логика для расчета coff с учетом характеристик карт
  if (pocketPair) {
    // Карманная пара
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0037;

    if (averageEquity < 0.2) {
      coff = 1.2;
      const coffIncrement = 0.005;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.08;
      const coffIncrement = 0.005;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (suited && consecutive) {
    // Одномастные коннекторы
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0042;

    if (averageEquity < 0.13) {
      coff = 1.5;
      const coffIncrement = 0.01;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.2;
      const coffIncrement = 0.006;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.2;
      const coffIncrement = 0.004;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (!suited && consecutive) {
    // Разномастные коннекторы
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0042;

    if (averageEquity < 0.13) {
      coff = 1.5;
      const coffIncrement = 0.006;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.25;
      const coffIncrement = 0.0055;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.15;
      const coffIncrement = 0.0045;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (suited && gap) {
    // Одномастные карты с пробелом
    coff = 1.01;
    const startEquity = 0.75;
    const step = 0.01;
    const coffIncrement = 0.0042;

    if (averageEquity < 0.13) {
      coff = 1.4;
      const coffIncrement = 0.01;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.17;
      const coffIncrement = 0.0055;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.1;
      const coffIncrement = 0.0035;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else if (!suited && gap) {
    // Разномастные карты с пробелом
    coff = 1;
    const startEquity = 0.7;
    const step = 0.01;
    const coffIncrement = 0.0035;

    if (averageEquity < 0.13) {
      coff = 1.2;
      const coffIncrement = 0.017;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.2) {
      coff = 1.28;
      const coffIncrement = 0.0036;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < 0.3) {
      coff = 1.1;
      const coffIncrement = 0.0045;
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    } else if (averageEquity < startEquity) {
      const equityDifference = (startEquity - averageEquity) / step;
      coff += equityDifference * coffIncrement;
    }
  } else {
    // Случай, когда ни одно условие не выполнено (например, selectedCards пустой)
    coff = 1.0; // Устанавливаем нейтральный коэффициент
  }

  // Рассчитываем эквити без цикла
  const equity = equity1 * equity2 * coff;
  const finalEquity = equity / 100;

  console.log("Equity1:", equity1.toFixed(2) + "%");
  console.log("Equity2:", equity2.toFixed(2) + "%");
  console.log("Final equity:", finalEquity.toFixed(2) + "%");
  console.log("Coff:", coff);
  console.log("Средняя эквити:", (averageEquity * 100).toFixed(2) + "%");

  return finalEquity;
};
