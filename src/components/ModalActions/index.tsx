import React, { useState, useEffect } from "react";
import { RootState } from "../../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updatePlayerAction } from "../../Redux/slice/infoPlayers";
import {
  setLostmaxBet,
  setLostsumBet,
} from "../../Redux/slice/actionLastStackSlice";
import { PlayerAction, ReduxPlayerAction } from "../type";
import { getMaxBet } from "../../utilits/getMaxBet";
import styles from "./stayle.module.scss";

interface ModalActionsProps {
  position: string;
  onClose: () => void;
}

const ModalActions: React.FC<ModalActionsProps> = ({ position, onClose }) => {
  const infoPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  );
  const mainPlayers = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );
  const useLastBet = useSelector(
    (state: RootState) => state.actionLastStackSlice
  );
  const dispatch = useDispatch();
  const currentBet = infoPlayers[position]?.bet || null;
  const baseActions = ["fold", "call", "raise", "allin"] as const;

  const [showBetInput, setShowBetInput] = useState(false);
  const [betValue, setBetValue] = useState("");
  const [showRaiseOptions, setShowRaiseOptions] = useState(false);

  // Проверяем, есть ли уже ставка (2-бет или выше)
  const hasRaise = getMaxBet(infoPlayers) > 1;

  const initialRaiseOptions = ["2bb", "3bb", "4bb"] as const;
  const subsequentRaiseOptions = ["33%", "50%", "75%", "100%"] as const;

  // Рассчитываем ставки для рейзов
  const maxBet = getMaxBet(infoPlayers);
  const sumBet = mainPlayers?.sumBet || 0;
  const coefficients: { [key in "33%" | "50%" | "75%" | "100%"]: number } = {
    "33%": 0.33,
    "50%": 0.5,
    "75%": 0.75,
    "100%": 1,
  };

  // Отладка входных данных
  console.log("infoPlayers:", infoPlayers);
  console.log("mainPlayers:", mainPlayers);
  console.log("maxBet:", maxBet, "sumBet:", sumBet, "currentBet:", currentBet);
  console.log("useLastBet:", useLastBet);

  // Отслеживание изменений useLastBet
  useEffect(() => {
    console.log("useLastBet updated:", useLastBet);
  }, [useLastBet]);

  const getRaiseBetValue = (action: PlayerAction): string => {
    if (["2bb", "3bb", "4bb"].includes(action)) {
      const multipliers: { [key in "2bb" | "3bb" | "4bb"]: number } = {
        "2bb": 2,
        "3bb": 3,
        "4bb": 4,
      };
      const multiplier = multipliers[action as "2bb" | "3bb" | "4bb"];
      const currentBetValue = parseFloat(currentBet?.replace("BB", "") || "0");
      if (maxBet === currentBetValue) {
        const betValue = useLastBet.lostMaxBet * multiplier;
        console.log(`Using last bet for ${action}:`, betValue);
        return Number(betValue.toFixed(1)) + "BB";
      }
      const betValue = maxBet * multiplier;
      console.log(`Using maxBet for ${action}:`, betValue);
      return Number(betValue.toFixed(1)) + "BB";
    }
    if (["33%", "50%", "75%", "100%"].includes(action)) {
      const coefficient =
        coefficients[action as "33%" | "50%" | "75%" | "100%"];
      const currentBetValue = parseFloat(currentBet?.replace("BB", "") || "0");
      if (maxBet === currentBetValue) {
        const betValue = Number(
          (
            useLastBet.lostMaxBet +
            (useLastBet.lostSumBet + useLastBet.lostMaxBet) * coefficient
          ).toFixed(1)
        );
        console.log(`Using last bet for ${action}:`, betValue);
        return `${betValue}BB`;
      }
      const betValue = Number(
        (maxBet + (sumBet + maxBet) * coefficient).toFixed(1)
      );
      console.log(`Using maxBet and sumBet for ${action}:`, betValue);
      return `${betValue}BB`;
    }
    return "0BB";
  };

  const handleActionClick = (value: ReduxPlayerAction) => {
    console.log("Action clicked:", value);
    if (value === "allin") {
      setShowBetInput(true);
    } else if (value === "raise") {
      setShowRaiseOptions(true);
    } else {
      dispatch(
        updatePlayerAction({
          position,
          action: value,
          customBet: undefined,
        })
      );
      onClose();
    }
  };

  const handleRaiseOptionClick = (value: PlayerAction) => {
    console.log("Raise option clicked:", value);
    const bet = getRaiseBetValue(value);
    const currentBetValue = parseFloat(currentBet?.replace("BB", "") || "0");

    // Update useLastBet only if maxBet !== currentBetValue
    if (maxBet !== currentBetValue) {
      if (["2bb", "3bb", "4bb"].includes(value)) {
        console.log("Dispatching setLostmaxBet:", { lostMaxBet: maxBet });
        dispatch(setLostmaxBet(maxBet));
      } else if (["33%", "50%", "75%", "100%"].includes(value)) {
        console.log("Dispatching setLostmaxBet and setLostsumBet:", {
          lostMaxBet: maxBet,
          lostSumBet: sumBet,
        });
        dispatch(setLostmaxBet(maxBet));
        dispatch(setLostsumBet(sumBet));
      }
    } else {
      console.log("Skipping useLastBet update: maxBet === currentBetValue");
    }

    dispatch(
      updatePlayerAction({
        position,
        action: "raise",
        customBet: bet,
      })
    );
    onClose();
  };

  const handleBetSubmit = () => {
    const parsedBet = parseFloat(betValue);
    const stackSize = infoPlayers[position]?.stackSize || 0;
    if (parsedBet > 0 && parsedBet <= stackSize) {
      dispatch(
        updatePlayerAction({
          position,
          action: "allin",
          customBet: `${parsedBet}BB`,
        })
      );
      onClose();
    }
  };

  const handleBackClick = () => {
    setShowRaiseOptions(false);
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
                {value}{" "}
                {["33%", "50%", "75%", "100%"].includes(value) &&
                  `(${getRaiseBetValue(value)})`}
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
