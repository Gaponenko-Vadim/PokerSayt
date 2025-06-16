// pozitionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlayerStatus } from "../../components/type";
import { TypeStatusRise } from "../../components/type";
type TypePosition = {
  value: string[];
  order: { index: number; status: PlayerStatus }[];
  index: number;
  statusRise: TypeStatusRise;
};

const initialState: TypePosition = {
  value: ["SB", "BB", "UTG", "UTG+1", "MP", "MP+1", "HJ", "BT"],
  order: [
    { index: 4, status: "standard" },
    { index: 2, status: "standard" },
    { index: 6, status: "standard" },
    { index: 0, status: "standard" },
    { index: 5, status: "standard" },
    { index: 7, status: "standard" },
    { index: 3, status: "standard" },
    { index: 1, status: "standard" },
  ],
  index: 0,
  statusRise: "no",
};

export const pozitionSlice = createSlice({
  name: "pozition",
  initialState,
  reducers: {
    setNextPozition: (state) => {
      state.index = (state.index - 1 + state.value.length) % state.value.length;
    },
    updateStatusRise: (state, action: PayloadAction<TypeStatusRise>) => {
      state.statusRise = action.payload;
    },
    updatePlayerStatus: (
      state,
      action: PayloadAction<{ index: number; status: PlayerStatus }>
    ) => {
      const { index, status } = action.payload;
      const player = state.order.find((player) => player.index === index);
      if (player) {
        player.status = status;
      }
    },
  },
});

export const { setNextPozition, updatePlayerStatus, updateStatusRise } =
  pozitionSlice.actions;
export default pozitionSlice.reducer;
