import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PlayerLastBet = {
  lostMaxBet: number;
  lostSumBet: number;
};

const initialState: PlayerLastBet = {
  lostMaxBet: 0,
  lostSumBet: 0,
};

const actionLastStackSlice = createSlice({
  name: "action",
  initialState,
  reducers: {
    setLostmaxBet: (state, action: PayloadAction<number>) => {
      state.lostMaxBet = action.payload;
    },
    setLostsumBet: (state, action: PayloadAction<number>) => {
      state.lostSumBet = action.payload;
    },
    resetselectLostAction: (state) => {
      state.lostMaxBet = initialState.lostMaxBet; // Сбрасываем состояние игроков
      state.lostSumBet = initialState.lostSumBet; // Сбрасываем ставки
    },
  },
});

export const { setLostmaxBet, setLostsumBet, resetselectLostAction } =
  actionLastStackSlice.actions;
export default actionLastStackSlice.reducer;
