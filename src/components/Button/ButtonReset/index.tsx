import { useDispatch } from "react-redux";
import { setNextPozition } from "../../../Redux/slice/pozitionSlice";
import { resetAllCards } from "../../../Redux/slice/cardSlice";
import { resetselectAction } from "../../../Redux/slice/infoPlayers"; // Импортируем из infoPlayers
import { resetselectLostAction } from "../../../Redux/slice/actionLastStackSlice";
import styles from "./stayle.module.scss";
import React from "react";
interface FlopProps {
  setFlop: (isOpen: boolean) => void;
}
const ButtonReset: React.FC<FlopProps> = ({ setFlop }) => {
  const dispatch = useDispatch();

  const handleResetAndChangePosition = () => {
    dispatch(resetAllCards()); // Сброс всех карт
    dispatch(setNextPozition()); // Изменение позиции
    dispatch(resetselectAction()); // Сброс состояния игроков и ставок
    dispatch(resetselectLostAction());

    setFlop(false);
  };

  return (
    <button
      className={styles.resetButton}
      onClick={handleResetAndChangePosition}
    >
      Новая раздача
    </button>
  );
};

export default ButtonReset;
