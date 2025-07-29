export const calculatePositionCoefficient = (
  fullPosition: string[],
  position: string,
  maxBetPlayers: string,
  positionMulti: string[],
  result: number
): number => {
  // Проверяем валидность текущей позиции
  const positionIndex = fullPosition.indexOf(position);
  if (positionIndex === -1) {
    console.log(`Ошибка: Неверная позиция: ${position}`);
    return result; // Возвращаем исходное значение result по умолчанию
  }

  // Специальный случай для позиции SB
  if (position === "SB") {
    console.log(`Позиция SB, уменьшаем result на 0.3`);
    return result - 0.25;
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
      return result - result * 0.1; // Уменьшаем result на 10% (коэффициент 0.9)
    } else {
      console.log(
        `Обнаружено более одной поздней позиции для ${position}, коэффициент: 0.85`
      );
      return result - result * 0.15; // Уменьшаем result на 15% (коэффициент 0.85)
    }
  }

  // Если нет более поздних позиций, проверяем более ранние
  const earlierPositions = relevantPositions.filter(
    (pos) => fullPosition.indexOf(pos) < positionIndex
  );
  const earlierCount = earlierPositions.length;

  if (earlierCount === 1) {
    console.log(`Одна позиция перед ${position}, коэффициент: 1.1`);
    return result + result * 0.1; // Увеличиваем result на 10% (коэффициент 1.1)
  } else if (earlierCount === 2) {
    console.log(`Две позиции перед ${position}, коэффициент: 1.05`);
    return result + result * 0.05; // Увеличиваем result на 5% (коэффициент 1.05)
  }

  // По умолчанию, если нет подходящих условий
  console.log(`Стандартный случай для ${position}, коэффициент: 1.0`);
  return result; // Возвращаем исходное значение result
};
