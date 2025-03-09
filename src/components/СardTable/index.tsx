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

const CardTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null); // Состояние для текущей позиции

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
  };
  const selectedCards = useSelector(
    (state: RootState) => state.cardSlice.selectedCards || []
  );

  return (
    <div>
      <div className={styles.poker__table}>
        <Players
          setIsModalOpen={setIsModalOpen}
          setModalPosition={setModalPosition}
          setSelectedPosition={setSelectedPosition}
        />
        <Card />
        {selectedCards.length === 2 ? (
          <GeneralHint />
        ) : (
          <div className={styles.table__title}>PokeRoChek</div>
        )}

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
