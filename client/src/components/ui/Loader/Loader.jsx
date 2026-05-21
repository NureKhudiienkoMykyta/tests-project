import styles from "./Loader.module.css";

export const Loader = ({
  fullScreen = false,
  size = "lg",
  text = "Завантаження...",
}) => {
  const dimensions = {
    sm: {
      spinner: { width: "24px", height: "24px", borderWidth: "2px" },
      pulse: { width: "12px", height: "12px" },
    },
    md: {
      spinner: { width: "48px", height: "48px", borderWidth: "3px" },
      pulse: { width: "24px", height: "24px" },
    },
    lg: {
      spinner: { width: "72px", height: "72px", borderWidth: "4px" },
      pulse: { width: "36px", height: "36px" },
    },
  };

  const currentSize = dimensions[size] || dimensions.lg;

  return (
    <div
      className={`${styles.loaderWrapper} ${fullScreen ? styles.fullScreen : ""}`}
    >
      <div className={styles.spinnerContainer}>
        <div className={styles.pulseCircle} style={currentSize.pulse} />

        <div className={styles.spinner} style={currentSize.spinner} />
      </div>

      {text && size !== "sm" && <p className={styles.text}>{text}</p>}
    </div>
  );
};
