import {
  PlayerData,
  MainPlayers,
  PlayerStack,
  PlayerStatus,
} from "../components/type/index";

export const calculateEquityFold = (
  player: PlayerData,
  mainPlayer: MainPlayers,
  betRound: number // 2 for 2-bet, 3 for 3-bet, 4 for 4-bet, 5 for all-in
): number => {
  // Базовые значения эквити для разных позиций
  const positionEquity: Record<string, number> = {
    SB: 0.85,
    BB: 0.8,
    UTG: 0.75,
    "UTG+1": 0.77,
    MP: 0.78,
    "MP+1": 0.79,
    HJ: 0.81,
    BT: 0.83,
  };

  // Модификаторы для разных статусов игрока
  const statusModifier: Record<PlayerStatus, number> = {
    neutral: 1.0,
    aggressive: 1.15,
    tight: 0.85,
  };

  // Модификаторы для разных типов ставок
  const betModifier: Record<number, number> = {
    2: 1.0, // 2-bet
    3: 1.1, // 3-bet
    4: 1.25, // 4-bet
    5: 1.5, // all-in
  };

  // Модификаторы для размера стека
  const stackModifier: Record<PlayerStack, number> = {
    little: 0.9,
    middle: 1.0,
    big: 1.1,
  };

  // Рассчитываем базовое значение эквити
  let equity = positionEquity[player.position] || 0.75;

  // Применяем модификаторы
  equity *= statusModifier[player.status];
  equity *= betModifier[betRound];
  equity *= stackModifier[player.stack];

  // Учитываем разницу в стеке между игроками
  const stackRatio = mainPlayer.stackSize / player.stackSize;
  if (stackRatio > 1.5) {
    equity *= 0.9; // Уменьшаем эквити если у оппонента значительно больший стек
  } else if (stackRatio < 0.67) {
    equity *= 1.1; // Увеличиваем эквити если у оппонента значительно меньший стек
  }

  // Ограничиваем эквити в разумных пределах (20%-95%)
  equity = Math.max(0.2, Math.min(0.95, equity));

  return equity;
};
