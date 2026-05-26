import { useNavigate } from "react-router";
import { useAuthStore } from "../../stores/useAuthStore";
import PricingSection from "../../components/PricingSection/PricingSection";
import styles from "./Subscription.module.css";

function Subscription() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleBeforeSubscribe = () => {
    if (!user) {
      navigate("/login", { state: { from: "/subscription" } });
      return false;
    }
    return true;
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Плани підписки QuizBee</h1>
          <p className={styles.heroSubtitle}>
            Обери найкращий план для свого навчання та розкрий весь потенціал
            платформи
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricingWrapper}>
        <PricingSection
          isDashboardView={false}
          onBeforeSubscribe={handleBeforeSubscribe}
        />
      </section>
    </div>
  );
}

export default Subscription;
