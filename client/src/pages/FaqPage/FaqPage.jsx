import { FAQ } from "../../components/FAQ/FAQ";
import styles from "./FaqPage.module.css";
function FaqPage() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.faqHeaderSection}>
        <div className={styles.headerContent}>
          <h1>Часті запитання (FAQ)</h1>
          <p>
            Усе, що вам потрібно знати про роботу платформи QuizBee, моделі
            доступу та систему фокус-трекінгу.
          </p>
        </div>
      </header>

      <main className={styles.faqContent}>
        <FAQ />
      </main>

      <footer className={styles.faqFooter}>
        <h3>Не знайшли відповіді на своє запитання?</h3>
        <p>Напишіть нам на пошту quizbeetest@gmail.com.</p>
      </footer>
    </div>
  );
}

export default FaqPage;
