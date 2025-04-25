export const isSuited = (cards: string[]): boolean => {
  if (cards.length < 2) return false;
  const suits = cards.map((card) => card.slice(1));
  return new Set(suits).size === 1;
};

// Функция для проверки, находятся ли карты рядом по рангу
export const isConsecutive = (cards: string[]): boolean => {
  if (cards.length < 2) return false;
  const ranks = "23456789TJQKA";
  const cardRanks = cards.map((card) => ranks.indexOf(card[0]));
  return Math.abs(cardRanks[0] - cardRanks[1]) === 1;
};

// Функция для проверки, является ли рука карманной парой
export const isPocketPair = (cards: string[]): boolean => {
  if (cards.length < 2) return false;
  return cards[0][0] === cards[1][0];
};

// Функция для проверки, есть ли пробел между картами
export const hasGap = (cards: string[]): boolean => {
  if (cards.length < 2) return false;
  const ranks = "23456789TJQKA";
  const cardRanks = cards.map((card) => ranks.indexOf(card[0]));
  return Math.abs(cardRanks[0] - cardRanks[1]) > 1;
};
