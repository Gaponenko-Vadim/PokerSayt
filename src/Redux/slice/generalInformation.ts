import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PlayerDataTwo = {
  position: string;
  action: string;
  stack: "little" | "middle" | "big" | null;
  stackSize: number;
  bet: string | null;
  status: string;
  cards: string[][];
  cardsdiaposon: string[];
};
type Information = {
  maxBetPlayers: PlayerDataTwo[];
};

const initialState: Information = {
  maxBetPlayers: [],
};

const generalInformation = createSlice({
  name: "information",
  initialState,
  reducers: {
    setMaxBetPlayers: (state, action: PayloadAction<PlayerDataTwo[]>) => {
      state.maxBetPlayers = action.payload;
    },
    clearMaxBetPlayers: (state) => {
      state.maxBetPlayers = [];
    },
  },
});

export const { setMaxBetPlayers, clearMaxBetPlayers } =
  generalInformation.actions;
export default generalInformation.reducer;
