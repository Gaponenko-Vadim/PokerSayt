import Logo from "../Logo";
import styles from "./style.module.scss";
const Header = () => {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Logo />

          <div>логироваться</div>
        </div>
      </header>
    </>
  );
};

export default Header;
