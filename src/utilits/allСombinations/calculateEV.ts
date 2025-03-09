type PlayerAction = string;
type PlayerStack = "little" | "middle" | "big" | null;
type PlayerStatus = string;

type MainPlayers = {
  position: string;
  selectedCards?: string[]; // Например, ['Kтрефа', 'Qпика']
  stackSize?: number; // Стек mainPlayer (теперь используем stackSize)
};

type PlayerData = {
  position: string;
  action: PlayerAction;
  stack: PlayerStack; // Тип стека (little, middle, big)
  stackSize: number; // Числовое значение стека (18, 30, 50)
  bet: string | null;
  status: PlayerStatus;
  cards: string[][]; // Например, [['2пика', '2черва'], ['2пика', '2трефа']]
};

export const calculateEV = (
  mainPlayers: MainPlayers,
  players: { [key: string]: PlayerData }
): number | null => {
  // Проверяем, что у mainPlayers есть карты и stackSize
  if (
    !mainPlayers.selectedCards ||
    mainPlayers.selectedCards.length !== 2 ||
    !mainPlayers.stackSize
  ) {
    console.warn(
      "Недостаточно данных для расчета EV: отсутствуют карты или stackSize."
    );
    return null;
  }

  // Находим игрока с максимальной ставкой
  let maxBetPlayer: PlayerData | null = null;
  let maxBet = 0;

  for (const player of Object.values(players)) {
    if (player.bet && parseFloat(player.bet) > maxBet) {
      maxBet = parseFloat(player.bet);
      maxBetPlayer = player;
    }
  }

  // Если игрок с максимальной ставкой не найден
  if (!maxBetPlayer) {
    console.warn("Нет игрока с максимальной ставкой.");
    return null;
  }

  // Диапазон рук противника
  const opponentRange = maxBetPlayer.cards;
  console.log(opponentRange);

  // Проверяем, что диапазон рук противника не пуст
  if (!opponentRange || opponentRange.length === 0) {
    console.warn("Диапазон рук противника пуст.");
    return null;
  }

  // Карты mainPlayer
  const mainPlayerHand = mainPlayers.selectedCards;

  // Рассчитываем EV
  let totalEV = 0;

  for (const opponentHand of opponentRange) {
    // Проверяем, что рука противника содержит 2 карты
    if (!opponentHand || opponentHand.length !== 2) {
      console.warn("Некорректный формат руки противника:", opponentHand);
      continue; // Пропускаем эту комбинацию
    }

    // Симулируем розыгрыш руки
    const outcome = simulateHand(mainPlayerHand, opponentHand);

    // Размер пот = минимальный stackSize между mainPlayer и противником
    const potSize = Math.min(
      mainPlayers.stackSize,
      maxBetPlayer.stackSize || Infinity
    );

    // Упрощенный расчет EV
    const ev = outcome * potSize;
    totalEV += ev;
  }

  // Среднее EV
  const averageEV = totalEV / opponentRange.length;

  // Округляем EV до двух знаков после запятой
  return parseFloat(averageEV.toFixed(2));
};

// Функция для симуляции розыгрыша руки
function simulateHand(
  mainPlayerHand: string[],
  opponentHand: string[]
): number {
  // Проверяем, что руки содержат 2 карты
  if (mainPlayerHand.length !== 2 || opponentHand.length !== 2) {
    console.error("Некорректный формат руки:", mainPlayerHand, opponentHand);
    return 0; // Возвращаем 0, чтобы не влиять на расчет EV
  }

  // Оцениваем силу рук
  const mainPlayerStrength = evaluateHandStrength(mainPlayerHand);
  const opponentStrength = evaluateHandStrength(opponentHand);

  // Проверяем, что сила рук определена корректно
  if (mainPlayerStrength === -1 || opponentStrength === -1) {
    console.error(
      "Некорректная сила руки:",
      mainPlayerStrength,
      opponentStrength
    );
    return 0; // Возвращаем 0, чтобы не влиять на расчет EV
  }

  // Сравниваем силу рук
  if (mainPlayerStrength > opponentStrength) {
    return 1; // mainPlayer выигрывает
  } else if (mainPlayerStrength < opponentStrength) {
    return 0; // mainPlayer проигрывает
  } else {
    return 0.5; // Ничья
  }
}

// Функция для оценки силы руки
function evaluateHandStrength(hand: string[]): number {
  // Проверяем, что рука содержит 2 карты
  if (hand.length !== 2) {
    console.error("Некорректный формат руки:", hand);
    return -1; // Возвращаем недопустимое значение
  }

  const [card1, card2] = hand;

  // Определяем номиналы и масти карт
  const rank1 = getRank(card1);
  const rank2 = getRank(card2);
  const suit1 = getSuit(card1);
  const suit2 = getSuit(card2);

  // Проверяем, что номиналы карт определены корректно
  if (rank1 === -1 || rank2 === -1) {
    console.error("Некорректный номинал карты:", card1, card2);
    return -1; // Возвращаем недопустимое значение
  }

  // Определяем силу руки
  if (rank1 === rank2) {
    return 3; // Пара
  }

  if (suit1 === suit2) {
    return 2; // Одномастные
  }

  const diff = Math.abs(rank1 - rank2);
  if (diff === 1 || diff === 12) {
    return 1; // Коннекторы
  }

  return 0; // Старшая карта
}

// Функция для определения номинала карты
function getRank(card: string): number {
  if (!card || card.length === 0) {
    console.error("Карта не определена или пуста:", card);
    return -1; // Возвращаем недопустимое значение
  }

  const rank = card[0]; // Первый символ — номинал
  const ranks = [
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
  return ranks.indexOf(rank);
}

// Функция для определения масти карты
function getSuit(card: string): string {
  return card.slice(1); // Все символы, кроме первого — масть
}
