import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { calculateEquity } from "../../../utilits/allСombinations/calculateEquity";
import { updateMainPlayerEquity } from "../../../Redux/slice/infoPlayers";
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

// type EquityResult = {
//   equity: number | null;
//   totalCountSum: number;
//   handDetails: Array<{
//     hand: string;
//     combinations: number;
//     equity: number;
//     contribution: number;
//   }>;
// };

// Тип для валидных результатов с equity: number
type ValidEquityResult = {
  equity: number;
  totalCountSum: number;
  handDetails: Array<{
    hand: string;
    combinations: number;
    equity: number;
    contribution: number;
  }>;
  cardsLength: number;
  cards: string[][];
  playerIndex: number;
};

// Тип для OpponentRange (для equityFull)
type OpponentRange = {
  cards: string[][];
  equity: number;
  totalCountSum: number;
  handDetails: Array<{
    hand: string;
    combinations: number;
    equity: number;
    contribution: number;
  }>;
};

// Функция для поиска игроков с максимальной ставкой
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
    // Проверяем, что mainPlayer существует и имеет две карты
    if (
      !mainPlayer ||
      !mainPlayer.selectedCards ||
      mainPlayer.selectedCards.length !== 2
    ) {
      dispatch(updateMainPlayerEquity({ equity: null }));
      return;
    }

    try {
      const maxBetPlayers = findMaxBetPlayers(allPlayers);

      // Если нет игроков с максимальной ставкой, сбрасываем эквити
      if (maxBetPlayers.length === 0) {
        dispatch(updateMainPlayerEquity({ equity: null }));
        return;
      }

      // Рассчитываем эквити для каждого игрока
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

      // Фильтруем валидные результаты (с ненулевым эквити)
      const validResults = results.filter(
        (result): result is ValidEquityResult =>
          result !== null && result.equity !== null
      );

      if (validResults.length > 0) {
        let averageEquity: number;

        if (validResults.length > 1) {
          // Подготовка данных для equityFull
          const opponentRanges: OpponentRange[] = validResults.map(
            (result) => ({
              cards: result.cards,
              equity: result.equity,
              totalCountSum: result.totalCountSum,
              handDetails: result.handDetails,
            })
          );

          // Вычисляем эквити для мультипота
          const equityFullResult = equityFull(
            opponentRanges,
            mainPlayer.selectedCards!
          );
          if (equityFullResult === null) {
            dispatch(updateMainPlayerEquity({ equity: null }));
            return;
          }
          averageEquity = equityFullResult;
        } else {
          // Для одного оппонента берём эквити напрямую
          averageEquity = validResults[0].equity;
        }

        dispatch(updateMainPlayerEquity({ equity: averageEquity }));
      } else {
        dispatch(updateMainPlayerEquity({ equity: null }));
      }
    } catch (error) {
      console.error("Ошибка при расчете эквити:", error);
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
