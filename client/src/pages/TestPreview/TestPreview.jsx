import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAuthStore } from "../../stores/useAuthStore";
import { getDetailInfoTest } from "../../services/test.service";
import { Loader } from "../../components/ui/Loader/Loader";
import {
  Globe,
  Mail,
  ShieldAlert,
  Lock,
  Clock,
  BookOpen,
  User,
  HelpCircle,
  Calendar,
  GraduationCap,
  Play,
  Info,
} from "lucide-react";
import styles from "./TestPreview.module.css";

function TestPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getDetailInfoTest(id);
        setTest(response.data);
      } catch (err) {
        setError("Не вдалося завантажити інформацію про тест.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTest();
    }
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const accessConfig = {
    PUBLIC: { label: "Публічний", icon: Globe, color: styles.public },
    EMAIL_LIST: { label: "За списком пошт", icon: Mail, color: styles.email },
    DOMAIN: { label: "За доменом", icon: ShieldAlert, color: styles.domain },
  };

  const showResultsConfig = {
    FULL: "Повний результат з правильними відповідями",
    ONLY_SCORE: "Тільки підсумковий бал",
  };

  const handleStart = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    navigate(`/test/passing/${id}`);
  };

  if (loading)
    return <Loader fullScreen={true} text="Завантаження даних тесту..." />;

  if (error) {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorCard}>
          <h2>Помилка</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Повернутися назад</button>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const currentAccess = accessConfig[test.accessMode] || {
    label: test.accessMode || "Приватний",
    icon: Lock,
    color: styles.private,
  };
  const AccessIcon = currentAccess.icon;

  return (
    <div className={styles.container}>
      <div className={styles.contentGrid}>
        {/* ОСНОВНА ІНФОРМАЦІЯ */}
        <main className={styles.mainInfo}>
          <div className={styles.header}>
            <div className={styles.badges}>
              <span className={styles.categoryTag}>
                <BookOpen size={14} /> {test.category?.name}
              </span>
              <span className={`${styles.accessTag} ${currentAccess.color}`}>
                <AccessIcon size={14} /> {currentAccess.label}
              </span>
            </div>
            <h1 className={styles.title}>{test.title}</h1>
            <div className={styles.universityLine}>
              <GraduationCap size={18} />
              <span>{test.university?.name}</span>
            </div>
          </div>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Опис тесту</h3>
            <p className={styles.description}>{test.description}</p>
          </section>

          {/* ДОДАТКОВІ УМОВИ (ДОМЕНИ) */}
          {test.accessMode === "DOMAIN" && test.allowedDomains?.length > 0 && (
            <section className={styles.accessSection}>
              <div className={styles.accessNotice}>
                <ShieldAlert size={20} />
                <div>
                  <strong>Доступ обмежено доменом</strong>
                  <p>
                    Тільки для користувачів з поштою:{" "}
                    {test.allowedDomains.map((d) => d.domain).join(", ")}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Конфіденційність результатів
            </h3>
            <div className={styles.infoRow}>
              <Info size={18} />
              <span>
                {showResultsConfig[test.showResults] || "На розсуд автора"}
              </span>
            </div>
          </section>
        </main>

        {/* ПРАВА ПАНЕЛЬ: ДЕТАЛІ ТА СТАРТ */}
        <aside className={styles.sidebar}>
          <div className={styles.stickyCard}>
            <h3 className={styles.sidebarTitle}>Деталі тестування</h3>

            <div className={styles.statList}>
              <div className={styles.statItem}>
                <div className={styles.iconBox}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Кількість питань</p>
                  <p className={styles.statValue}>
                    {test.questionsCount} питань
                  </p>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.iconBox}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Обмеження часу</p>
                  <p className={styles.statValue}>
                    {test.timeLimitSecond
                      ? `${Math.ceil(test.timeLimitSecond / 60)} хв.`
                      : "Без обмеження в часі"}
                  </p>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.iconBox}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Дата створення</p>
                  <p className={styles.statValue}>
                    {formatDate(test.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.authorBlock}>
              <div className={styles.authorAvatar}>
                <User size={22} />
              </div>
              <div>
                <p className={styles.authorRole}>Автор тесту</p>
                <p className={styles.authorName}>
                  {test.author?.first_name} {test.author?.last_name}
                </p>
              </div>
            </div>

            <button className={styles.startBtn} onClick={handleStart}>
              <Play size={18} fill="currentColor" />
              <span>Почати тест</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TestPreview;
