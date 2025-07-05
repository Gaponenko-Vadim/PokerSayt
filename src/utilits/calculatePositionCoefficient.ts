export const calculatePositionCoefficient = (
  fullPosition: string[],
  position: string,
  maxBetPlayers: string[],
  positionMulti: string[],
  result: number
): number => {
  // Проверяем валидность текущей позиции
  const positionIndex = fullPosition.indexOf(position);
  if (positionIndex === -1) {
    console.log(`Ошибка: Неверная позиция: ${position}`);
    return result; // Возвращаем исходное значение result по умолчанию
  }

  // Объединяем maxBetPlayers и positionMulti, убирая дубликаты
  const relevantPositions = Array.from(
    new Set([...maxBetPlayers, ...positionMulti])
  );

  // Проверяем наличие более поздних позиций
  const hasLaterPositions = relevantPositions.some(
    (pos) => fullPosition.indexOf(pos) > positionIndex
  );

  // Если есть более поздние позиции
  if (hasLaterPositions) {
    console.log(
      `Обнаружены более поздние позиции для ${position}, коэффициент: 0.9`
    );
    return result - result * 0.1; // Уменьшаем result на 10% (коэффициент 0.9)
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
