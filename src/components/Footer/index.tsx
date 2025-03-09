import styles from "./style.module.scss";
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__container}>
        <ul className="footer__column">
          <li>
            <a href="#">О компании</a>
          </li>
          <li>
            <a href="#">Контакты</a>
          </li>
          <li>
            <a href="#">Вакансии</a>
          </li>
        </ul>

        <ul className="footer__column">
          <li>
            <a href="#">Помощь</a>
          </li>
          <li>
            <a href="#">Оплата и доставка</a>
          </li>
          <li>
            <a href="#">Гарантия</a>
          </li>
        </ul>

        <ul className="footer__column">
          <li>
            <a href="#">Facebook</a>
          </li>
          <li>
            <a href="#">Instagram</a>
          </li>
          <li>
            <a href="#">YouTube</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
