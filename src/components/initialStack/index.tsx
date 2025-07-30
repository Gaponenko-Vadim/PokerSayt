import styles from "./stayle.module.scss";
import { RootState } from "../../Redux/store";
import { useSelector, useDispatch } from "react-redux";

const InitialStack: React.FC = () => {
  const gameStadia = useSelector(
    (state: RootState) => state.infoPlayers.stadia
  );

  return <div></div>;
};

export default InitialStack;
