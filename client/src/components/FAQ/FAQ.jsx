import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./FAQ.module.css";

const faqData = [
  {
    q: "Чи безкоштовна платформа?",
    a: "Так, базовий функціонал QuizBee є повністю безкоштовним. Обмеження лише в кількості прозоджень тестів на день. Для безкоштовного доступу ліміт 15 тестів в день.",
  },
  {
    q: "Як працює фокус-трекінг під час тестування?",
    a: "Система автоматично фіксує втрату фокусу, якщо студент згортає вкладку, перемикається на інше вікно, намагається скопіювати запитання тесту або виходить за межі браузера. Це допомагає підтримувати академічну доброчесність.",
  },
  {
    q: "Чи можу я створювати закриті тести тільки для своєї групи?",
    a: "Так! Під час створення тесту ви можете обрати модель доступу (публічний для всієї Бібліотеки або приватний за прямим посиланням чи доменом організації).",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      {faqData.map((item, idx) => (
        <div key={idx} className={styles.faqItem}>
          <button
            className={`${styles.faqHeader} ${openIndex === idx ? styles.open : ""}`}
            onClick={() => toggleFAQ(idx)}
          >
            <span>{item.q}</span>
            <ChevronDown size={18} />
          </button>
          {openIndex === idx && (
            <div className={styles.faqBody}>
              <p>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
