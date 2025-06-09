export const calculatePercentageRaiseBets = (
  maxBet: number,
  sumBet: number
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

  (["33", "50", "75", "100"] as const).forEach((key) => {
    const coefficient = coefficients[key];
    const betValue = Number(
      (maxBet + (sumBet + maxBet) * coefficient).toFixed(1)
    );
    raiseBets[key] = betValue;
    // console.log(`Calculated raise bet for ${key}%:`, betValue);
  });

  return raiseBets;
};
