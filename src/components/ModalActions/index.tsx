import React, { useState } from "react";
import { RootState } from "../../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updatePlayerAction } from "../../Redux/slice/infoPlayers";
import styles from "./stayle.module.scss";
import { PlayerAction } from "../type";

interface ModalActionsProps {
  position: string;
  onClose: () => void;
}

const ModalActions: React.FC<ModalActionsProps> = ({ position, onClose }) => {
  const infoPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  );
  const dispatch = useDispatch();
  const baseActions = ["fold", "call", "raise", "allin"] as const;

  const [showBetInput, setShowBetInput] = useState(false);
  const [betValue, setBetValue] = useState("");
  const [showRaiseOptions, setShowRaiseOptions] = useState(false); // Состояние для подменю raise

  // Проверяем, есть ли у любого игрока "raise 2bb", "raise 3bb", "raise 4bb" или другие рейзы
  const hasRaise = Object.values(infoPlayers).some(
    (player) =>
      player.action === "2bb" ||
      player.action === "3bb" ||
      player.action === "4bb" ||
      player.action === "33%" ||
      player.action === "50%" ||
      player.action === "75%" ||
      player.action === "100%"
  );

  // Опции для первого уровня рейза
  const initialRaiseOptions = ["2bb", "3bb", "4bb"] as const;
  // Опции для второго уровня рейза (после первого рейза)
  const subsequentRaiseOptions = ["33%", "50%", "75%", "100%"] as const;

  const handleActionClick = (value: PlayerAction) => {
    if (value === "allin") {
      setShowBetInput(true);
    } else if (value === "raise") {
      setShowRaiseOptions(true); // Показываем подменю raise
    } else {
      dispatch(updatePlayerAction({ position, action: value }));
      onClose();
    }
  };

  const handleRaiseOptionClick = (value: PlayerAction) => {
    dispatch(updatePlayerAction({ position, action: value }));
    onClose();
  };

  const handleBetSubmit = () => {
    if (betValue) {
      dispatch(
        updatePlayerAction({
          position,
          action: "allin",
          customBet: `${betValue}BB`,
        })
      );
      onClose();
    }
  };

  const handleBackClick = () => {
    setShowRaiseOptions(false); // Возвращаемся к основному списку
  };

  return (
    <>
      {showBetInput ? (
        <div className={styles.betInputContainer}>
          <input
            type="number"
            placeholder="Введите количество BB"
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            className={styles.betInput}
          />
          <p>ставка</p>
          <button onClick={handleBetSubmit} className={styles.betSubmitButton}>
            Подтвердить
          </button>
        </div>
      ) : showRaiseOptions ? (
        <ul className={styles.list}>
          {(hasRaise ? subsequentRaiseOptions : initialRaiseOptions).map(
            (value, i) => (
              <li key={i} onClick={() => handleRaiseOptionClick(value)}>
                {value}
              </li>
            )
          )}
          <li key="back" onClick={handleBackClick}>
            Назад
          </li>
        </ul>
      ) : (
        <ul className={styles.list}>
          {baseActions.map((value, i) => (
            <li key={i} onClick={() => handleActionClick(value)}>
              {value}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ModalActions;
