import { ArrowLeft, AlertCircle } from "lucide-react";
import styles from "./FetchError.module.css";

function FetchError({ error, onBack, backText = "Повернутися назад" }) {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <div className={styles.iconWrapper}>
          <AlertCircle size={40} className={styles.errorIcon} />
        </div>
        <h2>Упс! Помилка завантаження</h2>
        <p>{error || "Щось пішло не так при отриманні даних з сервера."}</p>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={16} /> {backText}
          </button>
        )}
      </div>
    </div>
  );
}

export default FetchError;
