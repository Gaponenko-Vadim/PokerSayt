import React, { useState, useEffect } from "react";
import { updatePlayerStackInfo } from "../../Redux/slice/infoPlayers";
import { useDispatch } from "react-redux";
import styles from "./stayle.module.scss"; // Импортируем стили
import { PlayerStatus } from "../type";
type Player = {
  action: string;
  status: string;
};

interface StatusPlayerProps {
  player: Player;
  position: string; // Позиция игрока (например, "UTG", "BB")
  currentStatus: PlayerStatus;
  onChange: (status: PlayerStatus) => void; // Функция для обновления статуса
}

const StatusPlayer: React.FC<StatusPlayerProps> = ({
  currentStatus,
  onChange,
  position,
}) => {
  const [isHovered, setIsHovered] = useState(false); // Состояние для отслеживания наведения
  const dispatch = useDispatch();

  // Определяем, какие точки показывать при наведении
  const showRed = currentStatus !== "tight";
  const showYellow = currentStatus !== "weak";
  const showGreen = currentStatus !== "standard";

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
            currentStatus === "standard"
              ? styles.green
              : currentStatus === "weak"
              ? styles.yellow
              : styles.red
          }`}
          onClick={() => {}}
          title={
            currentStatus === "tight"
              ? "Тайтовый"
              : currentStatus === "weak"
              ? "Слабый"
              : "Нейтральный"
          }
        />
        {/* Остальные точки (отображаются только при наведении и если не выбраны) */}
        {isHovered && (
          <>
            {showRed && (
              <button
                className={`${styles.dot} ${styles.red}`}
                onClick={() => onChange("tight")}
                title="Тайтовый"
              />
            )}
            {showYellow && (
              <button
                className={`${styles.dot} ${styles.yellow}`}
                onClick={() => onChange("weak")}
                title="Слабый"
              />
            )}
            {showGreen && (
              <button
                className={`${styles.dot} ${styles.green}`}
                onClick={() => onChange("standard")}
                title="Стандартный"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatusPlayer;
