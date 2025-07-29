import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlayerDataTwo } from "../../components/type";

type Information = {
  maxBetPlayers: PlayerDataTwo[];
  ante: number;
};

const initialState: Information = {
  maxBetPlayers: [],
  ante: 0,
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
  },
});

export const { setMaxBetPlayers, clearMaxBetPlayers, setAnte } =
  generalInformation.actions;
export default generalInformation.reducer;
