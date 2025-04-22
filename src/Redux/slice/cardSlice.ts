import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

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
  selectedCards: CardState[];
  limitedCards: CardState[];
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
  selectedCards: [],
  limitedCards: [],
};

// Создание среза (slice)
const cardSlice = createSlice({
  name: "card",
  initialState,
  reducers: {
    // Выбор масти для карты в cards (для CardSelector)
    selectSuit: (
      state,
      action: PayloadAction<{ index: number; suit: string }>
    ) => {
      const { index, suit } = action.payload;
      state.cards[index].selectedSuit = suit;
    },

    // Выбор достоинства для карты в cards (для CardSelector)
    selectValue: (
      state,
      action: PayloadAction<{ index: number; value: string }>
    ) => {
      const { index, value } = action.payload;
      const selectedCardCode = `${value}${state.cards[index].selectedSuit}`;

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

    // Выбор масти для карты в limitedCards (для CardPostFlop)
    selectSuitForLimited: (
      state,
      action: PayloadAction<{ index: number; suit: string }>
    ) => {
      const { index, suit } = action.payload;
      if (state.limitedCards[index]) {
        state.limitedCards[index].selectedSuit = suit;
      }
    },

    // Выбор достоинства для карты в limitedCards (для CardPostFlop)
    selectValueForLimited: (
      state,
      action: PayloadAction<{ index: number; value: string }>
    ) => {
      const { index, value } = action.payload;
      if (state.limitedCards[index]) {
        const selectedCardCode = `${value}${state.limitedCards[index].selectedSuit}`;

        // Проверяем, нет ли такой карты в limitedCards (дубликат внутри limitedCards)
        const isCardAlreadyInLimited = state.limitedCards.some(
          (card, i) => i !== index && card.code === selectedCardCode
        );

        // Проверяем, нет ли такой карты в selectedCards
        const isCardInSelectedCards = state.selectedCards.some(
          (card) => card.code === selectedCardCode
        );

        // Если карта не выбрана ни в limitedCards, ни в selectedCards, добавляем её
        if (!isCardAlreadyInLimited && !isCardInSelectedCards) {
          state.limitedCards[index].selectedValue = value;
          state.limitedCards[index].code = selectedCardCode;
          state.limitedCards[index].image = `/card/${selectedCardCode}.jpg`;
          state.limitedCards[index].isSelected = true;
        }
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

      // Удаляем карту из массива limitedCards
      state.limitedCards = state.limitedCards.filter(
        (limitedCard) => limitedCard.code !== card.code
      );

      // Сбрасываем карту в cards
      state.cards[index] = {
        code: "cover",
        image: "/card/blue.jpg",
        isSelected: false,
        selectedSuit: null,
        selectedValue: null,
      };
    },

    // Сброс карты в limitedCards (для CardPostFlop)
    resetLimitedCard: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const card = state.limitedCards[index];

      if (card) {
        // Удаляем карту из массива limitedCards
        state.limitedCards = state.limitedCards.filter(
          (limitedCard) => limitedCard.code !== card.code
        );

        // Сбрасываем карту
        state.limitedCards[index] = {
          code: "cover",
          image: "/card/blue.jpg",
          isSelected: false,
          selectedSuit: null,
          selectedValue: null,
        };
      }
    },

    // Сброс всех карт
    resetAllCards: (state) => {
      state.cards = initialState.cards;
      state.selectedCards = [];
      state.limitedCards = [];
    },

    // Добавление карты в массив limitedCards
    addCardToLimited: (state, action: PayloadAction<CardState>) => {
      if (state.limitedCards.length < 5) {
        state.limitedCards.push(action.payload);
      }
    },

    // Удаление карты из массива limitedCards
    removeCardFromLimited: (state, action: PayloadAction<string>) => {
      const cardCodeToRemove = action.payload;
      state.limitedCards = state.limitedCards.filter(
        (card) => card.code !== cardCodeToRemove
      );
    },
  },
});

// Экспорт действий (actions)
export const {
  selectSuit,
  selectValue,
  resetCard,
  resetAllCards,
  addCardToLimited,
  removeCardFromLimited,
  selectSuitForLimited,
  selectValueForLimited,
  resetLimitedCard,
} = cardSlice.actions;

// Селектор для получения выбранных карт
export const selectSelectedCards = (state: RootState) =>
  state.cardSlice.selectedCards;

// Селектор для получения всех карт
export const selectAllCards = (state: RootState) => state.cardSlice.cards;

// Селектор для получения массива limitedCards
export const selectLimitedCards = (state: RootState) =>
  state.cardSlice.limitedCards;

// Экспорт редьюсера
export default cardSlice.reducer;
