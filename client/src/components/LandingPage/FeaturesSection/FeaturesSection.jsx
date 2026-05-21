import {
  Zap,
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  Search,
} from "lucide-react";
import styles from "./FeaturesSection.module.css";

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap size={22} />,
      title: "Швидке створення",
      text: "Зручний конструктор з підтримкою різних типів питань.",
    },
    {
      icon: <Shield size={22} />,
      title: "Анти-чітинг система",
      text: "Фіксація втрати фокусу, згортання вкладки чи спроб скопіювати текст.",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Глибока аналітика",
      text: "Детальні графіки успішності для викладачів та зрізи помилок для студентів.",
    },
    {
      icon: <Users size={22} />,
      title: "Обмеження тестів",
      text: "Надавайте доступ для проходжнення тесту конкретним користувачам за поштою або доменом.",
    },
    {
      icon: <Search size={22} />,
      title: "Зручний пошук",
      text: "Шукайте тести за назвою та фільтруйте їх в публічній бібліотеці за категоріями, ЗВО.",
    },
    {
      icon: <CheckCircle size={22} />,
      title: "Автоперевірка",
      text: "Миттєвий розрахунок балів та виведення результатів одразу після проходження.",
    },
  ];

  return (
    <section>
      <h2 className={styles.sectionTitle}>Що може система?</h2>
      <div className={styles.featuresGrid}>
        {features.map((f, idx) => (
          <div key={idx} className={styles.featureCard}>
            <div className={styles.iconWrapper}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardText}>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
