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
