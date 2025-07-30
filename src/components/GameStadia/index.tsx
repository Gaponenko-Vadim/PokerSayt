import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { TypeGameStadia } from "../type";
import { updateGameStadia } from "../../Redux/slice/infoPlayers";
import { setCalculateTournamentStacks } from "../../Redux/slice/infoPlayers";
import { stackStadiaName } from "../../utilits/stackStadiaName";
import { setFacktStack } from "../../Redux/slice/generalInformation";
import styles from "./stayle.module.css";

const GameStadia: React.FC = () => {
  const dispatch = useDispatch();
  const selectedStadia = useSelector(
    (state: RootState) => state.infoPlayers.stadia
  );
  const baseStartingStack = useSelector(
    (state: RootState) => state.generalInformation.startingStack
  );

  const stadiaOptions: TypeGameStadia[] = [
    "initial",
    "Average",
    "late",
    "prize",
  ];

  const handleStadiaClick = (stadia: TypeGameStadia) => {
    const stadiaFinal: TypeGameStadia = stadia !== null ? stadia : "initial";
    if (selectedStadia === stadia) {
      dispatch(updateGameStadia({ stadia: null }));
    } else {
      const newStack = stackStadiaName(stadiaFinal, baseStartingStack);
      dispatch(setFacktStack(newStack));
      dispatch(updateGameStadia({ stadia: stadiaFinal }));
      dispatch(setCalculateTournamentStacks({ startingStack: newStack }));
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
