import { BookOpen, GraduationCap, Calendar, Clock, Eye } from "lucide-react";
import styles from "./AttemptHistoryCard.module.css";
import { useNavigate } from "react-router";

function AttemptHistoryCard({ attempt }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreClass = (pct) => {
    if (pct >= 80) return styles.scoreSuccess;
    if (pct >= 50) return styles.scoreWarning;
    return styles.scoreDanger;
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "COMPLETED":
        return { text: "Завершено", class: styles.statusCompleted };
      case "EXPIRED":
        return { text: "Час вичерпано", class: styles.statusExpired };
      default:
        return { text: status, class: styles.statusDefault };
    }
  };

  const statusInfo = getStatusDetails(attempt.status);
  return (
    <div className={styles.card}>
      {/* Основна інформація */}
      <div className={styles.mainInfo}>
        <div className={styles.badges}>
          {attempt.category?.name && (
            <span className={styles.badge}>
              <BookOpen size={12} /> {attempt.category.name}
            </span>
          )}
          {attempt.university?.name && (
            <span className={styles.badge}>
              <GraduationCap size={12} /> {attempt.university.name}
            </span>
          )}
          <span className={`${styles.statusBadge} ${statusInfo.class}`}>
            <Clock size={12} /> {statusInfo.text}
          </span>
        </div>

        <h3 className={styles.title}>{attempt.title}</h3>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <Calendar size={14} />
            <span>{formatDate(attempt.date)}</span>
          </div>
        </div>
      </div>

      {/* Оцінки та дія */}
      <div className={styles.sideBlock}>
        <div
          className={`${styles.scoreSection} ${getScoreClass(attempt.persentage)}`}
        >
          <div className={styles.percentage}>{attempt.persentage}%</div>
          <div className={styles.rawPoints}>
            {attempt.score} / {attempt.max_score} балів
          </div>
        </div>

        <button
          className={styles.actionBtn}
          onClick={() => navigate(`/attempt/${attempt.id}/results`)}
        >
          <Eye size={16} /> Результат
        </button>
      </div>
    </div>
  );
}

export default AttemptHistoryCard;
