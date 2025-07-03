import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { updateMainPlayerEquity } from "../../../Redux/slice/infoPlayers";
import { setMaxBetPlayers } from "../../../Redux/slice/generalInformation";
import { calculateMultiPotEquity } from "../../../utilits/calculateMultiPotEquity";

// Типы данных (можно вынести в отдельный файл types.ts)
type MainPlayers = {
  position: string;
  selectedCards?: string[];
  stackSize?: number;
  equity: number | null;
};

type PlayerData = {
  position: string;
  action: string;
  stack: "little" | "middle" | "big" | null;
  stackSize: number;
  bet: string | null;
  status: string;
  cards: string[][];
  cardsdiaposon: string[];
};

const findMaxBetPlayers = (allPlayers: {
  [key: string]: PlayerData;
}): PlayerData[] => {
  let maxBet = 0;

  for (const player of Object.values(allPlayers)) {
    if (player.bet) {
      const currentBet = parseFloat(player.bet);
      if (!isNaN(currentBet) && currentBet > maxBet) {
        maxBet = currentBet;
      }
    }
  }

  return Object.values(allPlayers).filter(
    (player) =>
      player.bet &&
      !isNaN(parseFloat(player.bet)) &&
      parseFloat(player.bet) === maxBet
  );
};

const HintEquity = () => {
  const dispatch = useDispatch();

  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  ) as MainPlayers | undefined;

  const allPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  ) as { [key: string]: PlayerData };

  useEffect(() => {
    if (!mainPlayer?.selectedCards || mainPlayer.selectedCards.length !== 2) {
      dispatch(updateMainPlayerEquity({ equity: null }));
      dispatch(setMaxBetPlayers([])); // Очищаем maxBetPlayers, если нет данных
      return;
    }

    try {
      const maxBetPlayers = findMaxBetPlayers(allPlayers);

      // Сохраняем maxBetPlayers в Redux
      dispatch(setMaxBetPlayers(maxBetPlayers));

      if (maxBetPlayers.length === 0) {
        dispatch(updateMainPlayerEquity({ equity: null }));
        return;
      }

      // Используем вынесенную функцию
      const equity = calculateMultiPotEquity(
        mainPlayer.selectedCards,
        maxBetPlayers.map((p) => ({ cards: p.cards }))
      );

      dispatch(updateMainPlayerEquity({ equity }));
    } catch (error) {
      console.error("Ошибка при расчете эквити:", error);
      dispatch(updateMainPlayerEquity({ equity: null }));
      dispatch(setMaxBetPlayers([])); // Очищаем maxBetPlayers при ошибке
    }
  }, [mainPlayer, allPlayers, dispatch]);

  return (
    <div className="hint-equity">
      {mainPlayer ? (
        mainPlayer.equity !== null ? (
          <p>Эквити: {mainPlayer.equity.toFixed(2)}%</p>
        ) : (
          <p>Недостаточно данных для расчета эквити</p>
        )
      ) : (
        <p>Игрок не выбран</p>
      )}
    </div>
  );
};

export default HintEquity;
