import styles from "./style.module.scss";
import { useState } from "react";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import HintEv from "../Hint/HintEv";
import HintEquity from "../Hint/HintEquity";

interface FlopProps {
  setFlop: (isOpen: boolean) => void;
}

const GeneralHint: React.FC<FlopProps> = ({ setFlop }) => {
  const [isGeneralHint, setGeneralHint] = useState(true);
  const selectedCards = useSelector(
    (state: RootState) => state.cardSlice.selectedCards
  );
  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );
  const players = useSelector((state: RootState) => state.infoPlayers.players);

  // Функция для получения диапазона карт, соответствующего позиции mainPlayer
  const getRangeForMainPlayer = () => {
    if (!mainPlayer || !mainPlayer.position) {
      return []; // Если mainPlayer или его позиция отсутствуют, возвращаем пустой массив
    }

    // Находим игрока с позицией, соответствующей mainPlayer.position
    const player = Object.values(players).find(
      (player) => player.position === mainPlayer.position
    );

    // Возвращаем диапазон карт для этой позиции
    return player ? player.cards : [];
  };

  // Функция для проверки, входят ли карты mainPlayer в диапазон своей позиции
  const isInRange = () => {
    if (!mainPlayer || !mainPlayer.selectedCards) {
      return false; // Если mainPlayer или его карты отсутствуют, возвращаем false
    }

    // Получаем диапазон карт для позиции mainPlayer
    const rangeForMainPlayer = getRangeForMainPlayer();

    // Преобразуем карты mainPlayer в отсортированную строку для сравнения
    const mainPlayerString = JSON.stringify(
      [...mainPlayer.selectedCards].sort()
    );

    // Проверяем, есть ли карты mainPlayer в диапазоне карт его позиции
    return rangeForMainPlayer.some((range: string[]) => {
      const rangeString = JSON.stringify([...range].sort());
      return rangeString === mainPlayerString;
    });
  };

  return (
    <div className={styles.generalHint}>
      {isGeneralHint ? (
        <>
          <HintEquity />
          <HintEv />
          {selectedCards.length === 2 && (
            <p>
              {isInRange()
                ? "Карты входят в диапазон"
                : "Карты не входят в диапазон"}
            </p>
          )}
          <button
            className={styles.resetIcon}
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем всплытие события
              setGeneralHint(false);
            }}
          >
            ×
          </button>
          <button className={styles.openButton} onClick={() => setFlop(true)}>
            Открыть флоп
          </button>
        </>
      ) : (
        <div className={styles.compactHint}>
          <p className={styles.compactText}>Подсказка скрыта</p>
          <button
            className={styles.compactButton}
            onClick={() => setGeneralHint(true)}
          >
            Открыть подсказку
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralHint;
