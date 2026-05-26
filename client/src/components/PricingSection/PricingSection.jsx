import { Sparkles, Loader2, CreditCard } from "lucide-react";
import styles from "./PricingSection.module.css";
import {
  createSubscription,
  getPlans,
} from "../../services/subscription.service";
import { useState } from "react";
import { useEffect } from "react";
import { Loader } from "../ui/Loader/Loader";

function PricingSection({ isDashboardView = false, onBeforeSubscribe = null }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingPlanId, setSubmittingPlanId] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await getPlans();

        if (response?.data) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error("Помилка при завантаженні тарифних планів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (stripePriceId) => {
    if (onBeforeSubscribe && !onBeforeSubscribe()) {
      return;
    }

    try {
      setSubmittingPlanId(stripePriceId);
      const response = await createSubscription(stripePriceId);

      if (response?.data?.url) {
        window.location.assign(response.data.url);
      } else {
        alert("Не вдалося отримати посилання на оплату. Спробуйте пізніше.");
      }
    } catch (error) {
      console.error("Помилка під час ініціалізації підписки:", error);
      alert(
        error.response?.data?.message ||
          "Сталася помилка при переході до оплати.",
      );
    } finally {
      setSubmittingPlanId(null);
    }
  };

  if (loading) {
    return <Loader text="Завантаження актуальних тарифів..." size="md" />;
  }

  return (
    <section
      className={`${styles.pricingSection} ${isDashboardView ? styles.dashboardSpacing : ""}`}
    >
      <div className={styles.sectionHeader}>
        <div className={styles.badge}>
          <Sparkles size={14} fill="currentColor" />
          <span>Тарифи платформи</span>
        </div>
        <h2>
          {isDashboardView
            ? "Розкрий повний потенціал з Premium"
            : "Обери свій план навчання"}
        </h2>
      </div>

      <div className={styles.grid}>
        {plans.map((plan) => {
          const isYearly = plan.interval === "year";
          const formattedPrice = Math.round(plan.amount / 100);
          const isSubmitting = submittingPlanId === plan.stripePriceId;

          return (
            <div
              key={plan.stripePriceId}
              className={`${styles.planCard} ${isYearly ? styles.popularCard : ""}`}
            >
              {isYearly && (
                <div className={styles.popularBadge}>Найвигідніший</div>
              )}

              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.product.name}</h3>
                <p className={styles.planDescription}>
                  {plan.product.description}
                </p>
              </div>

              <div className={styles.priceBlock}>
                <span className={styles.currency}>
                  {plan.currency === "uah" ? "₴" : plan.currency.toUpperCase()}
                </span>
                <span className={styles.price}>{formattedPrice}</span>
                <span className={styles.period}>
                  /{isYearly ? "рік" : "міс"}
                </span>
              </div>

              <button
                className={`${styles.actionBtn} ${isYearly ? styles.premiumBtn : ""}`}
                disabled={isSubmitting || !!submittingPlanId}
                onClick={() => handleSubscribe(plan.stripePriceId)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className={styles.spinner} size={18} />
                    <span>Оформлення...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Придбати Premium</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PricingSection;
