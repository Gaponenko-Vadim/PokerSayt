import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSuit,
  selectValue,
  resetCard,
} from "../../Redux/slice/cardSlice";
import {
  suits,
  values,
} from "../../utilits/allСombinations/allTwoCardCombinations";
import styles from "./style.module.scss";
import { RootState } from "../../Redux/store";

const CardSelector = () => {
  const dispatch = useDispatch();
  const { cards } = useSelector((state: RootState) => state.cardSlice);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setActiveCardIndex(index);
  };

  const handleSuitSelection = (suit: string) => {
    if (activeCardIndex !== null) {
      dispatch(selectSuit({ index: activeCardIndex, suit }));
    }
  };

  const handleValueSelection = (value: string) => {
    if (activeCardIndex !== null) {
      dispatch(selectValue({ index: activeCardIndex, value }));
      setActiveCardIndex(null); // Сброс активной карты после выбора
    }
  };

  const handleResetCard = (index: number) => {
    dispatch(resetCard(index)); // Сброс конкретной карты
  };

  return (
    <div className={styles.cardsContainer}>
      {cards.map((card, index) => (
        <div key={index} className={styles.cardWrapper}>
          <div className={styles.card} onClick={() => handleCardClick(index)}>
            {card.isSelected ? (
              <img src={card.image} alt={card.code} />
            ) : (
              <img src="/card/blue.jpg" alt="cover" />
            )}
          </div>
          {card.isSelected && (
            <button
              className={styles.resetIcon}
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем всплытие события
                handleResetCard(index);
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {activeCardIndex !== null && (
        <div className={styles.selectionOverlay}>
          {!cards[activeCardIndex].selectedSuit ? (
            <div className={styles.suitSelector}>
              <h3>Выберите масть</h3>
              {suits.map((suit) => (
                <button key={suit} onClick={() => handleSuitSelection(suit)}>
                  {suit}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.valueSelector}>
              <h3>Выберите номинал</h3>
              {values.map((value) => (
                <button
                  key={value}
                  onClick={() => handleValueSelection(value)}
                  disabled={cards.some(
                    (card, i) =>
                      i !== activeCardIndex &&
                      card.code ===
                        `${value}${cards[activeCardIndex].selectedSuit}`
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardSelector;
