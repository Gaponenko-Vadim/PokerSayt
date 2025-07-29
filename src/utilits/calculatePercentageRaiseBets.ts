export const calculatePercentageRaiseBets = (
  maxBet: number,
  sumBet: number,
  callPlayersCount?: number,
  maxCount?: number
): { [key in "33" | "50" | "75" | "100"]: number } => {
  const coefficients: { [key in "33" | "50" | "75" | "100"]: number } = {
    "33": 0.33,
    "50": 0.5,
    "75": 0.75,
    "100": 1,
  };

  const raiseBets: { [key in "33" | "50" | "75" | "100"]: number } = {
    "33": 0,
    "50": 0,
    "75": 0,
    "100": 0,
  };

  // Проверяем условия для специальных случаев
  const shouldUseBBLogic =
    callPlayersCount !== undefined &&
    maxCount !== undefined &&
    callPlayersCount === 0 &&
    maxCount === 0;

  (["33", "50", "75", "100"] as const).forEach((key) => {
    if (shouldUseBBLogic) {
      // Специальная логика для 0 callPlayersCount и 0 maxCount
      switch (key) {
        case "33":
          raiseBets[key] = maxBet * 2; // 2 бб
          break;
        case "50":
          raiseBets[key] = maxBet * 3; // 3 бб
          break;
        case "75":
        case "100":
          raiseBets[key] = maxBet * 4; // 4 бб
          break;
      }
    } else {
      // Стандартная логика расчета
      const coefficient = coefficients[key];
      raiseBets[key] = Number(
        (maxBet + (sumBet + maxBet) * coefficient).toFixed(1)
      );
    }
  });

  return raiseBets;
};
