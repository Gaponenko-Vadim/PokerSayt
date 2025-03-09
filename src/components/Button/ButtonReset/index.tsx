import { useDispatch } from "react-redux";
import { setNextPozition } from "../../../Redux/slice/pozitionSlice";
import { resetAllCards } from "../../../Redux/slice/cardSlice";
import { resetselectAction } from "../../../Redux/slice/infoPlayers"; // Импортируем из infoPlayers
import styles from "./stayle.module.scss";

const ButtonReset = () => {
  const dispatch = useDispatch();

  const handleResetAndChangePosition = () => {
    dispatch(resetAllCards()); // Сброс всех карт
    dispatch(setNextPozition()); // Изменение позиции
    dispatch(resetselectAction()); // Сброс состояния игроков и ставок
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
