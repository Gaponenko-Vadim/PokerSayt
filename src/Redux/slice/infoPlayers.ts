import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertRangeToCards } from "../../utilits/allСombinations/allTwoCardCombinations";
import {
  PlayerData,
  MainPlayers,
  PlayerAction,
  PlayerStack,
  PlayerStatus,
} from "../../components/type";
import {
  utgRange,
  utg1Range,
  mpRange,
  mp1Range,
  hjRange,
  btnRange,
  sbRange,
  bbRange,
} from "../../utilits/allСombinations/allPositionsRanges";

// Типы

type TypeinfoPlayers = {
  players: { [key: string]: PlayerData };
  mainPlayers: MainPlayers | null;
};

// Начальное состояние
const initialState: TypeinfoPlayers = {
  players: {},
  mainPlayers: null,
};

// Функция для создания игрока с начальными значениями
const createPlayer = (position: string, cards: string[][] = []): PlayerData => {
  return {
    position,
    action: "fold",
    stack: "middle",
    stackSize: 30,
    bet: position === "BB" ? "1BB" : position === "SB" ? "0.5BB" : null,
    status: "tight",
    cards,
  };
};

// Создаем слайс
export const infoPlayers = createSlice({
  name: "info",
  initialState,
  reducers: {
    // Инициализация позиций
    initializePositions: (
      state,
      action: PayloadAction<{ positions: string[] }>
    ) => {
      const { positions } = action.payload;
      state.players = {};
      positions.forEach((position) => {
        let cards: string[][] = [];
        switch (position) {
          case "UTG":
            cards = utgRange.flatMap((utgRange) =>
              convertRangeToCards(utgRange)
            );
            break;
          case "UTG+1":
            cards = utg1Range.flatMap((range) => convertRangeToCards(range));
            break;
          case "MP":
            cards = mpRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "MP+1":
            cards = mp1Range.flatMap((range) => convertRangeToCards(range));
            break;
          case "HJ":
            cards = hjRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "BT":
            cards = btnRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "SB":
            cards = sbRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "BB":
            cards = bbRange.flatMap((range) => convertRangeToCards(range));
            break;
          default:
            cards = [];
        }
        state.players[position] = createPlayer(position, cards);
      });
    },

    // Инициализация mainPlayers
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

      if (!state.mainPlayers) {
        state.mainPlayers = {
          position: "",
          selectedCards: [],
          stackSize: 30,
          equity: null,
          sumBet: 0,
          myBet: null,
        };
      }

      if (position) {
        state.mainPlayers.position = position;
        state.mainPlayers.myBet = state.players[position]?.bet || null; // Инициализируем myBet из playerData
      }

      if (cards && cards.length > 0) {
        const selectedCards = cards.map((card) => card.code);
        state.mainPlayers.selectedCards = selectedCards;
      }

      if (equity !== undefined) {
        state.mainPlayers.equity = equity;
      }

      if (sumBet !== undefined) {
        state.mainPlayers.sumBet = sumBet;
      }
    },

    // Обновление действия игрока
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

      if (newAction === "call") {
        const maxBet = Object.values(state.players).reduce((max, player) => {
          if (player.bet) {
            const betValue = parseFloat(player.bet);
            return betValue > max ? betValue : max;
          }
          return max;
        }, 0);
        state.players[position].bet = `${maxBet}BB`;
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = maxBet;
          // myBet обновляется через компонент, а не здесь
        }
      } else if (newAction === "raise") {
        const maxBet = Object.values(state.players).reduce((max, player) => {
          if (player.bet) {
            const betValue = parseFloat(player.bet);
            return betValue > max ? betValue : max;
          }
          return max;
        }, 0);
        const newBet = maxBet * 2;
        state.players[position].bet = `${newBet}BB`;
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = newBet;
        }
      } else if (newAction === "allin") {
        state.players[position].bet = customBet || "All-in";
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = state.players[position].stackSize;
        }
      } else if (newAction === "fold") {
        state.players[position].bet = null;
        if (state.mainPlayers && state.mainPlayers.position === position) {
          state.mainPlayers.sumBet = 0;
        }
      }
    },

    // Обновление стека игрока
    updatePlayerStack: (
      state,
      action: PayloadAction<{ position: string; value: PlayerStack }>
    ) => {
      const { position, value } = action.payload;

      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }

      state.players[position].stack = value;

      switch (value) {
        case "little":
          state.players[position].stackSize = 18;
          break;
        case "middle":
          state.players[position].stackSize = 30;
          break;
        case "big":
          state.players[position].stackSize = 50;
          break;
        default:
          state.players[position].stackSize = 0;
      }
    },

    // Обновление статуса игрока
    updatePlayerStackInfo: (
      state,
      action: PayloadAction<{ position: string; value: PlayerStatus }>
    ) => {
      const { position, value } = action.payload;

      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }

      state.players[position].status = value;
    },

    // Обновление карт игрока
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

    // Обновление эквити mainPlayers
    updateMainPlayerEquity: (
      state,
      action: PayloadAction<{ equity: number | null }>
    ) => {
      const { equity } = action.payload;

      if (!state.mainPlayers) {
        state.mainPlayers = {
          position: "",
          selectedCards: [],
          stackSize: 30,
          equity: null,
          sumBet: 0,
          myBet: null,
        };
      }

      state.mainPlayers.equity = equity;
    },

    // Обновление суммы ставок mainPlayers
    updateMainPlayerSumBet: (
      state,
      action: PayloadAction<{ sumBet: number }>
    ) => {
      const { sumBet } = action.payload;

      if (!state.mainPlayers) {
        state.mainPlayers = {
          position: "",
          selectedCards: [],
          stackSize: 30,
          equity: null,
          sumBet: 0,
          myBet: null,
        };
      }

      state.mainPlayers.sumBet = sumBet;
    },

    // Новое действие для обновления myBet
    updateMainPlayerMyBet: (
      state,
      action: PayloadAction<{ myBet: string | null }>
    ) => {
      const { myBet } = action.payload;

      if (!state.mainPlayers) {
        state.mainPlayers = {
          position: "",
          selectedCards: [],
          stackSize: 30,
          equity: null,
          sumBet: 0,
          myBet: null,
        };
      }

      state.mainPlayers.myBet = myBet;
    },

    // Сброс состояния игроков
    resetselectAction: (state) => {
      Object.keys(state.players).forEach((position) => {
        let cards: string[][] = [];
        switch (position) {
          case "UTG":
            cards = utgRange.flatMap((utgRange) =>
              convertRangeToCards(utgRange)
            );
            break;
          case "UTG+1":
            cards = utg1Range.flatMap((range) => convertRangeToCards(range));
            break;
          case "MP":
            cards = mpRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "MP+1":
            cards = mp1Range.flatMap((range) => convertRangeToCards(range));
            break;
          case "HJ":
            cards = hjRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "BT":
            cards = btnRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "SB":
            cards = sbRange.flatMap((range) => convertRangeToCards(range));
            break;
          case "BB":
            cards = bbRange.flatMap((range) => convertRangeToCards(range));
            break;
          default:
            cards = [];
        }
        state.players[position] = createPlayer(position, cards);
      });
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
  updateMainPlayerMyBet, // Добавляем новое действие
} = infoPlayers.actions;

// Экспортируем редьюсер
export default infoPlayers.reducer;
