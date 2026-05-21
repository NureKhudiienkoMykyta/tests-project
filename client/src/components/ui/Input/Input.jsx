import styles from "./Input.module.css";

function Input({ icon: Icon, error, label, ...props }) {
  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div
        className={`${styles.inputContainer} ${error ? styles.hasError : ""}`}
      >
        {Icon && <Icon className={styles.icon} size={20} />}
        <input className={styles.input} {...props} />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Input;
