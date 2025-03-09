export const suits = ["пика", "черва", "трефа", "буба"];
export const values = [
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

// Создаем массив всех карт
export const allCards = suits.flatMap((suit) =>
  values.map((value) => `${value}${suit}`)
);

const allTwoCardCombinations: string[][] = [];

for (let i = 0; i < allCards.length; i++) {
  for (let j = i + 1; j < allCards.length; j++) {
    allTwoCardCombinations.push([allCards[i], allCards[j]]);
  }
}

// console.log("Все комбинации карт:", allTwoCardCombinations);

export const convertRangeToCards = (range: string): string[][] => {
  const value1 = range[0]; // Первый номинал
  const value2 = range[1]; // Второй номинал
  const isSuited = range[2] === "s"; // Сьютная рука
  const isOffsuit = range[2] === "o"; // Несьютная рука

  const combinations: string[][] = [];

  if (value1 === value2) {
    // Пары (например, "AA", "KK")
    for (let i = 0; i < suits.length; i++) {
      for (let j = i + 1; j < suits.length; j++) {
        combinations.push([`${value1}${suits[i]}`, `${value2}${suits[j]}`]);
      }
    }
  } else if (isSuited) {
    // Сьютные руки (например, "AKs")
    for (const suit of suits) {
      combinations.push([`${value1}${suit}`, `${value2}${suit}`]);
    }
  } else if (isOffsuit) {
    // Несьютные руки (например, "AKo")
    for (const suit1 of suits) {
      for (const suit2 of suits) {
        if (suit1 !== suit2) {
          combinations.push([`${value1}${suit1}`, `${value2}${suit2}`]);
        }
      }
    }
  }

  return combinations;
};
