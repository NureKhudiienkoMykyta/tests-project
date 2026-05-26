import { ClipboardList } from "lucide-react";
import styles from "./AttemptsHistoryPage.module.css";
import { Loader } from "../../components/ui/Loader/Loader";
import FetchError from "../../components/ui/FetchError/FetchError";
import { getHistoryAttempts } from "../../services/attemp.service";
import AttemptHistoryCard from "../../components/Attempt/AttemptHistoryCard/AttemptHistoryCard";
import { useEffect, useState } from "react";

function AttemptsHistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const LIMIT = 20;

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        setError(null);

        const response = await getHistoryAttempts({ page, limit: LIMIT });

        const dataAttempts = response?.data?.attempts || [];
        const dataPagination = response?.data?.pagination || null;

        if (page === 1) {
          setAttempts(dataAttempts);
        } else {
          setAttempts((prev) => [...prev, ...dataAttempts]);
        }

        setPagination(dataPagination);
      } catch (err) {
        console.error("Помилка завантаження історії спроб:", err);
        setError(
          err.response?.data?.message ||
            "Не вдалося завантажити історію проходжень.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchAttempts();
  }, [page]);

  const hasMore = pagination ? attempts.length < pagination.total : false;

  if (loading)
    return (
      <Loader fullScreen={true} text="Завантажуємо історію ваших успіхів..." />
    );

  if (error) {
    return (
      <FetchError
        error={error}
        onBack={() => setPage(1)}
        backText="Спробувати знову"
      />
    );
  }
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <ClipboardList className={styles.headerIcon} size={28} />
            <div>
              <h1 className={styles.pageTitle}>Історія проходжень</h1>
              <p className={styles.pageSubtitle}>
                Тут зібрані всі ваші спроби складання тестів та результати
                аналізу відповідей
              </p>
            </div>
          </div>
          {pagination && (
            <div className={styles.countBadge}>
              Всього спроб: <strong>{pagination.total}</strong>
            </div>
          )}
        </header>

        {attempts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Ви ще не проходили жодного тесту. Час спробувати свої сили!</p>
          </div>
        ) : (
          <div className={styles.list}>
            {attempts.map((attempt) => (
              <AttemptHistoryCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className={styles.paginationCenter}>
            <button
              className={styles.loadMoreBtn}
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loadingMore}
            >
              {loadingMore ? "Завантаження..." : "Завантажити ще"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttemptsHistoryPage;
