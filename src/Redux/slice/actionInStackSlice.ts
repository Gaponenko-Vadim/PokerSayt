import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PlayerAction = "fold" | "call" | "raise" | "allin";
type PlayerStack = "little" | "middle" | "big" | null;

type PlayerData = {
  position: string; // Позиция игрока (например, "BB", "SB", "UTG")
  action: PlayerAction;
  stack: PlayerStack;
};

type TypeAction = {
  players: { [key: string]: PlayerData }; // Объект для хранения данных игрока
  bets: { [key: string]: string }; // Объект для хранения ставок
};

const initialState: TypeAction = {
  players: {}, // Начальное состояние игроков
  bets: { BB: "1BB", SB: "0.5BB" }, // Ставки по умолчанию для BB и SB
};

const actionSlice = createSlice({
  name: "action",
  initialState,
  reducers: {
    selectAction: (
      state,
      action: PayloadAction<{ position: string; value: PlayerAction }>
    ) => {
      const { position, value } = action.payload;
      if (!state.players[position]) {
        state.players[position] = { position, action: "fold", stack: null }; // Инициализация, если игрок отсутствует
      }
      state.players[position].action = value; // Обновляем действие

      // Обновляем ставку в зависимости от действия
      if (value === "call") {
        state.bets[position] = "1BB"; // Колл — ставка 1BB
      } else if (value === "raise") {
        state.bets[position] = "2BB"; // Рейз — ставка 2BB
      } else if (value === "allin") {
        state.bets[position] = "All-in"; // Алл-ин
      } else if (value === "fold") {
        delete state.bets[position]; // Убираем ставку, если действие "fold"
      }
    },
    selectStack: (
      state,
      action: PayloadAction<{ position: string; value: PlayerStack }>
    ) => {
      const { position, value } = action.payload;
      if (!state.players[position]) {
        state.players[position] = { position, action: "fold", stack: null }; // Инициализация, если игрок отсутствует
      }
      state.players[position].stack = value; // Обновляем стек
    },
    resetselectAction: (state) => {
      state.players = initialState.players; // Сбрасываем состояние игроков
      state.bets = initialState.bets; // Сбрасываем ставки
    },
  },
});

export const { selectAction, selectStack, resetselectAction } =
  actionSlice.actions;
export default actionSlice.reducer;
