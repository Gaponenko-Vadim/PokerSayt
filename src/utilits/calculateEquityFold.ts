// calculateEquityFold.ts
export type PlayerAction = "fold" | "call" | "raise" | "allin";
export type PlayerStack = "little" | "middle" | "big" | null;
export type PlayerStatus = "neutral" | "aggressive" | "tight";

export type PlayerData = {
  position: string;
  action: PlayerAction;
  stack: PlayerStack;
  stackSize: number;
  bet: string | null;
  status: PlayerStatus;
  cards: string[][];
};

export type MainPlayers = {
  position: string;
  selectedCards?: string[];
  stackSize: number;
  equity: number | null;
  sumBet: number;
  myBet: string | null;
};

export const calculateEquityFold = (
  infoPlayers: { [key: string]: PlayerData },
  infoMain: MainPlayers,
  raiseSize: number // Размер твоего рейза или алл-ина
): number => {
  // Базовая вероятность фолда оппонента (в процентах)
  let foldEquity = 0;

  // Получаем данные об оппонентах
  const activeOpponents = Object.values(infoPlayers).filter(
    (p) => p.action !== "fold" && p.stackSize > 0
  );

  if (activeOpponents.length === 0 || infoMain.equity === null) return 0; // Нет активных оппонентов или нет эквити

  // Учитываем позицию
  const positionFactor = {
    UTG: 0.8, // Ранняя позиция, меньше шансов выбить
    "UTG+1": 0.85, // Чуть позже, но все еще ранняя
    MP: 0.95, // Средняя позиция
    "MP+1": 1.0, // Средняя позиция, ближе к поздней
    HJ: 1.1, // Поздняя позиция (Hijack)
    BT: 1.2, // Поздняя позиция (Button), больше шансов выбить
    SB: 0.9, // Малый блайнд, сложнее выбить
    BB: 0.9, // Большой блайнд, сложнее выбить
  };

  // Учитываем агрессивность оппонента на основе status
  const aggressionFactor = {
    tight: 1.3, // Легче выбить тайтового
    neutral: 1.0, // Нейтральный игрок
    aggressive: 0.7, // Сложнее выбить агрессивного
  };

  // Проверяем, был ли рейз до тебя
  const maxBetBefore = Math.max(
    ...activeOpponents.map((p) => (p.bet ? parseFloat(p.bet) : 0))
  );
  const hasOpponentRaised = maxBetBefore > 0;
  const raisePressureFactor = hasOpponentRaised ? 0.8 : 1.0; // Если оппонент рейзил, меньше шансов выбить

  // Учитываем давление от размера ставки
  const currentBet = infoMain.myBet ? parseFloat(infoMain.myBet) : 0;
  const isAllIn = raiseSize >= infoMain.stackSize + currentBet;
  const minOpponentStack = Math.min(...activeOpponents.map((p) => p.stackSize));
  const potSize = infoMain.sumBet; // Текущий пот
  const opponentCallAmount = raiseSize - maxBetBefore; // Сколько оппоненту нужно доставить

  // Давление на оппонента (отношение call amount к стеку и поту)
  const pressureRatio = opponentCallAmount / (minOpponentStack + potSize);
  let pressureFactor = 1.0;
  if (isAllIn) {
    pressureFactor = pressureRatio > 0.5 ? 1.5 : 1.3; // Высокое давление от алл-ина
  } else {
    pressureFactor = pressureRatio > 0.3 ? 1.2 : 1.0; // Меньшее давление от обычного рейза
  }

  // Если это алл-ин, и оппонент уже в алл-ине, фолд эквити = 0
  const opponentAllIn = activeOpponents.some((p) => p.action === "allin");
  if (isAllIn && opponentAllIn) {
    return 0; // Нельзя выбить того, кто уже в алл-ине
  }

  // Учет эквити: при низком эквити уменьшаем фолд эквити из-за риска больших потерь
  const equity = infoMain.equity / 100; // Эквити в долях
  const equityPenalty = equity < 0.3 ? 0.6 : equity < 0.5 ? 0.8 : 1.0; // Штраф при низком эквити

  // Базовая вероятность фолда (зависит от эквити и давления)
  const baseFoldChance = Math.min(50, 40 * (1 - equity)); // Чем ниже эквити, тем выше базовый шанс фолда

  // Учет риска потерь при низком эквити
  const effectivePot = potSize + opponentCallAmount; // Потенциальный пот
  const lossRisk = (1 - equity) * effectivePot; // Ожидаемые потери при колле
  const gainOnFold = potSize; // Выигрыш при фолде оппонента
  const riskRewardRatio = lossRisk / gainOnFold; // Соотношение риска к выигрышу
  const riskAdjustment =
    riskRewardRatio > 2 ? 0.5 : riskRewardRatio > 1 ? 0.75 : 1.0; // Уменьшаем фолд эквити при плохом соотношении

  // Итоговый расчет фолд эквити для каждого оппонента
  activeOpponents.forEach((opponent) => {
    const positionMod =
      positionFactor[infoMain.position as keyof typeof positionFactor] || 1.0; // По умолчанию 1.0, если позиция не определена
    const aggressionMod = aggressionFactor[opponent.status]; // Используем status для агрессивности
    const adjustedFoldChance =
      baseFoldChance *
      positionMod *
      aggressionMod *
      raisePressureFactor *
      pressureFactor *
      equityPenalty * // Штраф за низкое эквити
      riskAdjustment; // Учет соотношения риска и выигрыша

    foldEquity += Math.min(adjustedFoldChance, 90); // Ограничиваем максимум 90%
  });

  // Усредняем фолд эквити по количеству оппонентов
  foldEquity = foldEquity / activeOpponents.length;

  return foldEquity;
};
