import { Link } from "react-router";
import styles from "./Footer.module.css";
import Logo from "../ui/Logo/Logo";
import { useAuthStore } from "../../stores/useAuthStore";
function Footer() {
  const currentYear = new Date().getFullYear();
  const user = useAuthStore((state) => state.user);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Логотип та короткий опис */}
        <div className={styles.column} style={{ maxWidth: "280px" }}>
          <Logo />
          <p className={styles.text} style={{ marginTop: "8px" }}>
            Платформа для розумного тестування та перевірки знань. Створюй,
            проходь та навчайся разом з нами.
          </p>
        </div>

        {/* Навігація */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Навігація</h4>
          <ul className={styles.list}>
            <li>
              <Link to="/" className={styles.link}>
                Головна
              </Link>
            </li>
            <li>
              <Link to="/library" className={styles.link}>
                Бібліотека тестів
              </Link>
            </li>
            {user && (
              <li>
                <Link to="/test/create" className={styles.link}>
                  Створити тест
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Про нас */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Про проект</h4>
          <ul className={styles.list}>
            <li>
              <Link to="/faq" className={styles.link}>
                Часті питання (FAQ)
              </Link>
            </li>
          </ul>
        </div>

        {/* Контакти та Підписка */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Контакти та Підписка</h4>
          <ul className={styles.list}>
            <li className={styles.text}>Email: quizbeetest@gmail.com</li>
            <li>
              <Link
                to="/subscription"
                className={styles.link}
                style={{ color: "#f97316", fontWeight: "600" }}
              >
                Тарифи Premium
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Нижня плашка з копірайтом */}
      <div className={styles.bottom}>
        <div className={styles.copyright}>
          <span>&copy; {currentYear} QuizBee. Всі права захищені.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
