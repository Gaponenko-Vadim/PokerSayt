import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertRangeToCards } from "../../utilits/allСombinations/allTwoCardCombinations";
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
type PlayerAction = "fold" | "call" | "raise" | "allin";
type PlayerStack = "little" | "middle" | "big" | null;
type PlayerStatus = string;

type PlayerData = {
  position: string;
  action: PlayerAction;
  stack: PlayerStack; // Тип стека (little, middle, big)
  stackSize: number; // Числовое значение стека (18, 30, 50)
  bet: string | null;
  status: PlayerStatus;
  cards: string[][];
};

type MainPlayers = {
  position: string;
  selectedCards?: string[];
  stackSize: number;
};

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
    stack: "middle", // Устанавливаем стек как "middle" по умолчанию
    stackSize: 30, // Значение стека по умолчанию (middle)
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

      // Очищаем текущий объект игроков
      state.players = {};

      // Добавляем новые позиции
      positions.forEach((position) => {
        // Определяем диапазон карт для позиции
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

        // Создаем игрока с начальными значениями
        state.players[position] = createPlayer(position, cards);
      });
    },

    // Инициализация mainPlayers
    initializeMainPlayer: (
      state,
      action: PayloadAction<{
        position?: string;
        cards?: Array<{ code: string }>;
      }>
    ) => {
      const { position, cards } = action.payload;

      // Инициализируем mainPlayers, если он ещё не существует
      if (!state.mainPlayers) {
        state.mainPlayers = {
          position: "",
          selectedCards: [],
          stackSize: 30,
        };
      }

      // Если передана позиция, обновляем её
      if (position) {
        state.mainPlayers.position = position;
      }

      // Если переданы карты, обновляем их
      if (cards && cards.length > 0) {
        const selectedCards = cards.map((card) => card.code);
        state.mainPlayers.selectedCards = selectedCards;
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

      // Если игрок отсутствует, инициализируем его
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }

      // Обновляем действие игрока
      state.players[position].action = newAction;

      // Обновляем ставку в зависимости от действия
      if (newAction === "call") {
        const maxBet = Object.values(state.players).reduce((max, player) => {
          if (player.bet) {
            const betValue = parseFloat(player.bet);
            return betValue > max ? betValue : max;
          }
          return max;
        }, 0);
        state.players[position].bet = `${maxBet}BB`;
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
      } else if (newAction === "allin") {
        state.players[position].bet = customBet || "All-in";
      } else if (newAction === "fold") {
        state.players[position].bet = null;
      }
    },

    // Обновление стека игрока
    updatePlayerStack: (
      state,
      action: PayloadAction<{ position: string; value: PlayerStack }>
    ) => {
      const { position, value } = action.payload;

      // Если игрок отсутствует, инициализируем его
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }

      // Обновляем стек игрока
      state.players[position].stack = value;

      // Устанавливаем числовое значение стека в зависимости от выбранного типа
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
          state.players[position].stackSize = 0; // или null, если нужно
      }
    },

    // Обновление статуса игрока
    updatePlayerStackInfo: (
      state,
      action: PayloadAction<{ position: string; value: PlayerStatus }>
    ) => {
      const { position, value } = action.payload;

      // Если игрок отсутствует, инициализируем его
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }

      // Обновляем статус игрока
      state.players[position].status = value;
    },

    // Обновление карт игрока
    updatePlayerCards: (
      state,
      action: PayloadAction<{ position: string; cards: string[][] }>
    ) => {
      const { position, cards } = action.payload;

      // Если игрок отсутствует, инициализируем его
      if (!state.players[position]) {
        state.players[position] = createPlayer(position);
      }

      // Обновляем карты игрока
      state.players[position].cards = cards;
    },

    // Сброс состояния игроков
    resetselectAction: (state) => {
      // Проходим по всем позициям и сбрасываем состояния игроков
      Object.keys(state.players).forEach((position) => {
        // Определяем диапазон карт для позиции
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

        // Сбрасываем состояние игрока, но сохраняем карты
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
} = infoPlayers.actions;

// Экспортируем редьюсер
export default infoPlayers.reducer;
