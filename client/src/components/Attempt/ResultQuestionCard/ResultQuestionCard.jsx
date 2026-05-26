import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import styles from "./ResultQuestionCard.module.css";

function ResultQuestionCard({ item, index }) {
  const getStatusConfig = () => {
    if (item.was_cancelled) {
      return {
        cardClass: styles.qCancelled,
        icon: AlertTriangle,
        text: "Анульовано",
      };
    }
    if (item.is_correct) {
      return {
        cardClass: styles.qCorrect,
        icon: CheckCircle2,
        text: "Правильно",
      };
    }
    return {
      cardClass: styles.qIncorrect,
      icon: XCircle,
      text: "Неправильно",
    };
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className={`${styles.questionRow} ${config.cardClass}`}>
      <div className={styles.qHeader}>
        <span className={styles.qIndex}>Питання {index + 1}</span>
        <div className={styles.statusIndicator}>
          <StatusIcon size={16} />
          <span>{config.text}</span>
        </div>
      </div>
      <h3 className={styles.questionText}>{item.question}</h3>
      <div className={styles.answerBox}>
        <span className={styles.answerLabel}>Ваша відповідь:</span>
        <p className={styles.answerValue}>{item.answer || "—"}</p>
      </div>
    </div>
  );
}

export default ResultQuestionCard;
