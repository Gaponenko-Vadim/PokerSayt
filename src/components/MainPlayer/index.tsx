import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { setNextPozition } from "../../Redux/slice/pozitionSlice";
import { initializeMainPlayer } from "../../Redux/slice/infoPlayers";
import styles from "./style.module.scss";
import MenuStack from "../MenuStack";

// Тип для пропсов
type TypeMainProps = {
  player: {
    action: string;
    stack: "little" | "middle" | "big" | null; // Уточняем тип стека
  };
  currentPosition: string; // Текущая позиция
};

// Компонент с типизацией
const MainPlayer: React.FC<TypeMainProps> = ({ currentPosition, player }) => {
  const dispatch = useDispatch();
  const selectedCards = useSelector(
    (state: RootState) => state.cardSlice.selectedCards
  );

  useEffect(() => {
    if (currentPosition) {
      dispatch(initializeMainPlayer({ position: currentPosition }));
    }
  });

  useEffect(() => {
    // Если есть выбранные карты, добавляем их
    if (selectedCards && selectedCards.length > 1) {
      dispatch(initializeMainPlayer({ cards: selectedCards }));
    }
  }, [selectedCards, dispatch]);

  return (
    <>
      <div
        className={styles.player}
        onClick={() => dispatch(setNextPozition())}
      >
        {currentPosition}
      </div>
      <MenuStack currentPosition={currentPosition} player={player} />
    </>
  );
};

export default MainPlayer;
