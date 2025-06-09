import styles from "./stayle.module.scss";
import { useDispatch } from "react-redux";
import { updatePlayerStack } from "../../Redux/slice/infoPlayers";

type TypeMenuSteckProps = {
  player: {
    action: string;
    stack: "little" | "middle" | "big" | null;
  };
  currentPosition: string;
};

const MenuStack: React.FC<TypeMenuSteckProps> = ({
  player,
  currentPosition,
}) => {
  const dispatch = useDispatch();

  const handleSelectStack = (
    position: string,
    value: "little" | "middle" | "big"
  ) => {
    dispatch(updatePlayerStack({ position, value }));
  };

  return (
    <div className={styles.playerStack}>
      {(["little", "middle", "big"] as const).map((size) => (
        <button
          key={size}
          className={`${styles.stackButton} ${
            player.stack === size ? styles.active : ""
          }`}
          onClick={() => handleSelectStack(currentPosition, size)}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

export default MenuStack;
