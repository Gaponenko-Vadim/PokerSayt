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
  const [stackInputValue, setStackInputValue] = useState<string>(
    facktStack?.toString() || ""
  );
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

  const handleStackInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setStackInputValue(value);
    }
  };

  const handleOkClick = (anteAmount: number) => {
    setIsInputDisabled(true);
    dispatch(setAnte(anteAmount));
    const parsedValue = Number(stackInputValue);
    if (!isNaN(parsedValue) && parsedValue > 0 && stadiaFinal === "prize") {
      // Для призовой стадии обновляем оба значения
      dispatch(setStartingStack(parsedValue)); // Добавляем эту строку
      dispatch(setFacktStack(parsedValue));
      dispatch(setCalculateTournamentStacks({ startingStack: parsedValue }));
      setShowStackSelector(false);

      // Для отладки
      console.log("Updated values:", {
        startingStack: parsedValue,
        facktStack: parsedValue,
        currentStadia: stadiaFinal,
      });
    }
  };

  const handleStackSelect = (stadia: TypeGameStadia, stack: number) => {
    dispatch(setStartingStack(stack));
    const stackFinal = stackStadiaName(stadia, stack);
    dispatch(setFacktStack(stackFinal));
    dispatch(setCalculateTournamentStacks({ startingStack: stackFinal }));
    setShowStackSelector(false);
  };

  const handleStackInputConfirm = () => {
    const parsedValue = Number(stackInputValue);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      // Для призовой стадии обновляем оба значения
      dispatch(setStartingStack(parsedValue)); // Добавляем эту строку
      dispatch(setFacktStack(parsedValue));
      dispatch(setCalculateTournamentStacks({ startingStack: parsedValue }));
      setShowStackSelector(false);

      // Для отладки
      console.log("Updated values:", {
        startingStack: parsedValue,
        facktStack: parsedValue,
        currentStadia: stadiaFinal,
      });
    }
  };

  const renderStackSelector = (
    selectedStack: number,
    options: number[],
    onSelect: (stack: number) => void,
    title: string = "Выберите начальный стек:",
    containerClass: string = styles.stackSelection,
    buttonClass: string = styles.stackButton
  ) => {
    return (
      <div className={containerClass}>
        <h3 className={styles.stackTitle}>{title}</h3>
        <div className={styles.stackButtons}>
          {options.map((stack) => (
            <button
              key={stack}
              onClick={() => onSelect(stack)}
              className={`${buttonClass} ${
                selectedStack === stack ? styles.selected : ""
              }`}
            >
              {stack} ББ
            </button>
          ))}
        </div>
      </div>
    );
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
              средний cтек: {facktStack || startingStack} ББ
            </h2>
          </div>

          {showStackSelector && (
            <>
              {stadiaFinal === "prize" ? (
                <div className={styles.prizeStackContainer}>
                  <div className={styles.stackInputContainer}>
                    <input
                      type="text"
                      value={stackInputValue}
                      onChange={handleStackInputChange}
                      placeholder="Введите средний стек"
                      className={styles.input}
                    />
                  </div>
                  <button
                    onClick={handleStackInputConfirm}
                    className={`${styles.button} ${
                      Number(stackInputValue) === 0
                        ? styles.transparentButton
                        : ""
                    }`}
                    disabled={Number(stackInputValue) === 0}
                  >
                    OK
                  </button>
                </div>
              ) : (
                renderStackSelector(
                  startingStack,
                  stackOptions,
                  (stack) => handleStackSelect(stadiaFinal, stack),
                  "Выберите стек:",
                  styles.stackSelector
                )
              )}
            </>
          )}
        </div>
      ) : (
        <div className={styles.overlay}>
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
            <p className={styles.amount}>
              Текущая анте: {anteAmount.toFixed(2)}
            </p>

            {stadiaFinal === "prize" ? (
              <div className={styles.stackInputContainer}>
                <h3 className={styles.stackTitle}>Введите средний стек:</h3>
                <input
                  type="text"
                  value={stackInputValue}
                  onChange={handleStackInputChange}
                  placeholder="Введите средний стек"
                  className={styles.input}
                />
              </div>
            ) : (
              renderStackSelector(startingStack, stackOptions, (stack) =>
                handleStackSelect(stadiaFinal, stack)
              )
            )}

            <button
              onClick={() => handleOkClick(anteAmount)}
              className={styles.button}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingUpTheInitialStackAndAnte;
