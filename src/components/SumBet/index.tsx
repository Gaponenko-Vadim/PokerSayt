import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { updateMainPlayerSumBet } from "../../Redux/slice/infoPlayers"; // Импортируем действие
import styles from "./stayle.module.scss";

const SumBet = () => {
  const ante = useSelector((state: RootState) => state.generalInformation.ante);
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.infoPlayers.players);
  const mainPlayers = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );

  // Функция для расчета общей суммы ставок
  const calculateSumBet = () => {
    const totalBet = Object.values(players).reduce((sum, player) => {
      if (player.bet) {
        const betValue = player.bet === "All-in" ? 0 : parseFloat(player.bet);
        return sum + betValue;
      }
      return sum;
    }, 0);

    const totalWithAnte = totalBet + Object.keys(players).length * ante;
    return totalWithAnte;
  };

  useEffect(() => {
    const totalWithAnte = calculateSumBet();

    // Если mainPlayers существует, обновляем его sumBet
    if (mainPlayers) {
      dispatch(updateMainPlayerSumBet({ sumBet: totalWithAnte }));
    }
  }, [players, dispatch, mainPlayers, ante]); // Зависимости: players, dispatch, mainPlayers

  const totalWithAnte = calculateSumBet(); // Для отображения
  console.log(mainPlayers);
  return (
    <div className={styles.sumBetContainer}>
      <h3>Общая сумма ставок:</h3>
      <p>
        <strong>{totalWithAnte.toFixed(2)}BB</strong>
      </p>
    </div>
  );
};

export default SumBet;
