import { equityTable } from "../constants/equityTable";

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

export const calculateEquityWithoutBlockers = (
  selectedCards: string[],
  villainRange: string[][]
): { equity: number | null; totalCountSum: number } => {
  // console.log("Raw selectedCards:", selectedCards);
  if (villainRange.length === 0) {
    return { equity: null, totalCountSum: 0 };
  }

  const selectedHand = formatHand(selectedCards);
  // console.log("Selected hand:", selectedHand);

  // НЕ исключаем руку героя, чтобы получить полный диапазон (1326 комбинаций)
  const comboCount: Record<string, number> = {};
  const uniqueHands = new Set(villainRange.map(formatHand));
  for (const villainHand of uniqueHands) {
    const isSuited = villainHand.endsWith("s");
    if (villainHand.length === 2) {
      comboCount[villainHand] = 6; // Пары
    } else if (isSuited) {
      comboCount[villainHand] = 4; // Одномастные
    } else {
      comboCount[villainHand] = 12; // Разномастные
    }
  }

  let totalEquity = 0;
  let totalCombinations = 0;

  for (const villainHand in comboCount) {
    const count = comboCount[villainHand];
    const key1 = `${selectedHand} vs ${villainHand}`;
    const key2 = `${villainHand} vs ${selectedHand}`;

    const equityValue = equityTable[key1]?.hand1 ?? equityTable[key2]?.hand2;
    if (equityValue === undefined) {
      console.warn(`No equity data for ${key1} or ${key2}`);
      continue;
    }

    totalEquity += equityValue * count;
    totalCombinations += count;
  }

  const totalCountSum = Object.values(comboCount).reduce(
    (sum, count) => sum + count,
    0
  );

  if (totalCombinations === 0) {
    return { equity: null, totalCountSum };
  }

  const calculatedEquity = totalEquity / totalCombinations;
  // console.log("Total combinations:", totalCombinations);
  // console.log("Total equity:", totalEquity);
  // console.log("Calculated equity:", calculatedEquity);
  // console.log("Total count sum:", totalCountSum);

  return { equity: calculatedEquity, totalCountSum };
};
