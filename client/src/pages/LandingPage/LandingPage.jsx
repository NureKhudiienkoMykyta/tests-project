import { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";
import { HeroSection } from "../../components/LandingPage/HeroSection/HeroSection";
import { FeaturesSection } from "../../components/LandingPage/FeaturesSection/FeaturesSection";
import HowItWorksSection from "../../components/LandingPage/HowItWorksSection/HowItWorksSection";
import { StatsSection } from "../../components/LandingPage/StatsSection/StatsSection";
import { FinalCtaSection } from "../../components/LandingPage/FinalCtaSection/FinalCtaSection";
import { FAQ } from "../../components/FAQ/FAQ";
import { getPublicStats } from "../../services/public.service";
function LandingPage() {
  const [stats, setStats] = useState({
    testsCount: "10k+",
    usersCount: "5k+",
    attemptsCount: "100k+",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getPublicStats();
        const data = response.data;

        setStats({
          testsCount:
            data.totalTest !== undefined ? `${data.totalTest}` : "10k+",
          usersCount:
            data.totalUsers !== undefined ? `${data.totalUsers}` : "5k+",
          attemptsCount:
            data.totalAttempts !== undefined
              ? `${data.totalAttempts}`
              : "100k+",
        });
      } catch (error) {
        console.log("Статистика завантажується з локальних дефолтів.", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className={styles.landingWrapper}>
      <HeroSection />

      <FeaturesSection />

      <HowItWorksSection />

      <StatsSection stats={stats} />

      <section>
        <h2 className={styles.faqSectionTitle}>Часті питання</h2>
        <FAQ />
      </section>

      <FinalCtaSection />
    </div>
  );
}

export default LandingPage;
