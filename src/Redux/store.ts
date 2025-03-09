import { configureStore } from "@reduxjs/toolkit";
import pozitionSlice from "./slice/pozitionSlice";
import cardSlice from "./slice/cardSlice";
import convertSlice from "./slice/convertSlice";
// import actionSlice from "./slice/actionInStackSlice";
import infoPlayers from "./slice/infoPlayers";
export const store = configureStore({
  reducer: {
    infoPlayers,
    pozitionSlice,
    cardSlice,
    convertSlice,
    // actionSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
