import { ArrowRight } from "lucide-react";
import styles from "./HowItWorksSection.module.css";
import React from "react";

function HowItWorksSection() {
  const steps = [
    {
      num: 1,
      title: "Зареєструйся",
      text: "Створи свій акаунт за пару секунд, обравши свій ЗВО.",
    },
    {
      num: 2,
      title: "Обери або створи",
      text: "Знайди тест в бібліотеці або сконструюй свій власний.",
    },
    {
      num: 3,
      title: "Пройди тест",
      text: "Дай відповіді на питання, дотримуючись ліміту часу.",
    },
    {
      num: 4,
      title: "Отримай результат",
      text: "Дізнайся свій бал та подивись детальну аналітику.",
    },
  ];

  return (
    <section>
      <h2 className={styles.sectionTitle}>Як це працює?</h2>
      <div className={styles.stepsContainer}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>{step.num}</div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardText}>{step.text}</p>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className={styles.arrowIcon} size={28} />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
