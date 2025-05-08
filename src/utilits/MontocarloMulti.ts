// import { formatHand } from "./allСombinations/calculateEquity";

// Тип для handDetails
type HandDetail = {
  hand: string; // Рука в текстовом формате (например, "AKo")
  combinations: number; // Количество комбинаций для этой руки
  equity: number; // Эквити руки против вашего диапазона
};

/**
 * Выбор случайной руки с учётом весов комбинаций
 */
const chooseRandomHand = (handDetails: HandDetail[]): HandDetail | null => {
  const totalCombinations = handDetails.reduce(
    (sum, detail) => sum + detail.combinations,
    0
  );

  if (totalCombinations === 0) return null;

  const randomValue = Math.random() * totalCombinations;
  let cumulative = 0;

  for (const detail of handDetails) {
    cumulative += detail.combinations;
    if (randomValue <= cumulative) {
      return detail;
    }
  }

  return null; // Возвращаем null, если рука не выбрана
};

/**
 * Проверка на пересечение карт между руками
 */
const hasCardOverlap = (
  hand1: string,
  hand2: string,
  heroCards: string[]
): boolean => {
  // Преобразуем карты в массивы
  const cards1 = [`${hand1[0]}${hand1[1]}`, `${hand1[2]}${hand1[3]}`];
  const cards2 = [`${hand2[0]}${hand2[1]}`, `${hand2[2]}${hand2[3]}`];
  const allCards = [...cards1, ...cards2, ...heroCards];

  // Проверяем уникальность карт
  const uniqueCards = new Set(allCards);
  return uniqueCards.size !== allCards.length;
};

/**
 * Моделирование исхода раздачи на основе вероятностей
 */
const simulateHand = (
  heroCards: string[],
  villainHands: HandDetail[]
): number => {
  const equity1 = villainHands[0].equity / 100; // Вероятность победы над первым оппонентом
  const equity2 = villainHands[1].equity / 100; // Вероятность победы над вторым оппонентом

  // Расчет вероятностей исходов
  const winProb = equity1 * equity2; // Герой побеждает обоих
  const splitProb = (equity1 * (1 - equity2) + (1 - equity1) * equity2) * 0.5; // Делёжка с одним
  const loseProb = (1 - equity1) * (1 - equity2); // Герой проигрывает

  // Нормализация вероятностей
  const totalProb = winProb + splitProb + loseProb;
  const normalizedWinProb = winProb / totalProb;
  const normalizedSplitProb = splitProb / totalProb;
  const normalizedLoseProb = loseProb / totalProb;

  // Проверка суммы вероятностей
  if (
    Math.abs(normalizedWinProb + normalizedSplitProb + normalizedLoseProb - 1) >
    0.01
  ) {
    console.warn(
      `Некорректная сумма вероятностей: ${
        normalizedWinProb + normalizedSplitProb + normalizedLoseProb
      }`
    );
  }

  // Случайный исход на основе вероятностей
  const random = Math.random();
  if (random < normalizedWinProb) return 1; // Герой выигрывает весь пот
  if (random < normalizedWinProb + normalizedSplitProb) return 0.5; // Герой делит пот с одним
  return 0; // Герой проигрывает
};

/**
 * Монте-Карло симуляция для расчета эквити в мультипоте
 */
export const montocarloMulti = (
  selectedCards: string[],
  handDetails: HandDetail[][]
): number => {
  // Проверка входных данных
  if (
    !selectedCards ||
    selectedCards.length !== 2 ||
    handDetails.length !== 2 ||
    handDetails.some((details) => details.length === 0)
  ) {
    console.error("Некорректные входные данные");
    return 0;
  }

  const SIMULATIONS = 100; // Количество симуляций
  let totalEquity = 0;
  let validSimulations = 0;

  for (let i = 0; i < SIMULATIONS; i++) {
    // Выбор случайных рук для обоих оппонентов
    const hand1 = chooseRandomHand(handDetails[0]);
    const hand2 = chooseRandomHand(handDetails[1]);

    if (!hand1 || !hand2) {
      continue; // Пропускаем недействительные руки
    }

    // Проверка пересечения карт
    if (hasCardOverlap(hand1.hand, hand2.hand, selectedCards)) {
      continue; // Пропускаем, если есть пересечение
    }

    // Моделирование исхода раздачи
    const handEquity = simulateHand(selectedCards, [hand1, hand2]);
    totalEquity += handEquity;
    validSimulations++;
  }

  if (validSimulations === 0) {
    console.warn("Нет валидных симуляций из-за пересечений комбинаций");
    return 0;
  }

  // Вычисление среднего эквити
  const averageEquity = (totalEquity / validSimulations) * 100;
  return Number(averageEquity.toFixed(2));
};
