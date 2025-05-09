import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { PlayerData } from "../../type";
import { calculateEquityFold } from "../../../utilits/calculateEquityFold";
import { calculatePercentageRaiseBets } from "../../../utilits/calculatePercentageRaiseBets";
import { getMaxBet } from "../../../utilits/getMaxBet";
import styles from "./HintEv.module.scss";

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

    for (const player of Object.values(allPlayers)) {
      if (player.bet) {
        const currentBet = parseFloat(player.bet);
        if (currentBet > maxBet) {
          maxBet = currentBet;
        }
      }
    }

    const maxBetPlayers = Object.values(allPlayers)
      .filter((player) => player.bet && parseFloat(player.bet) === maxBet)
      .map((player) => ({
        position: player.position,
        cards: player.cards,
        status: player.status,
        stack: player.stack,
        stackSize: player.stackSize,
        count: player.count,
        bet: player.bet,
      }));

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
    return [];
  };

  const result = findMaxBetPlayerCards(infoPlayers);

  const ev = (
    bets: number[],
    foldPercentages: number[], // Массив вероятностей фолда
    equityVsDefends: number[], // Массив эквити против диапазона защиты
    mainPlayerBet: string,
    sumBet: number,
    maxBet: number,
    FourBetPercentage: number,
    FourBetEquity: number
  ) => {
    const numberPart = parseFloat(mainPlayerBet) - 0.2;
    const betPercentages = [33, 50, 75, 100];

    const evResults = bets.map((bet, index) => {
      const FoldPercentage = foldPercentages[index] / 100;
      const EquityVsDefend = equityVsDefends[index] / 100;
      const equityFold = sumBet * FoldPercentage;

      const EquityVsDefendPercentage = 1 - FoldPercentage - FourBetPercentage;
      const EquityVsDefendSum =
        EquityVsDefend * (sumBet + (bet - numberPart) + (bet - maxBet)) -
        (bet - numberPart);
      const fourSumbet = sumBet + bet;
      const fourBet = calculatePercentageRaiseBets(bet, fourSumbet);
      const reiseFourBet =
        FourBetEquity *
          (fourSumbet + (fourBet[50] - numberPart) + (fourBet[50] - maxBet)) -
        (fourBet[50] - numberPart);

      const evValue =
        equityFold +
        EquityVsDefendPercentage * EquityVsDefendSum +
        FourBetPercentage * reiseFourBet;

      return {
        betSize: bet,
        betPercentage: betPercentages[index],
        ev: evValue,
      };
    });

    return evResults;
  };

  return (
    <>
      {result.length > 0 ? (
        result.map((player, index) => {
          const bets = calculatePercentageRaiseBets(maxBet, sumBet);
          const evResults =
            mainPlayerBet &&
            player.LittleFoldPercentage &&
            player.LittleEquityVsDefend &&
            player.AverageFoldPercentage &&
            player.AverageEquityVsDefend &&
            player.BigFoldPercentage &&
            player.BigEquityVsDefend &&
            player.MaxFoldPercentage &&
            player.MaxEquityVsDefend &&
            player.FourBetEquity
              ? ev(
                  [bets[33], bets[50], bets[75], bets[100]],
                  [
                    player.LittleFoldPercentage,
                    player.AverageFoldPercentage,
                    player.BigFoldPercentage,
                    player.MaxFoldPercentage,
                  ],
                  [
                    player.LittleEquityVsDefend,
                    player.AverageEquityVsDefend,
                    player.BigEquityVsDefend,
                    player.MaxEquityVsDefend,
                  ],
                  mainPlayerBet,
                  sumBet,
                  maxBet,
                  player.FourBetPercentage / 100,
                  player.FourBetEquity / 100
                )
              : [];

          const maxEv = evResults.reduce(
            (max, curr) => (curr.ev > max.ev ? curr : max),
            evResults[0] || { betSize: 0, betPercentage: 0, ev: -Infinity }
          );

          return (
            <div key={index} className={styles.evContainer}>
              <div className={styles.evDisplay}>
                <span className={styles.evValue}>
                  {maxEv.betPercentage === 100
                    ? `100% (${maxEv.betSize}ББ) Ev ${maxEv.ev.toFixed(2)}bb`
                    : `bet ${maxEv.betPercentage}% (${
                        maxEv.betSize
                      }ББ) Ev ${maxEv.ev.toFixed(2)}bb`}
                </span>
                <div className={styles.evTooltip}>
                  <h4>EV для всех размеров ставок:</h4>
                  <ul>
                    {evResults.map((result) => (
                      <li key={result.betPercentage}>
                        {result.betPercentage === 100
                          ? `100% (${result.betSize}ББ) Ev ${result.ev.toFixed(
                              2
                            )}bb`
                          : `bet ${result.betPercentage}% (${
                              result.betSize
                            }ББ) Ev ${result.ev.toFixed(2)}bb`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                ЭкветиФолд: {player.MaxFoldPercentage}% Эквити против
                {player.AverageEquityVsDefend
                  ? ` ${player.MaxEquityVsDefend}%`
                  : "не применимо"}
              </div>
              <div></div>
            </div>
          );
        })
      ) : (
        <div>Игроки с максимальными ставками не найдены</div>
      )}
    </>
  );
};

export default HintEv;
