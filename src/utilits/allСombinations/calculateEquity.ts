import { equityTable } from "../../constants/equityTable";

const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

const formatHand = (cards: string[]): string => {
  const [card1, card2] = cards;
  const rank1 = card1[0];
  const rank2 = card2[0];
  const suit1 = card1.slice(1);
  const suit2 = card2.slice(1);

  if (rank1 === rank2) {
    return `${rank1}${rank2}`;
  }

  const isSuited = suit1 === suit2;
  if (values.indexOf(rank1) > values.indexOf(rank2)) {
    return isSuited ? `${rank1}${rank2}s` : `${rank1}${rank2}o`;
  }
  return isSuited ? `${rank2}${rank1}s` : `${rank2}${rank1}o`;
};

/**
 * Рассчитывает эквити выбранных карт против диапазона оппонента
 * @param selectedCards Выбранные карты игрока
 * @param villainRange Диапазон оппонента
 * @returns Процент эквити или null
 */
export const calculateEquity = (
  selectedCards: string[],
  villainRange: string[][]
): number | null => {
  const selectedHand = formatHand(selectedCards);
  // console.log("selectedHand:", selectedHand);
  // console.log("villainRange length:", villainRange.length);
  // console.log("villainRange sample:", JSON.stringify(villainRange.slice(0, 5)));

  const selectedRanks = selectedCards.map((card) => card[0]);
  const selectedCardsSet = new Set(selectedCards);
  const isSelectedHandSuited = selectedHand.endsWith("s"); // Проверяем, одномастная ли выбранная рука

  // Сначала считаем "сырые" комбинации без множителей
  const comboCountRaw: Record<string, number> = {};
  for (const villainCombo of villainRange) {
    if (villainCombo.some((card) => selectedCardsSet.has(card))) {
      // console.log(`Skipping ${JSON.stringify(villainCombo)} due to card overlap`);
      continue;
    }
    const villainHand = formatHand(villainCombo);
    comboCountRaw[villainHand] = (comboCountRaw[villainHand] || 0) + 1;
  }

  // Применяем множители
  const comboCount: Record<string, number> = {};
  for (const villainHand in comboCountRaw) {
    const rawCount = comboCountRaw[villainHand];
    const villainRanks =
      villainHand.length === 2
        ? [villainHand[0], villainHand[1]] // Пара, например "22"
        : [villainHand[0], villainHand[1]]; // Suited/off-suited, например "T2s" или "T2o"
    const isSuited = villainHand.endsWith("s"); // Проверяем, suited ли рука оппонента

    // Сравниваем ранги напрямую, учитывая количество совпадений
    const overlapCount = villainRanks.filter((rank) =>
      selectedRanks.includes(rank)
    ).length;

    // console.log(`Applying multiplier to ${villainHand}, rawCount: ${rawCount}, overlapCount: ${overlapCount}, isSuited: ${isSuited}`);

    // Проверка на одинаковые пары (например, AA vs AA)
    if (
      selectedHand.length === 2 && // Выбранная рука - пара
      villainHand.length === 2 && // Рука оппонента - пара
      selectedHand === villainHand // Обе пары одинаковы
    ) {
      comboCount[villainHand] = 1; // Устанавливаем 1 для одинаковых пар
      // console.log(`Set ${villainHand} to 1 (same pair vs same pair)`);
    }
    // Новая логика для разномастной руки игрока против пары с пересечением (1 или 2 карты)
    else if (
      !isSelectedHandSuited && // Выбранная рука разномастная (например, "32o", "AKo")
      villainHand.length === 2 && // Рука оппонента - пара (например, "33", "AA")
      (overlapCount === 1 || overlapCount === 2) // Пересечение по одной или двум картам
    ) {
      comboCount[villainHand] = 3; // Устанавливаем 3 для разномастной руки против пары с пересечением
      // console.log(`Set ${villainHand} to 3 (off-suited vs pair with one or two overlaps)`);
    }
    // Новая логика для пары против одномастной руки с пересечением по одной карте (QQ vs QJs)
    else if (
      selectedHand.length === 2 && // Выбранная рука - пара
      villainHand.length !== 2 && // Рука оппонента - не пара
      isSuited && // Рука оппонента одномастная
      overlapCount === 1 // Пересечение по одной карте
    ) {
      comboCount[villainHand] = 2; // Устанавливаем 2 для пары против одномастной руки с одним пересечением
      // console.log(`Set ${villainHand} to 2 (pair vs suited with one overlap)`);
    }
    // Новая логика для пары против разномастной руки с пересечением по одной карте (AA vs ATo)
    else if (
      selectedHand.length === 2 && // Выбранная рука - пара
      villainHand.length !== 2 && // Рука оппонента - не пара
      !isSuited && // Рука оппонента разномастная
      overlapCount === 1 // Пересечение по одной карте
    ) {
      comboCount[villainHand] = 6; // Устанавливаем 6 для пары против разномастной руки с одним пересечением
      // console.log(`Set ${villainHand} to 6 (pair vs off-suited with one overlap)`);
    }
    // Новая логика для разномастной руки против разномастной с полным совпадением рангов (AKo vs AKo)
    else if (
      !isSelectedHandSuited && // Выбранная рука разномастная
      !isSuited && // Рука оппонента разномастная
      overlapCount === 2 && // Полное совпадение рангов
      villainHand.slice(0, 2) === selectedHand.slice(0, 2) // Те же ранги (например, "AK")
    ) {
      comboCount[villainHand] = 7; // Устанавливаем 7 для AKo vs AKo
      // console.log(`Set ${villainHand} to 7 (off-suited vs same ranks off-suited)`);
    }
    // Новая логика для разномастной руки против одномастной с полным совпадением рангов (AKo vs AKs)
    else if (
      !isSelectedHandSuited && // Выбранная рука разномастная
      isSuited && // Рука оппонента одномастная
      overlapCount === 2 && // Полное совпадение рангов
      villainHand.slice(0, 2) === selectedHand.slice(0, 2) // Те же ранги (например, "AK")
    ) {
      comboCount[villainHand] = 2; // Устанавливаем 2 для AKo vs AKs
      // console.log(`Set ${villainHand} to 2 (off-suited vs same ranks suited)`);
    }
    // Новая логика для разномастной руки против разномастной с пересечением по одной карте (AKo vs AQo)
    else if (
      !isSelectedHandSuited && // Выбранная рука разномастная
      !isSuited && // Рука оппонента разномастная
      overlapCount === 1 // Пересечение по одной карте
    ) {
      comboCount[villainHand] = 9; // Устанавливаем 9 для AKo vs AQo
      // console.log(`Set ${villainHand} to 9 (off-suited vs off-suited with one overlap)`);
    }
    // Новая логика для разномастной руки против одномастной с пересечением по одной карте (AKo vs AQs)
    else if (
      !isSelectedHandSuited && // Выбранная рука разномастная
      isSuited && // Рука оппонента одномастная
      overlapCount === 1 // Пересечение по одной карте
    ) {
      comboCount[villainHand] = 3; // Устанавливаем 3 для AKo vs AQs
      // console.log(`Set ${villainHand} to 3 (off-suited vs suited with one overlap)`);
    }
    // Новая логика для AKs против AKo (те же ранги, но не одномастные)
    else if (
      isSelectedHandSuited &&
      !isSuited &&
      overlapCount === 2 && // Полное совпадение рангов
      villainHand.slice(0, 2) === selectedHand.slice(0, 2) // Те же ранги (например, "AK")
    ) {
      comboCount[villainHand] = 6; // Устанавливаем 6 для AKs vs AKo
      // console.log(`Set ${villainHand} to 6 (selected suited vs same ranks off-suited)`);
    }
    // Новая логика для AKs против AQo или KQo (одно пересечение, не одномастные)
    else if (
      isSelectedHandSuited &&
      !isSuited &&
      overlapCount === 1 // Одно пересечение
    ) {
      comboCount[villainHand] = 9; // Устанавливаем 9 для AKs vs AQo или KQo
      // console.log(`Set ${villainHand} to 9 (selected suited vs off-suited with one overlap)`);
    }
    // Существующая логика: если выбранная рука одномастная и есть пересечение
    else if (isSelectedHandSuited && overlapCount > 0) {
      comboCount[villainHand] = 3; // Устанавливаем 3 для AKs против любых других рук с пересечением
      // console.log(`Set ${villainHand} to 3 (selected suited with overlap)`);
    } else if (overlapCount === 1) {
      if (isSuited) {
        comboCount[villainHand] = 2; // Фиксированно 2 для suited рук с частичным пересечением
        // console.log(`Set ${villainHand} to 2 (partial overlap, suited)`);
      } else {
        comboCount[villainHand] = rawCount; // Для off-suited рук сохраняем rawCount
        // console.log(`Kept ${villainHand} as is (partial overlap, off-suited), count: ${comboCount[villainHand]}`);
      }
    } else {
      comboCount[villainHand] = rawCount; // Оставляем как есть для нет пересечений
      // console.log(`Kept ${villainHand} as is (no overlap), count: ${comboCount[villainHand]}`);
    }
  }

  // console.log("Final comboCount:", JSON.stringify(comboCount));

  let totalEquity = 0;
  let totalCombinations = 0;

  for (const villainHand in comboCount) {
    const count = comboCount[villainHand];
    const key1 = `${selectedHand} vs ${villainHand}`;
    const key2 = `${villainHand} vs ${selectedHand}`;

    const equityValue = equityTable[key1]?.hand1 || equityTable[key2]?.hand2;

    if (equityValue !== undefined) {
      totalEquity += equityValue * count;
      totalCombinations += count;
      // console.log(`Key: ${key1}, Equity: ${equityValue}, Count: ${count}, Subtotal: ${equityValue * count}`);
    } else {
      // console.warn(`No equity data for ${key1} or ${key2}`);
    }
  }

  // console.log("totalEquity:", totalEquity);
  // console.log("totalCombinations:", totalCombinations);

  if (totalCombinations === 0) return null;

  const calculatedEquity = totalEquity / totalCombinations;
  // console.log("calculatedEquity:", calculatedEquity);

  return calculatedEquity;
};
