import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/store";
import styles from "./stayle.module.scss";
import { updatePlayerAction } from "../../Redux/slice/infoPlayers";

interface PassProps {
  position: string; // Позиция игрока (например, "BB", "SB", "UTG")
}

const Pass: React.FC<PassProps> = ({ position }) => {
  const player = useSelector(
    (state: RootState) => state.infoPlayers.players[position]
  );
  const dispatch = useDispatch();

  const pass = (position: string) => {
    dispatch(
      updatePlayerAction({
        position,
        action: "pass",
      })
    );
  };

  if (!player || !player.bet) return null;

  return (
    <>
      {player.action !== "pass" && (
        <div className={styles.bet} onClick={() => pass(position)}>
          Pass
        </div>
      )}
    </>
  );
};

export default Pass;
