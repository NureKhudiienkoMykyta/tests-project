import {
  Compass,
  History,
  Trophy,
  Target,
  Flame,
  AlertCircle,
} from "lucide-react";
import styles from "./Dashboard.module.css";
import { useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { getUserDashboardStats } from "../../services/uesr.service";
import { getTestContinue, getTestPopular } from "../../services/test.service";
import { useEffect } from "react";
import { Loader } from "../../components/ui/Loader/Loader";
import TestCard from "../../components/TestCard/TestCard";
import ContinueTestCard from "../../components/ContinueTestCard/ContinueTestCard";
import { useNavigate } from "react-router";
import PricingSection from "../../components/PricingSection/PricingSection";

function Dashboard() {
  const navigate = useNavigate();
  const { user, isPremium } = useAuthStore();
  const hasPremium = isPremium();

  const [stats, setStats] = useState({
    attemptsCount: 0,
    averageScore: 0,
    currentStreak: 0,
  });
  const [continueTests, setContinueTests] = useState([]);
  const [popularTests, setPopularTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsData, continueData, popularData] = await Promise.all([
          getUserDashboardStats(),
          getTestContinue(),
          getTestPopular(9),
        ]);

        if (statsData) setStats(statsData.data);
        if (continueData) setContinueTests(continueData.data);
        if (popularData) setPopularTests(popularData.data);
      } catch (error) {
        console.error("Помилка завантаження даних дашборду:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader size="md" text="Завантаження вашого дашборду..." />;
  }

  return (
    <div className={styles.dashboardWrapper}>
      {/* ВЕРХНІЙ БЛОК: HERO СЕКЦІЯ ТА СТАТИСТИКА */}
      <div className={styles.topGrid}>
        {/* 1. HERO DASHBOARD SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.welcomeBlock}>
            <h1 className={styles.greeting}>
              Привіт, {user?.firstName} {user?.lastName}
              {hasPremium && (
                <span className={styles.premiumBadge}>Premium</span>
              )}
            </h1>
            <p className={styles.subGreeting}>Готовий пройти новий тест?</p>
          </div>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryBtn}
              onClick={() => navigate("/library")}
            >
              <Compass size={18} />
              <span>Знайти тест</span>
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/attempt/history")}
            >
              <History size={18} />
              <span>Мої результати</span>
            </button>
          </div>
        </section>

        {/* 2. STATS SECTION */}
        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.blue}`}>
              <Trophy size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.attemptsCount}</span>
              <span className={styles.statLabel}>Кількість проходжень</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.green}`}>
              <Target size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {Math.round(stats.averageScore)}%
              </span>
              <span className={styles.statLabel}>Середня успішність</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.orange}`}>
              <Flame size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.currentStreak}</span>
              <span className={styles.statLabel}>Днів поспіль</span>
            </div>
          </div>
        </section>
      </div>

      {/* 3. CONTINUE TEST SECTION */}
      {continueTests.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Продовжити незавершені тести</h2>
          <div className={styles.continueList}>
            {continueTests.map((attempt) => (
              <ContinueTestCard key={attempt.attemptId} attempt={attempt} />
            ))}
          </div>
        </section>
      )}

      {/* 4. POPULAR TESTS SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Найпопулярніші тести платформи</h2>
        {popularTests.length > 0 ? (
          <div className={styles.testsGrid}>
            {popularTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <AlertCircle size={24} />
            <p>
              Наразі популярних тестів не знайдено. Будьте першим, хто створить
              або пройде тест!
            </p>
          </div>
        )}
      </section>
      {!hasPremium && <PricingSection isDashboardView={true} />}
    </div>
  );
}

export default Dashboard;
