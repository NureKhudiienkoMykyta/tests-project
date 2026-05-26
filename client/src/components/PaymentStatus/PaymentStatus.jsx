import { useNavigate } from "react-router";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import styles from "./PaymentStatus.module.css";

function PaymentStatus({ isSuccess, title, message, additionalMessage }) {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div
      className={`${styles.container} ${isSuccess ? styles.success : styles.failure}`}
    >
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          {isSuccess ? (
            <CheckCircle2 size={64} className={styles.icon} />
          ) : (
            <XCircle size={64} className={styles.icon} />
          )}
        </div>

        {/* Title */}
        <h1 className={styles.title}>{title}</h1>

        {/* Main Message */}
        <p className={styles.message}>{message}</p>

        {/* Additional Message (if provided) */}
        {additionalMessage && (
          <p className={styles.additionalMessage}>{additionalMessage}</p>
        )}

        {/* Button */}
        <button onClick={handleBackToDashboard} className={styles.button}>
          <span>Повернутись на головну</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default PaymentStatus;
