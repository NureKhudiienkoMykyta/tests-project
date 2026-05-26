import { Clock } from "lucide-react";
import { useAttemptStore } from "../../../stores/useAttemptStore";
import styles from "./TestHeader.module.css";

function TestHeader({ testTitle }) {
  const { totalQuestions, answeredCount, remainingTime } = useAttemptStore();

  const currentProgress = answeredCount + 1;
  const progressPercentage =
    totalQuestions > 0 ? (currentProgress / totalQuestions) * 100 : 0;

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isUrgent = remainingTime !== null && remainingTime < 20;
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.testTitle}>
          {testTitle || "Проходження тесту"}
        </span>
        <h1 className={styles.progressText}>
          Питання {currentProgress}{" "}
          <span className={styles.muted}>з {totalQuestions}</span>
        </h1>
        <div className={styles.progressBarBg}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {remainingTime !== null && (
        <div
          className={`${styles.timerWidget} ${isUrgent ? styles.urgent : ""}`}
        >
          <Clock size={20} className={styles.timerIcon} />
          <span className={styles.timerValue}>{formatTime(remainingTime)}</span>
        </div>
      )}
    </header>
  );
}

export default TestHeader;
