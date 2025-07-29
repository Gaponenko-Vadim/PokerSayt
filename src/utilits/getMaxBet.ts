import { PlayerData } from "../components/type";
export const getMaxBet = (players: { [key: string]: PlayerData }): number => {
  return Math.max(
    ...Object.values(players).map((player) => {
      if (!player.bet || player.bet === "All-in") return 0;
      const betValue = parseFloat(player.bet.replace("BB", ""));
      return isNaN(betValue) ? 0 : betValue;
    }),
    0
  );
};

export const getMaxCount = (players: { [key: string]: PlayerData }): number => {
  return Math.max(
    ...Object.values(players).map((player) => {
      if (!player.count) return 0;
      const betValue = player.count;
      return betValue;
    }),
    0
  );
};

export const getMaxBetPosition = (players: {
  [key: string]: PlayerData;
}): string => {
  let maxPosition = "";
  let maxBetValue = -Infinity;

  Object.values(players).forEach((player) => {
    // <-- убрали [_, player]
    if (!player.bet || player.bet === "All-in") return;

    const betValue = parseFloat(player.bet.replace("BB", ""));
    if (!isNaN(betValue) && betValue > maxBetValue) {
      maxBetValue = betValue;
      maxPosition = player.position;
    }
  });

  return maxPosition;
};
