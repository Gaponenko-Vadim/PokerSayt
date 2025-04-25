import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { calculateEquity } from "../../../utilits/allСombinations/calculateEquity";
import { updateMainPlayerEquity } from "../../../Redux/slice/infoPlayers";
// import { corelyaciya } from "../../../utilits/corelyaciya";
import { equityFull } from "../../../utilits/equityFull";

// Типы данных
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
      if (currentBet > maxBet) {
        maxBet = currentBet;
      }
    }
  }

  return Object.values(allPlayers).filter(
    (player) => player.bet && parseFloat(player.bet) === maxBet
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
    if (mainPlayer && mainPlayer.selectedCards?.length === 2) {
      try {
        const maxBetPlayers = findMaxBetPlayers(allPlayers);

        if (maxBetPlayers.length > 0) {
          // Рассчитываем эквити и сохраняем cards
          const results = maxBetPlayers.map((player, index) => {
            if (player.cards && player.cards.length > 0) {
              const equityResult = calculateEquity(
                mainPlayer.selectedCards!,
                player.cards
              );
              return {
                ...equityResult,
                cardsLength: player.cards.length,
                cards: player.cards,
                playerIndex: index,
              };
            }
            return null;
          });

          // Фильтруем валидные результаты
          const validResults = results.filter(
            (
              result
            ): result is {
              equity: number;
              totalCountSum: number;
              cardsLength: number;
              cards: string[][];
              playerIndex: number;
            } => result !== null && result.equity !== null
          );

          if (validResults.length > 0) {
            let averageEquity;

            if (validResults.length >= 1) {
              // Подготовим данные для equityFull: все диапазоны, эквити и totalCountSum
              const opponentRanges = validResults.map((result) => ({
                cards: result.cards,
                equity: result.equity,
                totalCountSum: result.totalCountSum,
              }));

              // Вычисляем общее эквити для всех диапазонов
              averageEquity = equityFull(
                opponentRanges,
                mainPlayer.selectedCards
              );
            } else {
              // Для одного диапазона: просто берем эквити
              averageEquity = validResults[0].equity;
            }

            dispatch(updateMainPlayerEquity({ equity: averageEquity }));
          } else {
            dispatch(updateMainPlayerEquity({ equity: null }));
          }
        } else {
          dispatch(updateMainPlayerEquity({ equity: null }));
        }
      } catch (error) {
        console.error("Ошибка при расчете эквити:", error);
        dispatch(updateMainPlayerEquity({ equity: null }));
      }
    } else {
      dispatch(updateMainPlayerEquity({ equity: null }));
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
