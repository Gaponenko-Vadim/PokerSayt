import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { setNextPozition } from "../../Redux/slice/pozitionSlice";
import {
  initializeMainPlayer,
  updateMainPlayerMyBet,
} from "../../Redux/slice/infoPlayers";
import styles from "./style.module.scss";
import MenuStack from "../MenuStack";

// Тип для пропсов
type TypeMainProps = {
  player: {
    action: string;
    stack: "little" | "middle" | "big" | null;
  };
  currentPosition: string;
};

// Компонент с типизацией
const MainPlayer: React.FC<TypeMainProps> = ({ currentPosition, player }) => {
  const dispatch = useDispatch();
  const selectedCards = useSelector(
    (state: RootState) => state.cardSlice.selectedCards
  );
  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );
  const players = useSelector((state: RootState) => state.infoPlayers.players);

  // Инициализация позиции mainPlayer
  useEffect(() => {
    if (currentPosition) {
      dispatch(initializeMainPlayer({ position: currentPosition }));
    }
  }, [currentPosition, dispatch]);

  // Обновление карт mainPlayer
  useEffect(() => {
    if (selectedCards && selectedCards.length > 1) {
      dispatch(initializeMainPlayer({ cards: selectedCards }));
    }
  }, [selectedCards, dispatch]);

  // Синхронизация myBet с players[mainPlayer.position].bet с учетом анте
  useEffect(() => {
    if (mainPlayer && mainPlayer.position && players[mainPlayer.position]) {
      const currentBet = players[mainPlayer.position].bet;
      const ante = 0.2; // Анте 0.2 BB

      // Рассчитываем myBet с учетом анте
      let myBet: string | null;
      if (currentBet === "All-in") {
        myBet = "All-in"; // Если олл-ин, оставляем как есть
      } else if (currentBet) {
        const betValue = parseFloat(currentBet); // Убираем "BB" и парсим число
        myBet = `${(betValue + ante).toFixed(2)}BB`; // Добавляем анте к ставке
      } else {
        myBet = `${ante}BB`; // Если ставки нет, myBet равно только анте
      }

      // Обновляем myBet, если оно отличается
      if (myBet !== mainPlayer.myBet) {
        dispatch(updateMainPlayerMyBet({ myBet }));
      }
    }
  }, [mainPlayer, players, dispatch]);

  return (
    <>
      <div
        className={styles.player}
        onClick={() => dispatch(setNextPozition())}
      >
        {currentPosition}
        {mainPlayer && mainPlayer.myBet && (
          <span className={styles.bet}> ({mainPlayer.myBet})</span>
        )}
      </div>
      <MenuStack currentPosition={currentPosition} player={player} />
    </>
  );
};

export default MainPlayer;
