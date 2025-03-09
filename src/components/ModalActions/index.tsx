import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updatePlayerAction } from "../../Redux/slice/infoPlayers";
import styles from "./stayle.module.scss";

type PlayerAction = "fold" | "call" | "raise" | "allin";

interface ModalActionsProps {
  position: string;
  onClose: () => void;
}

const ModalActions: React.FC<ModalActionsProps> = ({ position, onClose }) => {
  const dispatch = useDispatch();
  const allActions = ["fold", "call", "raise", "allin"] as const;

  const [showBetInput, setShowBetInput] = useState(false);
  const [betValue, setBetValue] = useState("");

  const handleActionClick = (value: PlayerAction) => {
    if (value === "allin") {
      setShowBetInput(true);
    } else {
      dispatch(updatePlayerAction({ position, action: value }));
      onClose();
    }
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
      ) : (
        <ul className={styles.list}>
          {allActions.map((value, i) => (
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
