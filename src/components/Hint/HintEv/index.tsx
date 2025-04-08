import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { PlayerData } from "../../type";
const HintEv = () => {
  const infoPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  );
  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );

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
    return maxBet;
  };

  return <>{findMaxBetPlayerCards(infoPlayers)}</>;
};

export default HintEv;
