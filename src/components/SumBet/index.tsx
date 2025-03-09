import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import styles from "./stayle.module.scss";

const SumBet = () => {
  // Получаем данные о ставках из слайса infoPlayers
  const players = useSelector((state: RootState) => state.infoPlayers.players);

  // Рассчитываем общую сумму ставок
  const totalBet = Object.values(players).reduce((sum, player) => {
    if (player.bet) {
      // Преобразуем ставку в число (убираем "BB" или "All-in")
      const betValue = player.bet === "All-in" ? 0 : parseFloat(player.bet);
      return sum + betValue;
    }
    return sum;
  }, 0);

  // Добавляем анте (0.2BB за каждую позицию)
  const ante = 0.2;
  const totalWithAnte = totalBet + Object.keys(players).length * ante;

  return (
    <div className={styles.sumBetContainer}>
      <h3>Общая сумма ставок:</h3>

      <p>
        <strong> {totalWithAnte.toFixed(2)}BB</strong>
      </p>
    </div>
  );
};

export default SumBet;
