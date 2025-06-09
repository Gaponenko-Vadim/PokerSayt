import { getPositionsBehind, filterCardsByMainPlayer } from "./foldHelpers";
import { full } from "../constants/positionsRanges8maxMtt";
import { convertRangeToCards } from "./allСombinations/allTwoCardCombinations";
import { PlayerData } from "../components/type";
import { POSITION_RANGES } from "../constants/pozition_ranges";
import { convertRangeToCards } from "./allСombinations/allTwoCardCombinations";
import { PlayerStatus } from "../components/type";

export const calculateDoflopCall = (
  mainPlayerCards: string[] | undefined,
  equity: number,
  sumBet: number,
  mainPlayerBet: string | null | undefined,
  positionMulti: string[],
  maxBet: number,
  infoPlayers: { [key: string]: PlayerData }
): number => {
  const mainBet = parseFloat(mainPlayerBet || "");
  const equityDo1 = equity / 100;
  // const intermediatePositions = positionMulti.map((pos) => infoPlayers[pos]);

  const ev1stage =
    equityDo1 * (sumBet + mainBet) - (1 - equityDo1) * (maxBet - mainBet);
  const fullDiapason = full.flatMap((full: string) =>
    convertRangeToCards(full)
  );
  const intermediatePositions = positionMulti.map((pos) => {
    const player = infoPlayers[pos];
    let diapason: string[][] = player.cardsdiaposon?.length
      ? player.cardsdiaposon.flatMap((range: string) =>
          convertRangeToCards(range)
        )
      : [];

    // Установка fullDiapason по условию
    if (
      player.bet === null || // Нет ставки
      (player.position === "SB" && player.bet === "0.5BB") || // SB с 0.5BB
      (player.position === "BB" && player.bet === "1BB") // BB с 1BB
    ) {
      diapason = fullDiapason;
    }

    return { position: player.position, diapason };
  });
  console.log(
    "mainPlayerCard",
    mainPlayerCards,
    "equity",
    equityDo1,
    "sumBet",
    sumBet,
    "mainPlayerBet",
    mainBet,
    "positionMulti",
    positionMulti,
    "maxBet",
    maxBet,
    intermediatePositions
  );
  return ev1stage;
};
