import { FileText, Plus } from "lucide-react";
import styles from "./MyTestsPage.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { deleteTest, getMyTests } from "../../services/test.service";
import { Loader } from "../../components/ui/Loader/Loader";
import FetchError from "../../components/ui/FetchError/FetchError";
import DeleteModal from "../../components/ui/DeleteModal/DeleteModal";
import MyTestCard from "../../components/MyTestCard/MyTestCard";

function MyTestsPage() {
  const [tests, setTests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    testId: null,
    testTitle: "",
  });

  const navigate = useNavigate();
  const LIMIT = 20;

  useEffect(() => {
    const loadData = async (targetPage, isMore = false) => {
      try {
        if (!isMore) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const response = await getMyTests({ page: targetPage, limit: LIMIT });
        const incomingTests = response?.data?.tests || [];
        const incomingPagination = response?.data?.pagination || null;

        if (targetPage === 1) {
          setTests(incomingTests);
        } else {
          setTests((prev) => [...prev, ...incomingTests]);
        }
        setPagination(incomingPagination);
      } catch (err) {
        console.error("Помилка при завантаженні власних тестів:", err);
        setError(
          err.response?.data?.message ||
            "Не вдалося отримати список ваших тестів.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    loadData(page, page > 1);
  }, [page]);

  const handleDeleteClick = (testId, testTitle) => {
    setDeleteModal({ isOpen: true, testId, testTitle });
  };

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, testId: null, testTitle: "" });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteModal.testId;
    try {
      await deleteTest(id);
      setTests((prev) => prev.filter((t) => t.id !== id));
      handleDeleteClose();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Не вдалося видалити тест. Спробуйте пізніше.",
      );
    }
  };

  const hasMore = pagination ? tests.length < pagination.total : false;

  if (loading)
    return (
      <Loader
        fullScreen={true}
        text="Дістаємо ваші розробки з бджолиних сот..."
      />
    );

  if (error) {
    return (
      <FetchError error={error} onBack={() => setPage(1)} backText="Оновити" />
    );
  }
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <FileText className={styles.icon} size={28} />
            <div>
              <h1 className={styles.pageTitle}>Мої тести</h1>
              <p className={styles.pageSubtitle}>Керуйте створеними тестами</p>
            </div>
          </div>
          <button
            className={styles.createBtn}
            onClick={() => navigate("/test/create")}
          >
            <Plus size={16} /> Створити новий
          </button>
        </header>

        {tests.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Ви ще не створили жодного тесту. Бажаєте спробувати? 🚀</p>
            <button
              className={styles.createBtn}
              onClick={() => navigate("/test/create")}
            >
              Створити перший тест
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {tests.map((test) => (
              <MyTestCard
                key={test.id}
                test={test}
                onDeleteClick={handleDeleteClick}
              />
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
      {deleteModal.isOpen && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          text={`Ви дійсно хочете видалити тест "${deleteModal.testTitle}"?`}
        />
      )}
    </div>
  );
}

export default MyTestsPage;
