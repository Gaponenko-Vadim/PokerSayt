import React from "react";
import styles from "./style.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

interface TableMatrixProps {
  setOpenMatrix: (isOpen: boolean) => void; // Функция для управления видимостью таблицы
  selectedPosition: string | null; // Выбранная позиция (если есть)
}

const TableMatrix: React.FC<TableMatrixProps> = ({
  setOpenMatrix,
  selectedPosition,
}) => {
  const userMatrix = useSelector(
    (state: RootState) => state.infoPlayers.players
  );

  const ranks = [
    "A",
    "K",
    "Q",
    "J",
    "T",
    "9",
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
  ];

  const getHand = (row: number, col: number): string => {
    const rowRank = ranks[row];
    const colRank = ranks[col];
    if (row === col) {
      return `${rowRank}${colRank}`; // Пара, например "AA"
    } else if (row < col) {
      return `${rowRank}${colRank}s`; // Мастевые, например "AKs"
    } else {
      return `${colRank}${rowRank}o`; // Разномастные, например "AKo"
    }
  };

  // Получаем диапазон карт для выбранной позиции
  const selectedPlayer = selectedPosition ? userMatrix[selectedPosition] : null;
  const cardsDiaposon = selectedPlayer?.cardsdiaposon || [];

  return (
    <div className={styles.overlay} onClick={() => setOpenMatrix(false)}>
      {/* Контейнер таблицы */}
      <div
        className={styles.tableMatrix}
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике внутри
      >
        {/* Кнопка закрытия */}
        <button
          className={styles.closeButton}
          onClick={() => setOpenMatrix(false)}
        >
          &times; {/* Символ крестика */}
        </button>

        {/* Заголовок выбранной позиции */}
        {selectedPosition && (
          <h3 className={styles.selectedPosition}>{selectedPosition}</h3>
        )}

        {/* Таблица комбинаций */}
        <div className={styles.matrixGrid}>
          {ranks.map((_, row) =>
            ranks.map((_, col) => {
              const hand = getHand(row, col);
              const isPair = row === col; // Проверка на пару
              const isSuited = row < col; // Проверка на мастевые карты

              // Проверяем, находится ли текущая комбинация в диапазоне
              const isHighlighted = cardsDiaposon.includes(hand);

              return (
                <div
                  key={`${row}-${col}`}
                  className={`${styles.matrixCell} ${
                    isPair
                      ? styles.pair
                      : isSuited
                      ? styles.suited
                      : styles.unsuited
                  } ${isHighlighted ? styles.highlighted : ""}`}
                >
                  {hand}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TableMatrix;
