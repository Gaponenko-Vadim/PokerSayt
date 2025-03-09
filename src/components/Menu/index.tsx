import Button from "../Button/Button";
import styles from "./style.module.scss";
const Menu = () => {
  return (
    <div className={styles.main}>
      <div className={styles.main__container}>
        <div className={styles.main__container_block}>
          <Button to="/CardTable" label="Играть" />
        </div>
        <div
          className={`${styles.main__container_block} ${styles.main__container_block_blue}`}
        >
          проверить удачу
        </div>
        <div
          className={`${styles.main__container_block} ${styles.main__container_block_green}`}
        >
          как пользоваться
        </div>
      </div>
    </div>
  );
};

export default Menu;
