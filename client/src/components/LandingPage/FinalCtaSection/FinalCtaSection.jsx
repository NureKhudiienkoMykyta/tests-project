import { Link } from "react-router";
import styles from "./FinalCtaSection.module.css";

export const FinalCtaSection = () => {
  return (
    <section className={styles.finalCta}>
      <h3>Почніть перевіряти знання вже сьогодні</h3>
      <p>
        Приєднуйтесь до користувачів, які вже оцінили ефективність вулика
        QuizBee.
      </p>
      <Link to="/register" className={styles.primaryBtn}>
        Створити акаунт
      </Link>
    </section>
  );
};
