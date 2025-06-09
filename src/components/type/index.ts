export type PlayerAction =
  | "fold"
  | "call"
  | "raise"
  | "allin"
  | "pass"
  | "2bb"
  | "3bb"
  | "4bb"
  | "33%"
  | "50%"
  | "75%"
  | "100%";
export type ReduxPlayerAction = "fold" | "call" | "raise" | "allin" | "pass";
export type PlayerStack = "little" | "middle" | "big";
export type PlayerStatus = "standard" | "tight" | "weak" | "fish";

export type TypeGameStadia = "initial" | "Average" | "late" | "prize";

export type TypeInfoPlayers = {
  players: { [key: string]: PlayerData };
  mainPlayers: MainPlayers | null;
  stadia: TypeGameStadia | null;
};

export type PlayerData = {
  position: string;
  action: PlayerAction;
  stack: PlayerStack;
  stackSize: number;
  bet: string | null;
  status: PlayerStatus;
  cards: string[][];
  cardsdiaposon: string[]; // Новое поле для сырого диапазона карт
  count: number;
};

export type MainPlayers = {
  position: string;
  stack: PlayerStack;
  cardsOnTheTable?: string[];
  selectedCards?: string[];
  stackSize: number;
  equity: number | null;
  sumBet: number;
  myBet: string | null; // Новое поле для текущей ставки mainPlayer
};
