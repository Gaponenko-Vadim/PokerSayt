import CardSelector from "../CardSelecter";
import styles from "./stayle.module.scss";

const Card = () => {
  return (
    <div className={styles.cardsContainer}>
      <CardSelector />
    </div>
  );
};

export default Card;
