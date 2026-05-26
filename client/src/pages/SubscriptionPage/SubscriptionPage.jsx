import { CreditCard, ExternalLink, History, ShieldCheck } from "lucide-react";
import styles from "./SubscriptionPage.module.css";
import { useEffect, useState } from "react";
import {
  canselSubsscription,
  getHistory,
  getMySubscription,
  openPortal,
} from "../../services/subscription.service";
import FetchError from "../../components/ui/FetchError/FetchError";
import { useNavigate } from "react-router";
import SubscriptionCard from "../../components/Subscription/SubscriptionCard/SubscriptionCard";
import DeleteModal from "../../components/ui/DeleteModal/DeleteModal";
import { Loader } from "../../components/ui/Loader/Loader";

function SubscriptionPage() {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState(null);

  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    subscriptionId: null,
    productName: "",
  });

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const [subResponse, historyResponse] = await Promise.all([
          getMySubscription(),
          getHistory(),
        ]);

        setSubscriptions(subResponse?.data || []);
        setHistory(historyResponse?.data || []);
      } catch (err) {
        console.error("Помилка отримання підписок:", err);
        setError(
          err.response?.data?.message ||
            "Не вдалося завантажити інформацію про підписки.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      const response = await openPortal();

      if (response?.data?.url) {
        window.open(response.data.url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("Посилання на Stripe портал не знайдено.");
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Не вдалося відкрити платіжний портал.",
      );
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelClick = (subscriptionId, productName) => {
    setCancelModal({
      isOpen: true,
      subscriptionId,
      productName,
    });
  };

  const handleCancelConfirm = async () => {
    const subId = cancelModal.subscriptionId;
    try {
      await canselSubsscription(subId);

      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subId ? { ...sub, cancel_at_period_end: true } : sub,
        ),
      );

      setHistory((prev) =>
        prev.map((sub) =>
          sub.id === subId ? { ...sub, cancel_at_period_end: true } : sub,
        ),
      );

      setCancelModal({ isOpen: false, subscriptionId: null, productName: "" });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Не вдалося скасувати підписку. Спробуйте пізніше.",
      );
    }
  };

  if (loading) {
    return (
      <Loader fullScreen={true} text="Перевіряємо ваші преміум-привілеї..." />
    );
  }

  if (error) {
    return (
      <FetchError
        error={error}
        onBack={() => navigate("/subscription/my")}
        backText="Повторити спробу"
      />
    );
  }
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <ShieldCheck className={styles.icon} size={30} />
            <div>
              <h1 className={styles.pageTitle}>Керування підпискою</h1>
              <p className={styles.pageSubtitle}>
                Переглядайте активні плани, завантажуйте інвойси та змінюйте
                платіжні реквізити
              </p>
            </div>
          </div>

          <button
            className={styles.portalBtn}
            onClick={handleOpenPortal}
            disabled={portalLoading}
          >
            <CreditCard size={16} />
            {portalLoading ? "Відкриття..." : "Платіжний портал (Stripe)"}
            <ExternalLink size={14} />
          </button>
        </header>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>
            Ваші активні або не відміненні тарифні плани
          </h2>

          {subscriptions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                У вас немає активних або запланованих підписок. Перейдіть до
                каталогу, щоб оформити Premium доступ.
              </p>
            </div>
          ) : (
            <div className={styles.subList}>
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  sub={sub}
                  onCancelClick={handleCancelClick}
                />
              ))}
            </div>
          )}
        </section>

        <section className={styles.contentSection}>
          <div className={styles.historyTitleBlock}>
            <History size={20} className={styles.historyIcon} />
            <h2 className={styles.sectionTitle}>Історія підписок</h2>
          </div>

          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Історія підписок порожня.</p>
            </div>
          ) : (
            <div className={styles.subList}>
              {history.map((sub) => (
                <SubscriptionCard key={sub.id} sub={sub} />
              ))}
            </div>
          )}
        </section>
      </div>

      {cancelModal.isOpen && (
        <DeleteModal
          title="Скасування автопродовження"
          btnCancelText="До сторінки підписок"
          btnConfirmText="Скасувати"
          text={`Ви дійсно хочете вимкнути автопродовження для підписки "${cancelModal.productName}"? Ваш Premium-доступ залишатиметься повністю активним до кінця поточного оплаченого періоду.`}
          onClose={() =>
            setCancelModal({
              isOpen: false,
              subscriptionId: null,
              productName: "",
            })
          }
          onConfirm={handleCancelConfirm}
        />
      )}
    </div>
  );
}

export default SubscriptionPage;
