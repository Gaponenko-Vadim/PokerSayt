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
  console.log("selectedHand:", selectedHand);
  console.log("villainRange length:", villainRange.length);
  console.log("villainRange sample:", JSON.stringify(villainRange.slice(0, 5)));

  const selectedRanks = selectedCards.map((card) => card[0]);
  const selectedCardsSet = new Set(selectedCards);

  // Сначала считаем "сырые" комбинации без множителей
  const comboCountRaw: Record<string, number> = {};
  for (const villainCombo of villainRange) {
    if (villainCombo.some((card) => selectedCardsSet.has(card))) {
      console.log(
        `Skipping ${JSON.stringify(villainCombo)} due to card overlap`
      );
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
        : [villainHand[0], villainHand[1]]; // Suited/off-suited, например "T2"
    const isSuited = villainHand.endsWith("s"); // Проверяем, suited ли рука

    // Сравниваем ранги напрямую, учитывая количество совпадений
    const overlapCount = villainRanks.filter((rank) =>
      selectedRanks.includes(rank)
    ).length;

    console.log(
      `Applying multiplier to ${villainHand}, rawCount: ${rawCount}, overlapCount: ${overlapCount}, isSuited: ${isSuited}`
    );

    if (overlapCount === 2) {
      comboCount[villainHand] = 1; // Фиксированно 1 для полного пересечения
      console.log(`Set ${villainHand} to 1 (full overlap)`);
    } else if (overlapCount === 1) {
      if (isSuited) {
        comboCount[villainHand] = 2; // Фиксированно 2 для suited рук с частичным пересечением
        console.log(`Set ${villainHand} to 2 (partial overlap, suited)`);
      } else {
        comboCount[villainHand] = rawCount; // Для off-suited рук сохраняем rawCount
        console.log(
          `Kept ${villainHand} as is (partial overlap, off-suited), count: ${comboCount[villainHand]}`
        );
      }
    } else {
      comboCount[villainHand] = rawCount; // Оставляем как есть для нет пересечений
      console.log(
        `Kept ${villainHand} as is (no overlap), count: ${comboCount[villainHand]}`
      );
    }
  }

  console.log("Final comboCount:", JSON.stringify(comboCount));

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
      console.log(
        `Key: ${key1}, Equity: ${equityValue}, Count: ${count}, Subtotal: ${
          equityValue * count
        }`
      );
    } else {
      console.warn(`No equity data for ${key1} or ${key2}`);
    }
  }

  console.log("totalEquity:", totalEquity);
  console.log("totalCombinations:", totalCombinations);

  if (totalCombinations === 0) return null;

  const calculatedEquity = totalEquity / totalCombinations;
  console.log("calculatedEquity:", calculatedEquity);

  return calculatedEquity;
};
