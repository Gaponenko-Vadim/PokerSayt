import { Link } from "react-router-dom";
import logo from "../../assets/couchdb.svg";
import styles from "./style.module.scss";

const Logo = () => {
  return (
    <Link className={styles.logo} to="./">
      <h1>"PokeRoChek"</h1>
      <img src={logo} alt="лого" />
    </Link>
  );
};

export default Logo;
