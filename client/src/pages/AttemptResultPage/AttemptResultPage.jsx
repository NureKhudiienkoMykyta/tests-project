import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { getResultTestAttempt } from "../../services/attemp.service";
import { Loader } from "../../components/ui/Loader/Loader";
import FetchError from "../../components/ui/FetchError/FetchError";
import { AlertTriangle, Calendar, Clock, Trash2 } from "lucide-react";
import ResultQuestionCard from "../../components/Attempt/ResultQuestionCard/ResultQuestionCard";
import ResultHero from "../../components/Attempt/ResultHero/ResultHero";
import styles from "./AttemptResultPage.module.css";

function AttemptResultPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(
    location.state?.result?.data || location.state?.result || null,
  );
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!result) {
      const fetchResults = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getResultTestAttempt(attemptId);
          setResult(response.data);
        } catch (err) {
          console.error("Помилка завантаження результатів:", err);
          setError(
            err.response?.data?.message ||
              "Не вдалося завантажити результати спроби.",
          );
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
  }, [attemptId, result]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Loader fullScreen={true} text="Збираємо мед та підраховуємо бали..." />
    );
  }

  if (error) {
    return (
      <FetchError
        error={error}
        onBack={() => navigate("/dashboard")}
        backText="Повернутися на головну"
      />
    );
  }
  const isTestDeleted = !result.test_title;
  if (!result) return null;
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {isTestDeleted && (
          <div className={styles.deletedTestNotice}>
            <Trash2 size={20} className={styles.deletedIcon} />
            <p>
              Оригінальний тест був видалений автором. Ви бачите збережену
              історію своєї спроби та знімки відповідей.
            </p>
          </div>
        )}
        <ResultHero result={result} isTestDeleted={isTestDeleted} />

        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Calendar size={20} className={styles.statIcon} />
            <div>
              <span className={styles.statLabel}>Тест завершено</span>
              <span className={styles.statValue}>
                {formatDate(result.finished_at)}
              </span>
            </div>
          </div>
          {!isTestDeleted && (
            <div className={styles.statCard}>
              <Clock size={20} className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Часовий ліміт</span>
                <span className={styles.statValue}>
                  {result.time_limit_second
                    ? `${Math.ceil(result.time_limit_second / 60)} хв.`
                    : "Без обмежень"}
                </span>
              </div>
            </div>
          )}
        </section>

        {result.detailed_results ? (
          <section className={styles.detailsSection}>
            <h2 className={styles.sectionTitle}>Аналіз відповідей</h2>
            <div className={styles.questionsList}>
              {result.detailed_results.map((item, index) => (
                <ResultQuestionCard key={index} item={item} index={index} />
              ))}
            </div>
          </section>
        ) : (
          <div className={styles.onlyScoreNotice}>
            <AlertTriangle size={20} />
            <p>
              Організатор тестування обмежив відображення детальних відповідей.
              Доступний лише підсумковий бал.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttemptResultPage;
