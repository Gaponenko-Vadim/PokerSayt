import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/store";
import styles from "./stayle.module.scss";
import { initializePositions } from "../../Redux/slice/infoPlayers";
import Bet from "../Bet";
import MenuStack from "../MenuStack";
import MainPlayer from "../MainPlayer";
import { updatePlayerStatus } from "../../Redux/slice/pozitionSlice";
import { PlayerStatus } from "../type";
import StatusPlayer from "../StatusPlayer";
import Pass from "../Pass";
interface PlayersProps {
  setOpenMatrix: (isOpen: boolean) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setModalPosition: (position: { top: number; left: number }) => void;
  setSelectedPosition: (position: string | null) => void;
}

const Players: React.FC<PlayersProps> = ({
  setIsModalOpen,
  setModalPosition,
  setSelectedPosition,
  setOpenMatrix,
}) => {
  const dispatch = useDispatch();

  // Получаем массив позиций и текущий индекс из слайса pozitionSlice
  const pozitionTable = useSelector(
    (state: RootState) => state.pozitionSlice.value
  );
  const selectedStadiatt = useSelector((state: RootState) => state.infoPlayers);
  const index = useSelector((state: RootState) => state.pozitionSlice.index);
  const positionsOrder = useSelector(
    (state: RootState) => state.pozitionSlice.order
  );

  // Получаем данные игроков из слайса infoPlayers
  const playersData = useSelector(
    (state: RootState) => state.infoPlayers.players
  );

  // Инициализация игроков при монтировании компонента
  React.useEffect(() => {
    dispatch(initializePositions({ positions: pozitionTable }));
  }, [dispatch, pozitionTable]);

  const handleOpenMatrixl = (currentPosition: string) => {
    setOpenMatrix(true);
    setSelectedPosition(currentPosition);
  };

  // Обработчик открытия модального окна
  const handleOpenModal = (
    event: React.MouseEvent<HTMLDivElement>,
    position: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({
      top: rect.top + window.scrollY,
      left: rect.right + 10, // Сдвиг на 10 пикселей вправо
    });
    setSelectedPosition(position); // Сохраняем текущую позицию
    setIsModalOpen(true);
  };

  // Обработчик изменения статуса игрока
  const handleStatusChange = (index: number, status: PlayerStatus) => {
    dispatch(updatePlayerStatus({ index, status })); // Обновляем статус через Redux
  };
  console.log(playersData);
  console.log(selectedStadiatt);
  return (
    <>
      {positionsOrder.map((orderItem, i) => {
        const currentPosition =
          pozitionTable[(index + orderItem.index) % pozitionTable.length];
        const player = playersData[currentPosition];
        const actionClass = player?.action?.replace(/ [\d.]+$/, "") || "fold"; // Данные игрока берутся из infoPlayers

        // Если данные игрока отсутствуют, пропускаем отрисовку
        if (!player) {
          return null;
        }

        return (
          <div key={i} className={styles.playerContainer}>
            {i === 3 ? ( // Если это позиция для MainPlayer
              <MainPlayer currentPosition={currentPosition} player={player} />
            ) : (
              <div
                className={styles.player}
                onClick={() => handleOpenMatrixl(currentPosition)}
              >
                {currentPosition}
              </div>
            )}
            {currentPosition === "BT" && ( // Если это дилер
              <div className={styles.dealerChip}>D</div>
            )}

            {i !== 3 && (
              <>
                {player.action !== "fold" && (
                  <MenuStack
                    player={player}
                    currentPosition={currentPosition}
                  />
                )}
                <Pass position={currentPosition} />
              </>
            )}

            <div
              className={`${styles.actionButton} ${
                styles[actionClass] || styles.fold
              }`}
              onClick={(event) => handleOpenModal(event, currentPosition)}
            >
              {player.action}
            </div>
            <StatusPlayer
              player={player}
              position={currentPosition}
              currentStatus={orderItem.status} // Статус берется из orderItem
              onChange={(status) => handleStatusChange(orderItem.index, status)} // Обновляем статус для orderItem.index
            />
            <Bet position={currentPosition} />
          </div>
        );
      })}
    </>
  );
};

export default Players;
