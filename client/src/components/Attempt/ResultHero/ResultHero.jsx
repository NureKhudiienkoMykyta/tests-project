import { BookOpen, GraduationCap, User } from "lucide-react";
import styles from "./ResultHero.module.css";

function ResultHero({ result, isTestDeleted }) {
  const getScoreColorClass = (pct) => {
    if (pct >= 80) return styles.scoreSuccess;
    if (pct >= 50) return styles.scoreWarning;
    return styles.scoreDanger;
  };
  return (
    <header
      className={`${styles.heroCard} ${getScoreColorClass(result.persentage)}`}
    >
      <div className={styles.heroMain}>
        {!isTestDeleted &&
          (result.category?.name || result.university?.name) && (
            <div className={styles.metaBadges}>
              {result.category?.name && (
                <span className={styles.badge}>
                  <BookOpen size={12} /> {result.category.name}
                </span>
              )}
              {result.university?.name && (
                <span className={styles.badge}>
                  <GraduationCap size={12} /> {result.university.name}
                </span>
              )}
            </div>
          )}

        {!isTestDeleted && result.test_title && (
          <h1 className={styles.testTitle}>{result.test_title}</h1>
        )}

        {!isTestDeleted && result.description && (
          <p className={styles.testDesc}>{result.description}</p>
        )}

        {!isTestDeleted && result.author && (
          <div className={styles.authorLine}>
            <User size={14} />
            <span>
              Автор тесту:{" "}
              <strong>
                {result.author?.first_name} {result.author?.last_name}
              </strong>
            </span>
          </div>
        )}
      </div>

      <div className={styles.scoreCircleSection}>
        <div className={styles.scoreCircle}>
          <span className={styles.percentageText}>{result.persentage}%</span>
          <span className={styles.pointsText}>
            {result.score} / {result.max_score} балів
          </span>
        </div>
        <p className={styles.statusLabel}>
          Статус: {result.status === "COMPLETED" ? "Завершено" : result.status}
        </p>
      </div>
    </header>
  );
}

export default ResultHero;
