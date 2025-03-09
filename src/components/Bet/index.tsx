import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import styles from "./stayle.module.scss";

interface BetProps {
  position: string; // Позиция игрока (например, "BB", "SB", "UTG")
}

const Bet: React.FC<BetProps> = ({ position }) => {
  // Получаем данные игрока из слайса infoPlayers
  const player = useSelector(
    (state: RootState) => state.infoPlayers.players[position]
  );

  // Если игрок отсутствует или ставка не задана, возвращаем null (не отображаем компонент)
  if (!player || !player.bet) return null;

  return <div className={styles.bet}>{player.bet}</div>;
};

export default Bet;
