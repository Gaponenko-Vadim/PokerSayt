export const calculatePositionCoefficient = (
  fullPosition: string[],
  position: string,
  maxBetPlayers: string,
  positionMulti: string[],
  result: number,
  equity: number
): number => {
  // Если equity >= 70, возвращаем result без изменений
  if (equity >= 75) {
    console.log(`Equity ${equity} >= 70, возвращаем result без изменений`);
    return result;
  }

  // Проверяем валидность текущей позиции
  const positionIndex = fullPosition.indexOf(position);
  if (positionIndex === -1) {
    console.log(`Ошибка: Неверная позиция: ${position}`);
    return result;
  }

  // Специальный случай для позиции SB
  if (position === "SB") {
    console.log(`Позиция SB, уменьшаем result на 0.25`);
    return result - 0.5;
  }

  // Объединяем maxBetPlayers и positionMulti, убирая дубликаты
  const relevantPositions = Array.from(
    new Set([...maxBetPlayers, ...positionMulti])
  );

  // Проверяем наличие более поздних позиций
  const laterPositions = relevantPositions.filter(
    (pos) => fullPosition.indexOf(pos) > positionIndex
  );
  const laterCount = laterPositions.length;

  // Если есть более поздние позиции
  if (laterCount > 0) {
    if (laterCount === 1) {
      console.log(
        `Обнаружена одна более поздняя позиция для ${position}, коэффициент: 0.9`
      );
      return result - result * 0.13;
    } else {
      console.log(
        `Обнаружено более одной поздней позиции для ${position}, коэффициент: 0.85`
      );
      return result - result * 0.2;
    }
  }

  // Если нет более поздних позиций, проверяем более ранние
  const earlierPositions = relevantPositions.filter(
    (pos) => fullPosition.indexOf(pos) < positionIndex
  );
  const earlierCount = earlierPositions.length;

  if (earlierCount === 1) {
    console.log(`Одна позиция перед ${position}, коэффициент: 1.1`);
    return result + result * 0.1;
  } else if (earlierCount > 2) {
    console.log(`Две позиции перед ${position}, коэффициент: 1.05`);
    return result + result * 0.12;
  }

  // По умолчанию, если нет подходящих условий
  console.log(`Стандартный случай для ${position}, коэффициент: 1.0`);
  return result;
};
