import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "../../../Redux/store";
// import { calculateFold } from "../../../utilits/calculateFold";
import { calculateDoflopCall } from "../../../utilits/calculateDoflopCall";
// import { calculatePercentageRaiseBets } from "../../../utilits/calculatePercentageRaiseBets";
import {
  getMaxBet,
  getMaxCount,
  getMaxBetPosition,
} from "../../../utilits/getMaxBet";
// import { calculateAllin } from "../../../utilits/calculateAllin";
import { betActionPositionFold } from "../../../utilits/betActionPositionFold";
import styles from "./HintEv.module.scss";
import { calculatePositionCoefficient } from "../../../utilits/calculatePositionCoefficient";
import { calculateDoflopThreeBet } from "../../../utilits/calculateDoflopThreeBet";
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
  const statusRise = useSelector(
    (state: RootState) => state.pozitionSlice.statusRise
  );

  const maxBetPlayers = useSelector(
    (state: RootState) => state.generalInformation.maxBetPlayers
  );

  const callPlayersCount = Object.values(infoPlayers).filter(
    (player) => player.action === "call"
  ).length;

  const mainPlayerCards = mainPlayer?.selectedCards;
  const mainPlayerBet = mainPlayer?.myBet;
  const positionMainPlayer = mainPlayer?.position || "";
  // const;
  const sumBet = mainPlayer?.sumBet || 0;
  const maxBet = getMaxBet(infoPlayers);
  const maxCount = getMaxCount(infoPlayers);
  const maxBetPosition = getMaxBetPosition(infoPlayers);
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
    mainPlayerCards || [],
    equity,
    sumBet,
    mainPlayerBet,
    positionMulti,
    maxBet,
    infoPlayers,
    maxCount,
    statusRise,
    maxBetPlayers
  );

  const doFlopThreeBetResult = calculateDoflopThreeBet(
    positionMulti,
    maxBet,
    sumBet,
    mainPlayerBet,
    maxBetPlayers,
    mainPlayerCards || [],
    maxCount,
    callPlayersCount
    // equity
  );

  const resultCallsPosition = calculatePositionCoefficient(
    fullPosition,
    positionMainPlayer,
    maxBetPosition,
    positionMulti,
    doFlopCallResult
  );

  const resultThreePosition = calculatePositionCoefficient(
    fullPosition,
    positionMainPlayer,
    maxBetPosition,
    positionMulti,
    doFlopThreeBetResult
  );

  // console.log("doFlopCallResult", doFlopCallResult);
  // console.log("statusRise", statusRise);
  console.log("maxBetPlayers", maxBetPlayers);

  return (
    <div className={styles.hintEvWrapper}>
      {/* Выводим результат */}
      {/* <div>колл: {doFlopCallResult.toFixed(2)}</div> */}

      <div>колл: {resultCallsPosition.toFixed(2)}</div>
      <div>трибет:{resultThreePosition.toFixed(2)}</div>
    </div>
  );
};

export default HintEv;
