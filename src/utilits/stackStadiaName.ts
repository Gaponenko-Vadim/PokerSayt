import { TypeGameStadia } from "../components/type";

export const stackStadiaName = (
  stadia: TypeGameStadia,
  baseStartingStack: number,
  newStackPrizeStackValue?: number
): number => {
  // Допустимые начальные стеки из таблицы
  const validStartingStacks = [250, 200, 125, 100, 50];

  // Данные из таблицы: начальный стек и соответствующие средние стеки для стадий
  const stackSizes: Record<number, Record<TypeGameStadia, number>> = {
    250: {
      initial: 250,
      Average: 125,
      late: 40,
      prize: newStackPrizeStackValue || 0,
    },
    200: {
      initial: 200,
      Average: 100,
      late: 40,
      prize: newStackPrizeStackValue || 0,
    },
    125: {
      initial: 125,
      Average: 63,
      late: 40,
      prize: newStackPrizeStackValue || 0,
    },
    100: {
      initial: 100,
      Average: 40,
      late: 25,
      prize: newStackPrizeStackValue || 0,
    },
    50: {
      initial: 50,
      Average: 25,
      late: 15,
      prize: newStackPrizeStackValue || 0,
    },
  };

  // Находим ближайший начальный стек
  const closestStack = validStartingStacks.reduce((prev, curr) =>
    Math.abs(curr - baseStartingStack) < Math.abs(prev - baseStartingStack)
      ? curr
      : prev
  );

  // Возвращаем средний стек для указанной стадии и ближайшего начального стека
  return stackSizes[closestStack][stadia];
};
