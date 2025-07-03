import { configureStore } from "@reduxjs/toolkit";
import pozitionSlice from "./slice/pozitionSlice";
import cardSlice from "./slice/cardSlice";
import convertSlice from "./slice/convertSlice";
import actionLastStackSlice from "./slice/actionLastStackSlice";
import infoPlayers from "./slice/infoPlayers";
import generalInformation from "./slice/generalInformation";
export const store = configureStore({
  reducer: {
    infoPlayers,
    pozitionSlice,
    cardSlice,
    convertSlice,
    actionLastStackSlice,
    generalInformation,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
