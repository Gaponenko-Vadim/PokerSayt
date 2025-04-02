import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { calculateEquity } from "../../../utilits/allСombinations/calculateEquity";
import { updateMainPlayerEquity } from "../../../Redux/slice/infoPlayers";

type MainPlayers = {
  position: string;
  selectedCards?: string[];
  stackSize?: number;
  equity: number | null; // Эквити из Redux
};

type PlayerData = {
  position: string;
  action: string;
  stack: "little" | "middle" | "big" | null;
  stackSize: number;
  bet: string | null;
  status: string;
  cards: string[][];
};

const findMaxBetPlayerCards = (allPlayers: {
  [key: string]: PlayerData;
}): string[][] | null => {
  let maxBetPlayer: PlayerData | null = null;
  let maxBet = 0;

  for (const player of Object.values(allPlayers)) {
    if (player.bet) {
      const currentBet = parseFloat(player.bet);
      if (currentBet > maxBet) {
        maxBet = currentBet;
        maxBetPlayer = player;
      }
    }
  }

  return maxBetPlayer && maxBetPlayer.cards ? maxBetPlayer.cards : null;
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
    if (mainPlayer && mainPlayer.selectedCards?.length === 2) {
      try {
        const villainRange = findMaxBetPlayerCards(allPlayers);
        if (villainRange && villainRange.length > 0) {
          const calculatedEquity = calculateEquity(
            mainPlayer.selectedCards,
            villainRange
          );
          dispatch(updateMainPlayerEquity({ equity: calculatedEquity })); // Обновляем эквити в Redux
        } else {
          dispatch(updateMainPlayerEquity({ equity: null })); // Сбрасываем эквити в Redux
        }
      } catch (error) {
        console.error("Error calculating equity:", error);
        dispatch(updateMainPlayerEquity({ equity: null })); // Сбрасываем эквити в случае ошибки
      }
    } else {
      dispatch(updateMainPlayerEquity({ equity: null })); // Сбрасываем эквити, если данных недостаточно
    }
  }, [mainPlayer, allPlayers, dispatch]); // Зависимости: mainPlayer, allPlayers, dispatch

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
