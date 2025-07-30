import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/store";
import styles from "./stayle.module.scss";
import {
  setAnte,
  setStartingStack,
  setFacktStack,
} from "../../Redux/slice/generalInformation";
import { setCalculateTournamentStacks } from "../../Redux/slice/infoPlayers";
import { TypeGameStadia } from "../type";
import { stackStadiaName } from "../../utilits/stackStadiaName";

const SettingUpTheInitialStackAndAnte: React.FC = () => {
  const fullPosition: string[] = useSelector(
    (state: RootState) => state.pozitionSlice.value || []
  );
  const ante = useSelector((state: RootState) => state.generalInformation.ante);
  const startingStack = useSelector(
    (state: RootState) => state.generalInformation.startingStack
  );
  const facktStack = useSelector(
    (state: RootState) => state.generalInformation.facktStack
  );
  const stadia = useSelector((state: RootState) => state.infoPlayers.stadia);
  const stadiaFinal: TypeGameStadia = stadia !== null ? stadia : "initial";
  const dispatch = useDispatch();
  const vsegoPosition: number = fullPosition.length;

  const [anteAmount, setAnteAmount] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const disabled = ante === 0 ? false : true;
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(disabled);
  const [showStackSelector, setShowStackSelector] = useState<boolean>(false);

  const stackOptions = [250, 200, 125, 100, 50];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setInputValue(value);
      const parsedValue = Number(value);
      const result =
        vsegoPosition > 0 ? (parsedValue - 1.5) / vsegoPosition : 0;
      setAnteAmount(isNaN(parsedValue) ? 0 : result);
    }
  };

  const handleOkClick = (anteAmount: number) => {
    setIsInputDisabled(true);
    dispatch(setAnte(anteAmount));
  };

  const handleStackSelect = (stadia: TypeGameStadia, stack: number) => {
    dispatch(setStartingStack(stack));
    const stackFinal = stackStadiaName(stadia, stack);
    dispatch(setFacktStack(stackFinal));
    dispatch(setCalculateTournamentStacks({ startingStack: stackFinal }));
    setShowStackSelector(false);
  };

  return (
    <>
      {isInputDisabled ? (
        <div className={styles.container__ante}>
          <div
            onClick={() => setIsInputDisabled(false)}
            className={styles.anteDisplay}
          >
            <h2 className={styles.title}>
              {anteAmount.toFixed(2)} анте сейчас
            </h2>
          </div>
          <div
            onClick={() => setShowStackSelector(!showStackSelector)}
            className={styles.stackDisplay}
          >
            <h2 className={styles.title}>
              средний cтек: {facktStack || 100} ББ
            </h2>
          </div>

          {showStackSelector && (
            <div className={styles.stackSelector}>
              {stackOptions.map((stack) => (
                <button
                  key={stack}
                  onClick={() => handleStackSelect(stadiaFinal, stack)}
                  className={styles.stackButton}
                >
                  {stack} ББ
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.container}>
          <h3 className={styles.title}>
            Введите сумму общего банка с малым и большим BB
          </h3>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Введите сумму"
            className={styles.input}
          />
          <p className={styles.amount}>Текущая анте: {anteAmount.toFixed(2)}</p>

          <div className={styles.stackSelection}>
            <h3 className={styles.stackTitle}>Выберите начальный стек:</h3>
            <div className={styles.stackButtons}>
              {stackOptions.map((stack) => (
                <button
                  key={stack}
                  onClick={() => handleStackSelect(stadiaFinal, stack)}
                  className={`${styles.stackButton} ${
                    startingStack === stack ? styles.selected : ""
                  }`}
                >
                  {stack} ББ
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleOkClick(anteAmount)}
            className={styles.button}
          >
            OK
          </button>
        </div>
      )}
    </>
  );
};

export default SettingUpTheInitialStackAndAnte;
