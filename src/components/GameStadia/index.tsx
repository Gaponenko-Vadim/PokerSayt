import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { TypeGameStadia } from "../type";
import { updateGameStadia } from "../../Redux/slice/infoPlayers";
import { setCalculateTournamentStacks } from "../../Redux/slice/infoPlayers";
import { stackStadiaName } from "../../utilits/stackStadiaName";
import {
  setFacktStack,
  setStartingStack,
} from "../../Redux/slice/generalInformation";
import styles from "./stayle.module.css";

const GameStadia: React.FC = () => {
  const dispatch = useDispatch();
  const selectedStadia = useSelector(
    (state: RootState) => state.infoPlayers.stadia
  );
  const baseStartingStack = useSelector(
    (state: RootState) => state.generalInformation.startingStack
  );
  const [showPrizeInput, setShowPrizeInput] = useState(false);
  const [prizeStackValue, setPrizeStackValue] = useState("");
  const newStackPrizeStackValue = Number(prizeStackValue);

  const stadiaOptions: TypeGameStadia[] = [
    "initial",
    "Average",
    "late",
    "prize",
  ];

  const handleStadiaClick = (stadia: TypeGameStadia) => {
    // Если кликаем на уже выбранную стадию
    if (selectedStadia === stadia) {
      // Для prize нужно сначала ввести значение
      if (stadia === "prize" && showPrizeInput) return;

      dispatch(updateGameStadia({ stadia: null }));
      setShowPrizeInput(false);
      return;
    }

    // Если переходим на prize из другой стадии
    if (stadia === "prize" && selectedStadia !== "prize") {
      dispatch(setStartingStack(0)); // Обнуляем стек
      setPrizeStackValue(""); // Сбрасываем введенное значение
      setShowPrizeInput(true);
      return;
    }

    // Обычный переход между стадиями
    const newStack = stackStadiaName(
      stadia,
      baseStartingStack,
      newStackPrizeStackValue
    );
    dispatch(setFacktStack(newStack));
    dispatch(updateGameStadia({ stadia }));
    dispatch(setCalculateTournamentStacks({ startingStack: newStack }));
    setShowPrizeInput(false);
  };

  const handlePrizeStackSubmit = () => {
    const stackValue = Number(prizeStackValue);
    if (stackValue > 0) {
      const newStack = stackStadiaName(
        "prize",
        stackValue,
        newStackPrizeStackValue
      );
      dispatch(setStartingStack(stackValue));
      dispatch(setFacktStack(newStack));
      dispatch(updateGameStadia({ stadia: "prize" }));
      dispatch(setCalculateTournamentStacks({ startingStack: newStack }));
      setShowPrizeInput(false);
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
      {!selectedStadia && !showPrizeInput && (
        <h2 className={styles.title}>Game Stadia</h2>
      )}

      {showPrizeInput ? (
        <div className={styles.prizeInputContainer}>
          <input
            type="number"
            value={prizeStackValue}
            onChange={(e) => setPrizeStackValue(e.target.value)}
            placeholder="Введите размер стека (мин. 1)"
            className={styles.input}
            min="1"
          />
          <button
            onClick={handlePrizeStackSubmit}
            disabled={!prizeStackValue || Number(prizeStackValue) <= 0}
            className={`${styles.button} ${
              !prizeStackValue || Number(prizeStackValue) <= 0
                ? styles.disabledButton
                : ""
            }`}
          >
            Подтвердить
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default GameStadia;
