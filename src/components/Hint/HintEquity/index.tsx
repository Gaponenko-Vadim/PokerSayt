import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { calculateEquity } from "../../../utilits/allСombinations/calculateEquity";

type MainPlayers = {
  position: string;
  selectedCards?: string[];
  stackSize?: number;
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
  const [equity, setEquity] = useState<number | null>(null);

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
        console.log(villainRange);
        if (villainRange && villainRange.length > 0) {
          const calculatedEquity = calculateEquity(
            mainPlayer.selectedCards,
            villainRange
          );
          setEquity(calculatedEquity);
        } else {
          setEquity(null);
        }
      } catch (error) {
        console.error("Error calculating equity:", error);
        setEquity(null);
      }
    } else {
      setEquity(null);
    }
  }, [mainPlayer, allPlayers]);

  return (
    <div className="hint-equity">
      {mainPlayer ? (
        equity !== null ? (
          <p>Эквити: {equity.toFixed(2)}%</p>
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
