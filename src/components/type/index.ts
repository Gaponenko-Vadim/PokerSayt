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
  myBet: string | null; // Новое поле для текущей ставки mainPlayer
};
