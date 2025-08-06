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
    callPlayersCount,
    equity,
    maxBetPosition
  );

  const resultCallsPosition = calculatePositionCoefficient(
    fullPosition,
    positionMainPlayer,
    maxBetPosition,
    positionMulti,
    doFlopCallResult,
    equity
  );

  const resultThreePositionLittle = calculatePositionCoefficient(
    fullPosition,
    positionMainPlayer,
    maxBetPosition,
    positionMulti,
    doFlopThreeBetResult.little.littleBetFinal,
    equity
  );

  const resultThreePositionAverage = calculatePositionCoefficient(
    fullPosition,
    positionMainPlayer,
    maxBetPosition,
    positionMulti,
    doFlopThreeBetResult.average.averageBetFinal,
    equity
  );
  const resultThreePositionBig = calculatePositionCoefficient(
    fullPosition,
    positionMainPlayer,
    maxBetPosition,
    positionMulti,
    doFlopThreeBetResult.big.bigBetFinal,
    equity
  );

  const resultThreePositionMax = calculatePositionCoefficient(
    fullPosition,
    positionMainPlayer,
    maxBetPosition,
    positionMulti,
    doFlopThreeBetResult.max.maxBetFinal,
    equity
  );

  let reiseNasvanie = "open";

  if (maxCount === 0) {
    reiseNasvanie = "open";
  } else if (maxCount === 1) {
    reiseNasvanie = "ThreeBet";
  } else if (maxCount === 2) {
    reiseNasvanie = "fourBet";
  } else {
    reiseNasvanie = "reise";
  }

  // console.log("doFlopCallResult", doFlopCallResult);
  // console.log("statusRise", statusRise);
  console.log("maxBetPlayers", maxBetPlayers, "maxCount", maxCount);

  return (
    <div className={styles.hintEvWrapper}>
      {/* Выводим результат */}
      {/* <div>колл: {doFlopCallResult.toFixed(2)}</div> */}

      {equity >= 99 ? (
        <div>
          {reiseNasvanie}:{resultThreePositionLittle.toFixed(2)}
        </div>
      ) : (
        <>
          <div>call: {resultCallsPosition.toFixed(2)}</div>
          <div>
            {reiseNasvanie}&nbsp;
            {doFlopThreeBetResult.little.stavka}BB:
            {resultThreePositionLittle.toFixed(2)}
          </div>
          <div>
            {reiseNasvanie}&nbsp;
            {doFlopThreeBetResult.average.stavka}BB:
            {resultThreePositionAverage.toFixed(2)}
          </div>
          <div>
            {maxCount > 0 ? (
              <>
                {reiseNasvanie}&nbsp;
                {doFlopThreeBetResult.big.stavka}BB:
                {resultThreePositionBig.toFixed(2)}
              </>
            ) : null}
          </div>
          <div>
            {maxCount > 0 && equity > 58 ? (
              <>
                {reiseNasvanie}&nbsp;
                {doFlopThreeBetResult.max.stavka}BB:
                {resultThreePositionMax.toFixed(2)}
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default HintEv;
