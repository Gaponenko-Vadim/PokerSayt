// convertSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertRangeToCards } from "../../utilits/allСombinations/allTwoCardCombinations"; // Импортируем функцию и диапазон

// Тип для состояния
type TypeConvert = {
  value: string[][]; // Массив комбинаций карт
};

// Начальное состояние
const initialState: TypeConvert = {
  value: [],
};

// Создаём слайс
export const convertSlice = createSlice({
  name: "convert",
  initialState,
  reducers: {
    // Action для преобразования диапазона и сохранения результата
    convertRange: (state, action: PayloadAction<string[]>) => {
      const ranges = action.payload; // Массив диапазонов, например, ["AKs", "AA", "KJo"]
      const combinations = ranges.flatMap((range) =>
        convertRangeToCards(range)
      ); // Преобразуем каждый диапазон
      state.value = combinations; // Сохраняем результат в состоянии
    },

    // Action для очистки состояния
    clearCombinations: (state) => {
      state.value = [];
    },
  },
});

// Экспортируем actions
export const { convertRange, clearCombinations } = convertSlice.actions;

// Экспортируем редьюсер
export default convertSlice.reducer;
