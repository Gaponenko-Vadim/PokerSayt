import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import styles from "./stayle.module.scss";
import { getMaxBet } from "../../utilits/getMaxBet";

interface BetProps {
  position: string; // Позиция игрока (например, "BB", "SB", "UTG")
}

const Bet: React.FC<BetProps> = ({ position }) => {
  const player = useSelector(
    (state: RootState) => state.infoPlayers.players[position]
  );
  const players = useSelector((state: RootState) => state.infoPlayers.players);
  const maxBet = getMaxBet(players);

  // Если игрок отсутствует или ставка не задана, не отображаем компонент
  if (!player || !player.bet) return null;

  // Определяем тип ставки
  const isAllIn =
    player.action === "allin" ||
    (parseFloat(player.bet) >= (player.stackSize || 0) &&
      player.action !== "fold");

  const isMaxBet = parseFloat(player.bet) === maxBet && !isAllIn;

  return (
    <div
      className={`${styles.bet} 
        ${isAllIn ? styles.allInBet : ""} 
        ${isMaxBet ? styles.maxBet : ""}`}
      data-bet={isAllIn ? "All-in" : isMaxBet ? "MaxBet" : undefined}
      style={{
        backgroundColor: isAllIn ? "red" : isMaxBet ? "yellow" : "", // стандартный цвет из CSS
        color: isAllIn ? "white" : "", // улучшаем читаемость на красном фоне
      }}
    >
      {player.bet}
    </div>
  );
};

export default Bet;
