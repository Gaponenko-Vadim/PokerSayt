import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/store";
import styles from "./stayle.module.scss";
import { setAnte } from "../../Redux/slice/generalInformation";

const Ante: React.FC = () => {
  const fullPosition: string[] = useSelector(
    (state: RootState) => state.pozitionSlice.value || []
  );
  const ante = useSelector((state: RootState) => state.generalInformation.ante);
  const dispatch = useDispatch();
  const vsegoPosition: number = fullPosition.length;
  // Локальное состояние для хранения введённой суммы
  const [anteAmount, setAnteAmount] = useState<number>(0);
  // Локальное состояние для значения в поле ввода
  const [inputValue, setInputValue] = useState<string>("");
  const disabled = ante === 0 ? false : true;
  // Локальное состояние для управления видимостью формы ввода
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(disabled);
  console.log("ante", isInputDisabled);

  // Обработчик изменения ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры, десятичную точку и пустую строку
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setInputValue(value);
      const parsedValue = Number(value);
      const result =
        vsegoPosition > 0 ? (parsedValue - 1.5) / vsegoPosition : 0;
      setAnteAmount(isNaN(parsedValue) ? 0 : result);
    }
  };

  // Обработчик нажатия кнопки "OK"
  const handleOkClick = (anteAmount: number) => {
    setIsInputDisabled(true);
    dispatch(setAnte(anteAmount));
    // Скрываем форму ввода и показываем зафиксированное значение
  };

  return (
    <>
      {isInputDisabled ? (
        <div
          className={styles.container__ante}
          onClick={() => {
            setIsInputDisabled(false);
          }}
        >
          <h2 className={styles.title}>{anteAmount.toFixed(2)} анте сейчас</h2>
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

export default Ante;
