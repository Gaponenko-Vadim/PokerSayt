import Logo from "../Logo";
import Profile from "../Profile";
import styles from "./style.module.scss";
const Header = () => {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Logo />

          <div>
            <Profile />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
