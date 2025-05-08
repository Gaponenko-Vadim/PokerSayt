import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertRangeToCards } from "../../utilits/allСombinations/allTwoCardCombinations";
import { getMaxBet } from "../../utilits/getMaxBet";
import { TypeGameStadia } from "../../components/type";
import {
  ReduxPlayerAction,
  PlayerData,
  MainPlayers,
  PlayerStack,
  PlayerStatus,
  TypeInfoPlayers,
} from "../../components/type";
import { POSITION_RANGES } from "../../constants/pozition_ranges";

// Константы
const INITIAL_STACK_SIZE = 30;
const STACK_SIZES: Record<PlayerStack, number> = {
  little: 18,
  middle: 30,
  big: 50,
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
  count: 0,
});

// Функция для получения диапазона на основе count и action
const getRangeByActionAndCount = (
  position: string,
  status: PlayerStatus,
  stack: PlayerStack,
  action: ReduxPlayerAction,
  count: number
): { raw: string[]; converted: string[][] } => {
  const positionRanges = POSITION_RANGES[position];
  if (!positionRanges) {
    return { raw: [], converted: [] };
  }

  const range = positionRanges[status] || positionRanges.weak;
  if (!range || !range[stack]) {
    return { raw: [], converted: [] };
  }

  let selectedRange: string[] = [];

  if (action === "allin") {
    selectedRange = range[stack].allIn || [];
  } else if (action === "raise") {
    if (count === 1 || count === 0) {
      selectedRange = range[stack].open || [];
    } else if (count === 2) {
      selectedRange = range[stack].threeBet || [];
    } else if (count === 3) {
      selectedRange = range[stack].fourBet || [];
    } else {
      selectedRange = range[stack].open || [];
    }
  } else if (action === "call" && (position === "SB" || position === "BB")) {
    selectedRange = range[stack].defend_open || []; // Используем defend_open для SB и BB при call
  } else {
    selectedRange = range[stack].open || []; // Для других действий или позиций
  }

  return {
    raw: selectedRange,
    converted: selectedRange.flatMap((hand) => convertRangeToCards(hand)),
  };
};

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
    raw: openRange,
    converted: openRange.flatMap((hand) => convertRangeToCards(hand)),
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
        action: ReduxPlayerAction;
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
      } else if (newAction === "raise") {
        state.players[position].bet = customBet || "0BB";
        if (state.mainPlayers && state.mainPlayers.position === position) {
          const betValue = customBet
            ? parseFloat(customBet.replace("BB", ""))
            : 0;
          state.mainPlayers.sumBet = isNaN(betValue) ? 0 : betValue;
        }
      } else if (newAction === "allin") {
        state.players[position].bet = customBet || "All-in";
        if (state.mainPlayers && state.mainPlayers.position === position) {
          const betValue = customBet
            ? parseFloat(customBet.replace("BB", ""))
            : state.players[position].stackSize;
          state.mainPlayers.sumBet = isNaN(betValue) ? 0 : betValue;
        }
      }

      // Обновление диапазона на основе action и текущего count
      const { raw, converted } = getRangeByActionAndCount(
        position,
        state.players[position].status,
        state.players[position].stack,
        newAction,
        state.players[position].count
      );
      state.players[position].cardsdiaposon = raw;
      state.players[position].cards = converted;
    },
    setPlayerCount: (
      state,
      action: PayloadAction<{ position: string; count: number }>
    ) => {
      const { position, count } = action.payload;
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }
      state.players[position].count = count;

      // Обновление диапазона на основе текущего action и нового count
      const { raw, converted } = getRangeByActionAndCount(
        position,
        state.players[position].status,
        state.players[position].stack,
        state.players[position].action as ReduxPlayerAction,
        count
      );
      state.players[position].cardsdiaposon = raw;
      state.players[position].cards = converted;
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
      const { raw, converted } = getRangeByActionAndCount(
        position,
        state.players[position].status,
        value,
        state.players[position].action as ReduxPlayerAction,
        state.players[position].count
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
      const { raw, converted } = getRangeByActionAndCount(
        position,
        value,
        state.players[position].stack,
        state.players[position].action as ReduxPlayerAction,
        state.players[position].count
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
      if (state.mainPlayers?.selectedCards) {
        state.mainPlayers.selectedCards = [];
      }
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
  setPlayerCount,
} = infoPlayers.actions;

// Экспортируем редьюсер
export default infoPlayers.reducer;
