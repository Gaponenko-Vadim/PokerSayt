import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlayerDataTwo } from "../../components/type";

type Information = {
  maxBetPlayers: PlayerDataTwo[];
  ante: number;
  startingStack: number;
  facktStack: number;
};

const initialState: Information = {
  maxBetPlayers: [],
  ante: 0,
  startingStack: 100,
  facktStack: 0,
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
    setAnte: (state, action: PayloadAction<number>) => {
      state.ante = action.payload;
    },
    setStartingStack: (state, action: PayloadAction<number>) => {
      state.startingStack = action.payload;
    },
    setFacktStack: (state, action: PayloadAction<number>) => {
      state.facktStack = action.payload;
    },
  },
});

export const {
  setMaxBetPlayers,
  clearMaxBetPlayers,
  setAnte,
  setStartingStack,
  setFacktStack,
} = generalInformation.actions;
export default generalInformation.reducer;
