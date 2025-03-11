export const suits = ["пика", "черва", "трефа", "буба"] as const;
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
] as const;

type Suit = (typeof suits)[number];
type Value = (typeof values)[number];

type PlayerData = {
  position: string;
  action: string;
  stack: "little" | "middle" | "big" | null;
  stackSize: number;
  bet: string | null;
  status: string;
  cards: string[][];
};

type Card = {
  rank: Value;
  suit: Suit;
};

/**
 * Преобразует текстовый диапазон (например, "77", "AKs") в массив комбинаций карт
 * @param range Массив строк диапазона
 * @returns Массив комбинаций карт
 */
export function rangeToCombos(range: string[]): string[][] {
  const combos: string[][] = [];
  range.forEach((hand) => {
    const isPair = hand.length === 2 && hand[0] === hand[1];
    const isSuited = hand.endsWith("s");

    if (isPair) {
      const rank = hand[0];
      for (let i = 0; i < suits.length; i++) {
        for (let j = i + 1; j < suits.length; j++) {
          combos.push([`${rank}${suits[i]}`, `${rank}${suits[j]}`]);
        }
      }
    } else if (isSuited) {
      const ranks = hand.slice(0, -1);
      suits.forEach((suit) => {
        combos.push([`${ranks[0]}${suit}`, `${ranks[1]}${suit}`]);
      });
    } else {
      const ranks = hand.slice(0, -1);
      for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < suits.length; j++) {
          if (i !== j) {
            combos.push([`${ranks[0]}${suits[i]}`, `${ranks[1]}${suits[j]}`]);
          }
        }
      }
    }
  });
  return combos;
}

/**
 * Находит карты игрока с максимальной ставкой
 * @param allPlayers Объект с данными игроков
 * @returns Массив комбинаций карт или null
 */
export function findMaxBetPlayerCards(allPlayers: {
  [key: string]: PlayerData;
}): string[][] | null {
  let maxBetPlayer: PlayerData | null = null;
  let maxBet = 0;

  for (const player of Object.values(allPlayers)) {
    const bet = player.bet ? parseFloat(player.bet) : 0;
    if (bet > maxBet) {
      maxBet = bet;
      maxBetPlayer = player;
    }
  }
  return maxBetPlayer?.cards ?? null;
}

/**
 * Рассчитывает эквити выбранных карт против диапазона игрока с максимальной ставкой
 * @param allPlayers Объект с данными игроков
 * @param selectedCards Выбранные карты игрока (например, ['2пика', '5трефа'])
 * @returns Процент эквити
 */
export function calculateEquity(
  allPlayers: { [key: string]: PlayerData },
  selectedCards: string[]
): number {
  const villainRange = findMaxBetPlayerCards(allPlayers);

  if (!villainRange || !selectedCards || selectedCards.length !== 2) {
    return 0;
  }

  const heroHand = {
    card1: parseCard(selectedCards[0]),
    card2: parseCard(selectedCards[1]),
  };

  let wins = 0;
  let ties = 0;

  for (const villainCombo of villainRange) {
    const villainHand = {
      card1: parseCard(villainCombo[0]),
      card2: parseCard(villainCombo[1]),
    };

    const result = compareHands(heroHand, villainHand);
    if (result === 1) wins++;
    else if (result === 0) ties++;
  }

  const totalComparisons = villainRange.length;
  return Number((((wins + ties / 2) / totalComparisons) * 100).toFixed(2));
}

/**
 * Парсит строку карты в объект с рангом и мастью
 * @param card Строка карты (например, '2пика')
 * @returns Объект с рангом и мастью
 */
function parseCard(card: string): Card {
  const rank = card[0] as Value;
  const suit = card.slice(1) as Suit;

  if (!values.includes(rank) || !suits.includes(suit)) {
    throw new Error(`Invalid card: ${card}`);
  }
  return { rank, suit };
}

/**
 * Сравнивает две руки на префлопе с откалиброванными вероятностями
 * @param hero Рука героя
 * @param villain Рука оппонента
 * @returns 1 (победа), 0 (ничья), -1 (поражение)
 */
function compareHands(
  hero: { card1: Card; card2: Card },
  villain: { card1: Card; card2: Card }
): number {
  const rankValues: Record<Value, number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  const heroRank1 = rankValues[hero.card1.rank];
  const heroRank2 = rankValues[hero.card2.rank];
  const villainRank1 = rankValues[villain.card1.rank];
  const villainRank2 = rankValues[villain.card2.rank];

  const isHeroPair = heroRank1 === heroRank2;
  const isVillainPair = villainRank1 === villainRank2;
  const isHeroSuited = hero.card1.suit === hero.card2.suit;
  const isVillainSuited = villain.card1.suit === villain.card2.suit;

  // Пара против пары
  if (isHeroPair && isVillainPair) {
    if (heroRank1 > villainRank1) return 1;
    if (heroRank1 < villainRank1) return -1;
    return 0;
  }

  // Пара против непары
  if (isHeroPair && !isVillainPair) {
    const villainHigh = Math.max(villainRank1, villainRank2);
    if (villainHigh > heroRank1) return Math.random() < 0.52 ? 1 : -1; // Пара vs оверкарты: ~52%
    return Math.random() < 0.8 ? 1 : -1; // Пара vs младшие: ~80%
  }

  // Непара против пары
  if (!isHeroPair && isVillainPair) {
    const heroHigh = Math.max(heroRank1, heroRank2);
    if (heroHigh > villainRank1) return Math.random() < 0.48 ? 1 : -1; // Оверкарты vs пара: ~48%
    return Math.random() < (isHeroSuited ? 0.55 : 0.5) ? 1 : -1; // Младшие vs пара: ~55% для суйтед, 50% для оффсьют
  }

  // Непара против непары
  const heroHigh = Math.max(heroRank1, heroRank2);
  const villainHigh = Math.max(villainRank1, villainRank2);
  const heroLow = Math.min(heroRank1, heroRank2);
  const villainLow = Math.min(villainRank1, villainRank2);

  // Проверка на коннекторы для суйтед рук
  const isHeroConnected = Math.abs(heroRank1 - heroRank2) === 1 && isHeroSuited;
  const isVillainConnected =
    Math.abs(villainRank1 - villainRank2) === 1 && isVillainSuited;

  if (heroHigh > villainHigh) {
    return Math.random() <
      (isHeroSuited ? (isHeroConnected ? 0.65 : 0.6) : 0.55)
      ? 1
      : -1; // Увеличено для суйтед и коннекторов
  }
  if (heroHigh < villainHigh) {
    return Math.random() <
      (isHeroSuited ? (isHeroConnected ? 0.45 : 0.4) : 0.35)
      ? 1
      : -1; // Увеличено для суйтед и коннекторов
  }
  if (heroLow > villainLow) {
    return Math.random() < (isHeroSuited ? 0.6 : 0.55) ? 1 : -1;
  }
  if (heroLow < villainLow) {
    return Math.random() < (isHeroSuited ? 0.45 : 0.4) ? 1 : -1;
  }

  // Ничья: учитываем суйтед и коннекторы
  if (isHeroSuited && !isVillainSuited) return Math.random() < 0.55 ? 1 : -1;
  if (!isHeroSuited && isVillainSuited) return Math.random() < 0.45 ? 1 : -1;
  if (isHeroConnected && !isVillainConnected)
    return Math.random() < 0.55 ? 1 : -1;
  if (!isHeroConnected && isVillainConnected)
    return Math.random() < 0.45 ? 1 : -1;
  return 0;
}
