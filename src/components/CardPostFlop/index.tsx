import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSuitForLimited,
  selectValueForLimited,
  resetLimitedCard,
  addCardToLimited,
  removeCardFromLimited,
} from "../../Redux/slice/cardSlice";
import {
  suits,
  values,
} from "../../utilits/allСombinations/allTwoCardCombinations";
import styles from "./style.module.scss";
import { RootState } from "../../Redux/store";

const CardPostFlop = () => {
  const dispatch = useDispatch();
  const { limitedCards, selectedCards } = useSelector(
    (state: RootState) => state.cardSlice
  );
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  // Инициализация limitedCards с 5 пустыми картами, если их меньше 5
  useEffect(() => {
    if (limitedCards.length < 5) {
      const emptyCard = {
        code: "cover",
        image: "/card/blue.jpg",
        isSelected: false,
        selectedSuit: null,
        selectedValue: null,
      };
      for (let i = limitedCards.length; i < 5; i++) {
        dispatch(addCardToLimited(emptyCard));
      }
    }
  }, [limitedCards, dispatch]);

  const handleCardClick = (index: number) => {
    setActiveCardIndex(index);
  };

  const handleSuitSelection = (suit: string) => {
    if (activeCardIndex !== null) {
      dispatch(selectSuitForLimited({ index: activeCardIndex, suit }));
    }
  };

  const handleValueSelection = (value: string) => {
    if (activeCardIndex !== null) {
      dispatch(selectValueForLimited({ index: activeCardIndex, value }));
      setActiveCardIndex(null);
    }
  };

  const handleResetCard = (index: number) => {
    dispatch(removeCardFromLimited(limitedCards[index].code));
    dispatch(resetLimitedCard(index));
    const emptyCard = {
      code: "cover",
      image: "/card/blue.jpg",
      isSelected: false,
      selectedSuit: null,
      selectedValue: null,
    };
    dispatch(addCardToLimited(emptyCard));
  };

  return (
    <div className={styles.cardsContainer}>
      {/* Первые 3 карты */}
      <div className={styles.firstGroup}>
        {limitedCards.slice(0, 3).map((card, index) => (
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
                  e.stopPropagation();
                  handleResetCard(index);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Последние 2 карты с пробелом */}
      <div className={styles.secondGroup}>
        {limitedCards.slice(3, 5).map((card, index) => (
          <div key={index + 3} className={styles.cardWrapper}>
            <div
              className={styles.card}
              onClick={() => handleCardClick(index + 3)}
            >
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
                  e.stopPropagation();
                  handleResetCard(index + 3);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {activeCardIndex !== null && (
        <div className={styles.selectionOverlay}>
          {!limitedCards[activeCardIndex]?.selectedSuit ? (
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
              {values.map((value) => {
                const potentialCardCode = `${value}${limitedCards[activeCardIndex].selectedSuit}`;
                const isDisabled =
                  limitedCards.some(
                    (card, i) =>
                      i !== activeCardIndex && card.code === potentialCardCode
                  ) ||
                  selectedCards.some((card) => card.code === potentialCardCode);
                return (
                  <button
                    key={value}
                    onClick={() => handleValueSelection(value)}
                    disabled={isDisabled}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardPostFlop;
