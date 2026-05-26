import {
  Calendar,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import styles from "./SubscriptionCard.module.css";

function SubscriptionCard({ sub, onCancelClick }) {
  const formatAmount = (amount, currency) => {
    const mainUnit = amount / 100;
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(mainUnit);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getIntervalLabel = (interval) => {
    if (interval === "month") return "місяць";
    if (interval === "year") return "рік";
    return interval;
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return (
          <span className={`${styles.statusBadge} ${styles.active}`}>
            <CheckCircle size={12} /> Активна
          </span>
        );
      case "PAST_DUE":
        return (
          <span className={`${styles.statusBadge} ${styles.pastDue}`}>
            <AlertCircle size={12} /> Очікує оплати (Past Due)
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.canceled}`}>
            <XCircle size={12} /> Неактивна ({status})
          </span>
        );
    }
  };

  const isEligibleForCancel =
    (sub.status === "ACTIVE" || sub.status === "PAST_DUE") &&
    !sub.cancel_at_period_end;

  return (
    <div className={styles.card}>
      <div className={styles.mainInfo}>
        <div className={styles.topRow}>
          <h3 className={styles.productName}>
            {sub.price?.product?.name || "Тарифний план"}
          </h3>
          <div className={styles.badgeGroup}>
            {getStatusBadge(sub.status)}
            {sub.cancel_at_period_end && (
              <span className={styles.cancelNoticeBadge}>
                Скасовується в кінці періоду
              </span>
            )}
          </div>
        </div>

        <p className={styles.description}>{sub.price?.product?.description}</p>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <CreditCard size={14} />
            <span>
              Вартість:{" "}
              <strong>
                {formatAmount(sub.price?.amount, sub.price?.currency)}
              </strong>{" "}
              / {getIntervalLabel(sub.price?.interval)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <Calendar size={14} />
            <span>Оформлено: {formatDate(sub.createdAt)}</span>
          </div>
          {sub.status !== "CANCELED" && (
            <div className={styles.metaItem}>
              <Clock size={14} />
              <span>
                {sub.cancel_at_period_end ? "Діє до: " : "Наступне списання: "}
                <strong>{formatDate(sub.current_period_end)}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actionsBlock}>
        {isEligibleForCancel && (
          <button
            className={styles.cancelBtn}
            onClick={() => onCancelClick(sub.id, sub.price?.product?.name)}
          >
            Скасувати підписку
          </button>
        )}
      </div>
    </div>
  );
}

export default SubscriptionCard;
