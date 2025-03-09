// pozitionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TypePosition = {
  value: string[];
  order: { index: number; status: string }[];
  index: number;
};

const initialState: TypePosition = {
  value: ["SB", "BB", "UTG", "UTG+1", "MP", "MP+1", "HJ", "BT"],
  order: [
    { index: 4, status: "tight" },
    { index: 2, status: "tight" },
    { index: 6, status: "tight" },
    { index: 0, status: "tight" },
    { index: 5, status: "tight" },
    { index: 7, status: "tight" },
    { index: 3, status: "tight" },
    { index: 1, status: "tight" },
  ],
  index: 0,
};

export const pozitionSlice = createSlice({
  name: "pozition",
  initialState,
  reducers: {
    setNextPozition: (state) => {
      state.index = (state.index - 1 + state.value.length) % state.value.length;
    },
    updatePlayerStatus: (
      state,
      action: PayloadAction<{ index: number; status: string }>
    ) => {
      const { index, status } = action.payload;
      const player = state.order.find((player) => player.index === index);
      if (player) {
        player.status = status;
      }
    },
  },
});

export const { setNextPozition, updatePlayerStatus } = pozitionSlice.actions;
export default pozitionSlice.reducer;
