import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertRangeToCards } from "../../utilits/allСombinations/allTwoCardCombinations";
import { TypeGameStadia } from "../../components/type";
import {
  PlayerData,
  MainPlayers,
  PlayerAction,
  PlayerStack,
  PlayerStatus,
} from "../../components/type";
import rages from "../../constants/positionsRanges8maxMtt";

type TypeInfoPlayers = {
  players: { [key: string]: PlayerData };
  mainPlayers: MainPlayers | null;
  stadia: TypeGameStadia | null;
};

// Константы
const INITIAL_STACK_SIZE = 30;
const STACK_SIZES: Record<PlayerStack, number> = {
  little: 18,
  middle: 30,
  big: 50,
};

// Типизация для структуры диапазонов
interface RangeActions {
  open: string[];
  threeBet: string[];
  fourBet: string[];
  allIn: string[];
}

interface Range {
  middle: RangeActions;
  little: RangeActions;
  ultraShort: RangeActions;
  big: RangeActions;
}

// Обновленный тип PlayerData

export const POSITION_RANGES: Record<
  string,
  Partial<Record<PlayerStatus, Range>>
> = {
  UTG: {
    standard: rages.utgRangeStandardAverage,
    tight: rages.utgRangeTightAverage,
    weak: rages.utgRangeWeakAverage,
  },
  "UTG+1": {
    standard: rages.utg1RangeStandardAverage,
    tight: rages.utg1RangeTightAverage,
    weak: rages.utg1RangeWeakAverage,
  },
  MP: {
    standard: rages.mpRangeStandardAverage,
    tight: rages.mpRangeTightAverage,
    weak: rages.mpRangeWeakAverage,
  },
  "MP+1": {
    standard: rages.mpPlus1RangeStandardAverage,
    tight: rages.mpPlus1RangeTightAverage,
    weak: rages.mpPlus1RangeWeakAverage,
  },
  HJ: {
    standard: rages.hjRangeStandardAverage,
    tight: rages.hjRangeTightAverage,
    weak: rages.hjRangeWeakAverage,
  },
  BT: {
    standard: rages.btnRangeStandardAverage,
    tight: rages.btnRangeTightAverage,
    weak: rages.btnRangeWeakAverage,
  },
  SB: {
    standard: rages.sbRangeStandardAverage,
    tight: rages.sbRangeTightAverage,
    weak: rages.sbRangeWeakAverage,
  },
  BB: {
    standard: rages.bbRangeStandardAverage,
    tight: rages.bbRangeTightAverage,
    weak: rages.bbRangeWeakAverage,
  },
};

// Начальное состояние
const initialState: TypeInfoPlayers = {
  players: {},
  mainPlayers: null,
  stadia: null,
};

// Утилитные функции
const createPlayer = (
  position: string,
  status: PlayerStatus = "tight",
  stack: PlayerStack = "middle",
  cards: string[][] = [],
  cardsdiaposon: string[] = []
): PlayerData => ({
  position,
  action: "fold",
  stack,
  stackSize: STACK_SIZES[stack],
  bet: position === "BB" ? "1BB" : position === "SB" ? "0.5BB" : null,
  status,
  cards,
  cardsdiaposon,
});

// Обновленная функция getCardsByPosition, возвращающая оба значения
const getCardsByPosition = (
  position: string,
  status: PlayerStatus,
  stack: PlayerStack
): { raw: string[]; converted: string[][] } => {
  const positionRanges = POSITION_RANGES[position];
  if (!positionRanges) {
    return { raw: [], converted: [] };
  }

  const range = positionRanges[status] || positionRanges.weak;
  if (!range || !range[stack]) {
    return { raw: [], converted: [] };
  }

  const openRange = range[stack].open || [];
  return {
    raw: openRange, // Сырой диапазон
    converted: openRange.flatMap((hand) => convertRangeToCards(hand)), // Преобразованные карты
  };
};

const initializeMainPlayerIfNull = (state: TypeInfoPlayers): MainPlayers => {
  if (!state.mainPlayers) {
    state.mainPlayers = {
      position: "",
      selectedCards: [],
      stackSize: INITIAL_STACK_SIZE,
      equity: null,
      sumBet: 0,
      myBet: null,
    };
  }
  return state.mainPlayers;
};

const getMaxBet = (players: { [key: string]: PlayerData }): number =>
  Object.values(players).reduce((max, player) => {
    const betValue = player.bet ? parseFloat(player.bet) : 0;
    return Math.max(max, betValue);
  }, 0);

// Создаем слайс
export const infoPlayers = createSlice({
  name: "info",
  initialState,
  reducers: {
    initializePositions: (
      state,
      action: PayloadAction<{ positions: string[] }>
    ) => {
      const { positions } = action.payload;
      state.players = positions.reduce((acc, position) => {
        const status: PlayerStatus = "tight";
        const stack: PlayerStack = "middle";
        const { raw, converted } = getCardsByPosition(position, status, stack);
        acc[position] = createPlayer(position, status, stack, converted, raw);
        return acc;
      }, {} as { [key: string]: PlayerData });
    },
    initializeMainPlayer: (
      state,
      action: PayloadAction<{
        position?: string;
        cards?: Array<{ code: string }>;
        equity?: number;
        sumBet?: number;
      }>
    ) => {
      const { position, cards, equity, sumBet } = action.payload;
      const mainPlayer = initializeMainPlayerIfNull(state);
      if (position) {
        mainPlayer.position = position;
        mainPlayer.myBet = state.players[position]?.bet || null;
      }
      if (cards) {
        mainPlayer.selectedCards = cards.map((card) => card.code);
      }
      if (equity !== undefined) {
        mainPlayer.equity = equity;
      }
      if (sumBet !== undefined) {
        mainPlayer.sumBet = sumBet;
      }
    },
    updatePlayerAction: (
      state,
      action: PayloadAction<{
        position: string;
        action: PlayerAction;
        customBet?: string;
      }>
    ) => {
      const { position, action: newAction, customBet } = action.payload;
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }
      state.players[position].action = newAction;

      if (newAction === "fold") {
        state.players[position].bet = null;
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = 0;
        }
      } else if (newAction === "call") {
        const maxBet = getMaxBet(state.players);
        state.players[position].bet = `${maxBet}BB`;
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = maxBet;
        }
      } else if (["2bb", "3bb", "4bb"].includes(newAction)) {
        const multipliers: { [key in "2bb" | "3bb" | "4bb"]: number } = {
          "2bb": 2,
          "3bb": 3,
          "4bb": 4,
        };
        const maxBet = getMaxBet(state.players);
        const multiplier = multipliers[newAction as "2bb" | "3bb" | "4bb"];

        state.players[position].bet = String(maxBet * multiplier) + "BB";
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = parseFloat(
            customBet || String(multiplier)
          );
        }
      } else if (["33%", "50%", "75%", "100%"].includes(newAction)) {
        const coefficients: {
          [key in "33%" | "50%" | "75%" | "100%"]: number;
        } = {
          "33%": 0.33,
          "50%": 0.5,
          "75%": 0.75,
          "100%": 1,
        };
        const maxBet = getMaxBet(state.players);
        const coefficient =
          coefficients[newAction as "33%" | "50%" | "75%" | "100%"];
        const sumBet = state.mainPlayers?.sumBet || 0;

        const betValue = Number(
          (maxBet + (sumBet + maxBet) * coefficient).toFixed(1)
        );
        state.players[position].bet = `${betValue}BB`;
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = betValue;
        }
      } else if (newAction === "allin") {
        state.players[position].bet = customBet || "All-in";
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = state.players[position].stackSize;
        }
      }
    },

    updatePlayerStack: (
      state,
      action: PayloadAction<{ position: string; value: PlayerStack }>
    ) => {
      const { position, value } = action.payload;
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }
      state.players[position].stack = value;
      state.players[position].stackSize = STACK_SIZES[value] || 0;
      const { raw, converted } = getCardsByPosition(
        position,
        state.players[position].status,
        value
      );
      state.players[position].cardsdiaposon = raw;
      state.players[position].cards = converted;
    },

    updatePlayerStackInfo: (
      state,
      action: PayloadAction<{ position: string; value: PlayerStatus }>
    ) => {
      const { position, value } = action.payload;
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }
      state.players[position].status = value;
      const { raw, converted } = getCardsByPosition(
        position,
        value,
        state.players[position].stack
      );
      state.players[position].cardsdiaposon = raw;
      state.players[position].cards = converted;
    },

    updatePlayerCards: (
      state,
      action: PayloadAction<{ position: string; cards: string[][] }>
    ) => {
      const { position, cards } = action.payload;
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }
      state.players[position].cards = cards;
    },

    updateMainPlayerEquity: (
      state,
      action: PayloadAction<{ equity: number | null }>
    ) => {
      const mainPlayer = initializeMainPlayerIfNull(state);
      mainPlayer.equity = action.payload.equity;
    },

    updateMainPlayerSumBet: (
      state,
      action: PayloadAction<{ sumBet: number }>
    ) => {
      const mainPlayer = initializeMainPlayerIfNull(state);
      mainPlayer.sumBet = action.payload.sumBet;
    },

    updateMainPlayerMyBet: (
      state,
      action: PayloadAction<{ myBet: string | null }>
    ) => {
      const mainPlayer = initializeMainPlayerIfNull(state);
      mainPlayer.myBet = action.payload.myBet;
    },

    resetselectAction: (state) => {
      state.players = Object.keys(state.players).reduce((acc, position) => {
        const status = state.players[position].status;
        const stack = state.players[position].stack;
        const { raw, converted } = getCardsByPosition(position, status, stack);
        acc[position] = createPlayer(position, status, stack, converted, raw);
        return acc;
      }, {} as { [key: string]: PlayerData });
    },

    updateGameStadia: (
      state,
      action: PayloadAction<{ stadia: TypeGameStadia | null }>
    ) => {
      state.stadia = action.payload.stadia;
    },
  },
});

// Экспортируем действия
export const {
  initializePositions,
  updatePlayerAction,
  updatePlayerStack,
  resetselectAction,
  initializeMainPlayer,
  updatePlayerStackInfo,
  updatePlayerCards,
  updateMainPlayerEquity,
  updateMainPlayerSumBet,
  updateMainPlayerMyBet,
  updateGameStadia,
} = infoPlayers.actions;

// Экспортируем редьюсер
export default infoPlayers.reducer;
