import styles from "./StatsSection.module.css";

export const StatsSection = ({ stats }) => {
  return (
    <section className={styles.statsRow}>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.testsCount}</span>
        <span className={styles.statLabel}>Доступних тестів</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.usersCount}</span>
        <span className={styles.statLabel}>Активних користувачів</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.attemptsCount}</span>
        <span className={styles.statLabel}>Успішних проходжень</span>
      </div>
    </section>
  );
};
