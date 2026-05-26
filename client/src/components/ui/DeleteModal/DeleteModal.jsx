import { AlertTriangle, X } from "lucide-react";
import styles from "./DeleteModal.module.css";
function DeleteModal({
  onClose,
  onConfirm,
  text,
  btnConfirmText = "Видалити",
  btnCancelText = "Скасувати",
  title = "Підтвердження видалення",
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Закрити"
        >
          <X size={18} />
        </button>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={28} className={styles.warnIcon} />
          </div>
          <div className={styles.textBlock}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.text}>{text}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {btnCancelText}
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {btnConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
