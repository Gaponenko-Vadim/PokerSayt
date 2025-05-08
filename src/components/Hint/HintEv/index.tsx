import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { PlayerData } from "../../type";
import { calculateEquityFold } from "../../../utilits/calculateEquityFold";
import { calculatePercentageRaiseBets } from "../../../utilits/calculatePercentageRaiseBets";
import { getMaxBet } from "../../../utilits/getMaxBet";

const HintEv = () => {
  const infoPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  );

  const fullPosition = useSelector(
    (state: RootState) => state.pozitionSlice.value
  );

  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers?.selectedCards
  );
  const mainPlayerBet = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers?.myBet
  );
  const positionMainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers?.position
  );

  const sumBet =
    useSelector((state: RootState) => state.infoPlayers.mainPlayers?.sumBet) ||
    0;
  const maxBet = getMaxBet(infoPlayers);

  const findMaxBetPlayerCards = (allPlayers: { [key: string]: PlayerData }) => {
    let maxBet = 0;

    // Находим максимальную ставку
    for (const player of Object.values(allPlayers)) {
      if (player.bet) {
        const currentBet = parseFloat(player.bet);
        if (currentBet > maxBet) {
          maxBet = currentBet;
        }
      }
    }

    // Собираем данные игроков с максимальной ставкой
    const maxBetPlayers = Object.values(allPlayers)
      .filter((player) => player.bet && parseFloat(player.bet) === maxBet)
      .map((player) => ({
        position: player.position,
        cards: player.cards, // cards в формате string[][], например [["2пика", "2черва"]]
        status: player.status,
        stack: player.stack,
        stackSize: player.stackSize,
        count: player.count,
        bet: player.bet,
      }));

    // Передаем данные в calculateEquityFold, если mainPlayer и positionMainPlayer определены
    if (
      mainPlayer &&
      Array.isArray(mainPlayer) &&
      positionMainPlayer !== undefined
    ) {
      return calculateEquityFold(
        maxBetPlayers,
        mainPlayer,
        positionMainPlayer,
        fullPosition
      );
    }
    // Возвращаем пустой массив, если mainPlayer или positionMainPlayer отсутствуют
    return [];
  };

  const result = findMaxBetPlayerCards(infoPlayers);
  console.log("моя позиция", positionMainPlayer);
  const bet = calculatePercentageRaiseBets(maxBet, sumBet);
  const ev = (
    bet: number,
    FoldPercentage: number,
    mainPlayerBet: string,
    sumBet: number,
    EquityVsDefend: number,
    maxBet: number
  ) => {
    const numberPart = parseFloat(mainPlayerBet) - 0.2;
    return (
      sumBet * FoldPercentage +
      (1 - FoldPercentage) *
        (EquityVsDefend * (sumBet + (bet - numberPart) + (bet - maxBet)) -
          (bet - numberPart))
    );
  };

  return (
    <>
      {/* Отображаем данные игроков с максимальной ставкой */}
      {result.length > 0 ? (
        result.map((player, index) => (
          <div key={index}>
            {mainPlayerBet && player.AverageEquityVsDefend
              ? ev(
                  bet[50],
                  player.AverageFoldPercentage / 100,
                  mainPlayerBet,
                  sumBet,
                  player.AverageEquityVsDefend / 100,
                  maxBet
                ).toFixed(2)
              : null}
            ЭкветиФолд: {player.AverageFoldPercentage}% Эквити против диапазона
            защиты:{" "}
            {player.AverageEquityVsDefend
              ? `${player.AverageEquityVsDefend}%`
              : "не применимо"}
          </div>
        ))
      ) : (
        <div>Игроки с максимальными ставками не найдены</div>
      )}
    </>
  );
};

export default HintEv;
