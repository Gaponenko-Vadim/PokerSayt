import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { calculateEquity } from "../../../utilits/allСombinations/calculateEquity";

// Определяем типы для MainPlayers и PlayerData
type MainPlayers = {
  position: string;
  selectedCards?: string[]; // ['8черва', '9трефа']
  stackSize?: number;
};

type PlayerData = {
  position: string;
  action: string;
  stack: "little" | "middle" | "big" | null;
  stackSize: number;
  bet: string | null;
  status: string;
  cards: string[][]; // [['2пика', '2черва'], ['2пика', '2трефа']]
};

const HintEquity = () => {
  // Добавляем тип для состояния: число (эквити) или null
  const [aq, setAq] = useState<number | null>(null);

  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  ) as MainPlayers | undefined;

  const allPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  ) as { [key: string]: PlayerData };

  useEffect(() => {
    // Проверяем наличие mainPlayer и selectedCards
    if (mainPlayer && mainPlayer.selectedCards) {
      try {
        const equity = calculateEquity(allPlayers, mainPlayer.selectedCards);
        setAq(equity);
      } catch (error) {
        console.error("Error calculating equity:", error);
        setAq(null);
      }
    } else {
      setAq(null); // Если данных нет, сбрасываем эквити
    }
  }, [mainPlayer, allPlayers]);

  return (
    <div className="hint-equity">
      {mainPlayer ? (
        aq !== null ? (
          <p>Эквити: {aq}%</p>
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
