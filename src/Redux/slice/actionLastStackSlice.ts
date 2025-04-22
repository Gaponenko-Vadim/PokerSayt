import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PlayerLastBet = {
  lostMaxBet: number;
  lostSumBet: number;
  hasRaise: boolean; // Поле для хранения предыдущего hasRaise
};

const initialState: PlayerLastBet = {
  lostMaxBet: 0,
  lostSumBet: 0,
  hasRaise: false, // Изначально нет рейза
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
    setHasRaise: (state, action: PayloadAction<boolean>) => {
      state.hasRaise = action.payload;
    },
    resetselectLostAction: (state) => {
      state.lostMaxBet = initialState.lostMaxBet;
      state.lostSumBet = initialState.lostSumBet;
      state.hasRaise = initialState.hasRaise; // Сбрасываем hasRaise
    },
  },
});

export const {
  setLostmaxBet,
  setLostsumBet,
  setHasRaise,
  resetselectLostAction,
} = actionLastStackSlice.actions;
export default actionLastStackSlice.reducer;
