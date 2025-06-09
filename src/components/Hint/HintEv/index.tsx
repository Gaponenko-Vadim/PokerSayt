import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "../../../Redux/store";
import { PlayerData } from "../../type";
import { calculateFold } from "../../../utilits/calculateFold";
import { calculateDoflopCall } from "../../../utilits/calculateDoflopCall";
import { calculatePercentageRaiseBets } from "../../../utilits/calculatePercentageRaiseBets";
import { getMaxBet } from "../../../utilits/getMaxBet";
import { calculateAllin } from "../../../utilits/calculateAllin";
import { betActionPositionFold } from "../../../utilits/betActionPositionFold";
import styles from "./HintEv.module.scss";

const HintEv = () => {
  const infoPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  );
  const fullPosition = useSelector(
    (state: RootState) => state.pozitionSlice.value
  );
  const mainPlayer = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );
  const mainPlayerCards = mainPlayer?.selectedCards;
  const mainPlayerBet = mainPlayer?.myBet;
  const positionMainPlayer = mainPlayer?.position || "";
  const sumBet = mainPlayer?.sumBet || 0;
  const maxBet = getMaxBet(infoPlayers);
  const equity = mainPlayer?.equity || 0;

  const [positionMulti, setPositionMulti] = useState<string[]>([]);

  // Запускаем betActionPositionFold и сохраняем результат
  useEffect(() => {
    if (!positionMainPlayer) return;

    const result = betActionPositionFold(
      fullPosition,
      positionMainPlayer,
      infoPlayers,
      maxBet
    );
    setPositionMulti(result);
  }, [positionMainPlayer, infoPlayers, fullPosition, maxBet]);

  // Теперь используем positionMulti как аргумент

  const doFlopCallResult = calculateDoflopCall(
    mainPlayerCards,
    equity,
    sumBet,
    mainPlayerBet,
    positionMulti,
    maxBet,
    infoPlayers
  );

  console.log("doFlopCallResult", doFlopCallResult);

  return (
    <div className={styles.hintEvWrapper}>
      {/* Выводим результат */}
      <div>Позиции с ближайшими ставками: {doFlopCallResult.toFixed(2)}</div>
    </div>
  );
};

export default HintEv;
