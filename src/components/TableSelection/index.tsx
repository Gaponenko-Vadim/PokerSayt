import Button from "../Button/Button";
import LimitsGame from "../Limits/indx";
import styles from "./style.module.scss";

const TableSelection = () => {
  return (
    <div className={styles.main}>
      <LimitsGame />
      <div className={styles.main__container}>
        <div className={styles.main__container_block}>
          <Button to="/CardTable" label="TurnirBaunti" />
        </div>
        <div
          className={`${styles.main__container_block} ${styles.main__container_block_blue}`}
        >
          Holdem
        </div>
        <div
          className={`${styles.main__container_block} ${styles.main__container_block_green}`}
        >
          turnir
        </div>
      </div>
    </div>
  );
};

export default TableSelection;
