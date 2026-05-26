import { useNavigate } from "react-router";
import { Play, ClipboardCheck } from "lucide-react";
import styles from "./ContinueTestCard.module.css";

function ContinueTestCard({ attempt }) {
  const navigate = useNavigate();
  const { testId, title, totalQuestions, answeredQuestions } = attempt;

  const progressPercent =
    totalQuestions > 0
      ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100))
      : 0;

  return (
    <div className={styles.card}>
      <div className={styles.mainContent}>
        <div className={styles.iconWrapper}>
          <ClipboardCheck size={24} className={styles.testIcon} />
        </div>

        <div className={styles.info}>
          <h4 className={styles.title} title={title}>
            {title}
          </h4>
          <div className={styles.progressStatusBlock}>
            <p className={styles.progressText}>
              Прогрес: <strong>{answeredQuestions}</strong> з{" "}
              <strong>{totalQuestions}</strong> питань
            </p>
            <span className={styles.percentBadge}>{progressPercent}%</span>
          </div>

          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <button
        className={styles.continueBtn}
        onClick={() => navigate(`/test/passing/${testId}`)}
      >
        <Play size={16} fill="currentColor" />
        <span>Продовжити</span>
      </button>
    </div>
  );
}

export default ContinueTestCard;
