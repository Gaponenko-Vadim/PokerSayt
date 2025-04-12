import styles from "./stayle.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import Card from "../Card";
import ButtonReset from "../Button/ButtonReset";
import { useState } from "react";
import ModalDialog from "../Modal";
import ModalActions from "../ModalActions";
import Players from "../Players";
import SumBet from "../SumBet";
import GeneralHint from "../GeneralHint";
import GameStadia from "../GameStadia";
import TableMatrix from "../TableMatrix"; // Импортируем TableMatrix

const CardTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenMatrix, setOpenMatrix] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  const selectedCards = useSelector(
    (state: RootState) => state.cardSlice.selectedCards || []
  );

  return (
    <div>
      <GameStadia />
      <div className={styles.poker__table}>
        <Players
          setOpenMatrix={setOpenMatrix}
          setIsModalOpen={setIsModalOpen}
          setModalPosition={setModalPosition}
          setSelectedPosition={setSelectedPosition}
        />
        <Card />
        <div className={styles.tableCenter}>
          {isOpenMatrix && (
            <TableMatrix
              setOpenMatrix={setOpenMatrix}
              selectedPosition={selectedPosition}
            />
          )}
          {selectedCards.length === 2 ? (
            <GeneralHint />
          ) : (
            <div className={styles.table__title}>PokeRoChek</div>
          )}
        </div>
        <SumBet />
      </div>
      <ButtonReset />
      <ModalDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        position={modalPosition}
      >
        {selectedPosition && (
          <ModalActions
            position={selectedPosition}
            onClose={handleCloseModal}
          />
        )}
      </ModalDialog>
    </div>
  );
};

export default CardTable;
