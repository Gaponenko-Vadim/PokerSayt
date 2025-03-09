import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store"; // Убедитесь, что путь до store правильный

// Тип для состояния одной карты
type CardState = {
  code: string;
  image: string;
  isSelected: boolean;
  selectedSuit: string | null;
  selectedValue: string | null;
};

// Тип для состояния всего среза карт
type CardSliceState = {
  cards: CardState[];
  selectedCards: CardState[]; // Массив для хранения выбранных карт
};

// Начальное состояние
const initialState: CardSliceState = {
  cards: [
    {
      code: "cover",
      image: "/card/blue.jpg",
      isSelected: false,
      selectedSuit: null,
      selectedValue: null,
    },
    {
      code: "cover",
      image: "/card/blue.jpg",
      isSelected: false,
      selectedSuit: null,
      selectedValue: null,
    },
  ],
  selectedCards: [], // Изначально пустой массив
};

// Создание среза (slice)
const cardSlice = createSlice({
  name: "card",
  initialState,
  reducers: {
    // Выбор масти для карты
    selectSuit: (
      state,
      action: PayloadAction<{ index: number; suit: string }>
    ) => {
      const { index, suit } = action.payload;
      state.cards[index].selectedSuit = suit;
    },

    // Выбор достоинства для карты
    selectValue: (
      state,
      action: PayloadAction<{ index: number; value: string }>
    ) => {
      const { index, value } = action.payload;
      const selectedCardCode = `${value}${state.cards[index].selectedSuit}`;

      // Проверка, что такая карта уже не выбрана в другой ячейке
      const isCardAlreadySelected = state.cards.some(
        (card, i) => i !== index && card.code === selectedCardCode
      );

      if (!isCardAlreadySelected) {
        state.cards[index].selectedValue = value;
        state.cards[index].code = selectedCardCode;
        state.cards[index].image = `/card/${selectedCardCode}.jpg`;
        state.cards[index].isSelected = true;

        // Добавляем карту в массив выбранных карт
        state.selectedCards.push(state.cards[index]);
      }
    },

    // Сброс конкретной карты
    resetCard: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const card = state.cards[index];

      // Удаляем карту из массива выбранных карт
      state.selectedCards = state.selectedCards.filter(
        (selectedCard) => selectedCard.code !== card.code
      );

      // Сбрасываем карту
      state.cards[index] = {
        code: "cover",
        image: "/card/blue.jpg",
        isSelected: false,
        selectedSuit: null,
        selectedValue: null,
      };
    },

    // Сброс всех карт
    resetAllCards: (state) => {
      state.cards = initialState.cards;
      state.selectedCards = []; // Очищаем выбранные карты
    },
  },
});

// Экспорт действий (actions)
export const { selectSuit, selectValue, resetCard, resetAllCards } =
  cardSlice.actions;

// Селектор для получения выбранных карт
export const selectSelectedCards = (state: RootState) =>
  state.cardSlice.selectedCards;

// Селектор для получения всех карт
export const selectAllCards = (state: RootState) => state.cardSlice.cards;

// Экспорт редьюсера
export default cardSlice.reducer;
