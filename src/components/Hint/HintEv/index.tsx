import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { PlayerData } from "../../type";
import { calculateEquityFold } from "../../../utilits/calculateEquityFold";

const HintEv = () => {
  const infoPlayers = useSelector(
    (state: RootState) => state.infoPlayers.players
  );
  const infoMain = useSelector(
    (state: RootState) => state.infoPlayers.mainPlayers
  );

  // Находим максимальную ставку за столом
  const getMaxBet = (allPlayers: { [key: string]: PlayerData }): number => {
    return Object.values(allPlayers).reduce((max, player) => {
      if (!player.bet || player.bet === "All-in") return max;
      const currentBet = parseFloat(player.bet);
      return Math.max(max, currentBet);
    }, 0);
  };

  // Получаем минимальный стек среди активных оппонентов
  const getMinOpponentStack = (allPlayers: {
    [key: string]: PlayerData;
  }): number => {
    const activePlayers = Object.values(allPlayers).filter(
      (p) => p.action !== "fold" && p.stackSize > 0
    );
    return Math.min(...activePlayers.map((p) => p.stackSize));
  };

  const calculateRaiseEV = () => {
    if (!infoMain || infoMain.equity === null || !infoMain.myBet) return null;

    const maxBet = getMaxBet(infoPlayers);
    const currentBet = parseFloat(infoMain.myBet);
    const equity = infoMain.equity / 100;
    const minOpponentStack = getMinOpponentStack(infoPlayers);

    // Размер рейза (2.3x от максимальной ставки)
    const raiseSize = Math.max(maxBet * 2.3, 3);
    const chipsToAdd = raiseSize - currentBet;
    const opponentCallAmount = raiseSize - maxBet;

    // Ограничиваем максимальный возможный пот (по минимальному стек)
    const effectivePotRaise =
      infoMain.sumBet +
      Math.min(chipsToAdd, infoMain.stackSize) +
      Math.min(opponentCallAmount, minOpponentStack);

    // EV рейза
    const evRaise = equity * effectivePotRaise - chipsToAdd;

    // Расчет для алл-ина
    const allInSize = infoMain.stackSize + currentBet; // Полный размер твоего алл-ина
    const chipsToAddAllIn = infoMain.stackSize; // Сколько тебе нужно добавить для алл-ина
    const opponentCallAmountAllIn = allInSize - maxBet; // Сколько оппоненту нужно доставить

    // Эффективный пот для алл-ина
    const effectivePotAllIn =
      infoMain.sumBet +
      chipsToAddAllIn +
      Math.min(opponentCallAmountAllIn, minOpponentStack);

    // EV алл-ина
    const evAllIn = equity * effectivePotAllIn - chipsToAddAllIn;

    return {
      raiseSize,
      chipsToAdd,
      opponentCallAmount,
      effectivePotRaise,
      evRaise,
      allInSize,
      chipsToAddAllIn,
      opponentCallAmountAllIn,
      effectivePotAllIn,
      evAllIn,
    };
  };

  const raiseData = calculateRaiseEV();
  console.log(getMaxBet(infoPlayers));

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4">EV рейза и алл-ина</h3>

      {raiseData && (
        <div className="space-y-4">
          {/* Блок для рейза 2.3x */}
          <div>
            <h4 className="text-lg font-semibold">Рейз 2.3x</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                {/* <span>Размер рейза:</span>
                <span>{raiseData.raiseSize.toFixed(2)} BB</span> */}
              </div>
              <div className="flex justify-between">
                <span>Мне нужно добавить:</span>
                <span>{raiseData.chipsToAdd.toFixed(2)} BB</span>
              </div>
              <div className="flex justify-between">
                {/* <span>Оппоненту нужно добавить:</span>
                <span>{raiseData.opponentCallAmount.toFixed(2)} BB</span> */}
              </div>
              <div className="flex justify-between">
                {/* <span>Эффективный пот:</span>
                <span>{raiseData.effectivePotRaise.toFixed(2)} BB</span> */}
              </div>
              <div className="flex justify-between font-bold">
                <span>EV рейза:</span>
                <span
                  className={
                    raiseData.evRaise >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {raiseData.evRaise.toFixed(2)} BB
                </span>
              </div>
            </div>
          </div>

          {/* Блок для алл-ина */}
          <div>
            <h4 className="text-lg font-semibold">Алл-ин</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                {/* <span>Размер алл-ина:</span>
                <span>{raiseData.allInSize.toFixed(2)} BB</span> */}
              </div>
              <div className="flex justify-between">
                {/* <span>Мне нужно добавить:</span>
                <span>{raiseData.chipsToAddAllIn.toFixed(2)} BB</span> */}
              </div>
              <div className="flex justify-between">
                {/* <span>Оппоненту нужно добавить:</span>
                <span>{raiseData.opponentCallAmountAllIn.toFixed(2)} BB</span> */}
              </div>
              <div className="flex justify-between">
                {/* <span>Эффективный пот:</span>
                <span>{raiseData.effectivePotAllIn.toFixed(2)} BB</span> */}
              </div>
              <div className="flex justify-between font-bold">
                <span>EV алл-ина:</span>
                <span
                  className={
                    raiseData.evAllIn >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {raiseData.evAllIn.toFixed(2)} BB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HintEv;
