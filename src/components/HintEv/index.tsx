import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { calculateEV } from "../../utilits/allСombinations/calculateEV";

const HintEv = () => {
  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );
  const allPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  );

  // Используем состояние для хранения значения EV
  const [ev, setEv] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем, что mainPlayer и allPlayers существуют
    if (!mainPlayer || !allPlayers) {
      setError("Данные игроков не загружены.");
      setEv(null);
      return;
    }

    // Проверяем, что selectedCards содержит 2 карты
    if (!mainPlayer.selectedCards || mainPlayer.selectedCards.length !== 2) {
      setError("Недостаточно данных для расчета EV: отсутствуют карты.");
      setEv(null);
      return;
    }

    // Проверяем, что stackSize mainPlayer определен
    if (mainPlayer.stackSize === undefined || mainPlayer.stackSize === null) {
      setError("Недостаточно данных для расчета EV: отсутствует стек.");
      setEv(null);
      return;
    }

    // Если все данные на месте, рассчитываем EV
    try {
      const evCalc = calculateEV(mainPlayer, allPlayers);
      setEv(evCalc); // Обновляем состояние
      setError(null); // Сбрасываем ошибку, если она была
    } catch {
      // Убрали переменную 'e', так как она не используется
      setError("Ошибка при расчете EV.");
      setEv(null);
    }
  }, [mainPlayer, allPlayers]); // Зависимости: mainPlayer и allPlayers // Зависимости: mainPlayer и allPlayers

  return (
    <div>
      {error ? (
        <div>{error}</div> // Показываем ошибку, если она есть
      ) : ev !== null ? (
        <div>EV: {ev}</div> // Показываем EV, если он рассчитан
      ) : (
        <div>Загрузка данных...</div> // Сообщение о загрузке
      )}
    </div>
  );
};

export default HintEv;
