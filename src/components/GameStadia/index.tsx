import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store"; // Предполагаем, что RootState определён
import { updateGameStadia } from "../../Redux/slice/infoPlayers"; // Импортируем действие
import styles from "./stayle.module.css";

export type TypeGameStadia = "initial" | "Average" | "late" | "prize";

const GameStadia: React.FC = () => {
  const dispatch = useDispatch();
  const selectedStadia = useSelector(
    (state: RootState) => state.infoPlayers.stadia
  ); // Получаем стадию из Redux

  const stadiaOptions: TypeGameStadia[] = [
    "initial",
    "Average",
    "late",
    "prize",
  ];

  const handleStadiaClick = (stadia: TypeGameStadia) => {
    if (selectedStadia === stadia) {
      dispatch(updateGameStadia({ stadia: null })); // Сбрасываем выбор
    } else {
      dispatch(updateGameStadia({ stadia })); // Устанавливаем новую стадию
    }
  };

  const getStadiaClass = (stadia: TypeGameStadia) => {
    switch (stadia) {
      case "initial":
        return styles.initial;
      case "Average":
        return styles.average;
      case "late":
        return styles.late;
      case "prize":
        return styles.prize;
      default:
        return "";
    }
  };

  return (
    <div className={styles.gameStadiaContainer}>
      {!selectedStadia && <h2 className={styles.title}>Game Stadia</h2>}
      <ul className={styles.stadiaList}>
        {stadiaOptions.map((stadia) => (
          <li
            key={stadia}
            className={`${styles.stadiaItem} ${getStadiaClass(stadia)} ${
              selectedStadia === stadia
                ? styles.selected
                : selectedStadia
                ? styles.hidden
                : ""
            }`}
            onClick={() => handleStadiaClick(stadia)}
          >
            {stadia}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameStadia;
