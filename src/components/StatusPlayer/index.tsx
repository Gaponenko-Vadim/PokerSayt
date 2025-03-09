import React, { useState, useEffect } from "react";
import { updatePlayerStackInfo } from "../../Redux/slice/infoPlayers";
import { useDispatch } from "react-redux";
import styles from "./stayle.module.scss"; // Импортируем стили
type Player = {
  action: string;
  status: string;
};

interface StatusPlayerProps {
  player: Player;
  position: string; // Позиция игрока (например, "UTG", "BB")
  currentStatus: string;
  onChange: (status: string) => void; // Функция для обновления статуса
}

const StatusPlayer: React.FC<StatusPlayerProps> = ({
  currentStatus,
  onChange,
  position,
}) => {
  const [isHovered, setIsHovered] = useState(false); // Состояние для отслеживания наведения
  const dispatch = useDispatch();

  // Определяем, какие точки показывать при наведении
  const showRed = currentStatus !== "neutral";
  const showYellow = currentStatus !== "aggressive";
  const showGreen = currentStatus !== "tight";
  useEffect(() => {
    if (currentStatus) {
      dispatch(updatePlayerStackInfo({ position, value: currentStatus }));
    }
  }, [currentStatus, position, dispatch]);

  return (
    <div
      className={styles.statusPlayer}
      onMouseEnter={() => setIsHovered(true)} // При наведении показываем доступные точки
      onMouseLeave={() => setIsHovered(false)} // При уходе скрываем точки
    >
      <div className={styles.dotsContainer}>
        {/* Всегда видимая точка (активный статус) */}
        <button
          className={`${styles.dot} ${
            currentStatus === "tight"
              ? styles.green
              : currentStatus === "aggressive"
              ? styles.yellow
              : styles.red
          }`}
          onClick={() => {}}
          title={
            currentStatus === "tight"
              ? "Тайтовый"
              : currentStatus === "aggressive"
              ? "Агрессивный"
              : "Нейтральный"
          }
        />
        {/* Остальные точки (отображаются только при наведении и если не выбраны) */}
        {isHovered && (
          <>
            {showRed && (
              <button
                className={`${styles.dot} ${styles.red}`}
                onClick={() => onChange("neutral")}
                title="Нейтральный"
              />
            )}
            {showYellow && (
              <button
                className={`${styles.dot} ${styles.yellow}`}
                onClick={() => onChange("aggressive")}
                title="Агрессивный"
              />
            )}
            {showGreen && (
              <button
                className={`${styles.dot} ${styles.green}`}
                onClick={() => onChange("tight")}
                title="Тайтовый"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatusPlayer;
