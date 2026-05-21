import { Link } from "react-router";
import styles from "./HeroSection.module.css";

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        Розумна перевірка знань у вулику <mark>QuizBee</mark>
      </h1>
      <p className={styles.heroDescription}>
        Створюйте інтерактивні тести, аналізуйте результати та забезпечуйте
        контроль чесності за допомогою фокус-трекінгу.
      </p>
      <div className={styles.ctaGroup}>
        <Link to="/register" className={styles.primaryBtn}>
          Почати безкоштовно
        </Link>
        <Link to="/login" className={styles.secondaryBtn}>
          Увійти
        </Link>
      </div>
    </section>
  );
};
