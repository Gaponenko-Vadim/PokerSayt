export type PlayerAction =
  | "fold"
  | "call"
  | "raise"
  | "allin"
  | "2bb"
  | "3bb"
  | "4bb"
  | "33%"
  | "50%"
  | "75%"
  | "100%";
export type PlayerStack = "little" | "middle" | "big";
export type PlayerStatus = "standard" | "tight" | "weak" | "fish";

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
