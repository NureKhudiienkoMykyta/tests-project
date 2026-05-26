import { useState, useEffect } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./LibraryTests.module.css";
import { getAllCategories } from "../../services/category.service";
import { getAllUniversities } from "../../services/university.service";
import { getTestsLibrary } from "../../services/test.service";
import { Loader } from "../../components/ui/Loader/Loader";
import TestCard from "../../components/TestCard/TestCard";
import Select from "../../components/ui/Select/Select";
import Input from "../../components/ui/Input/Input";

function LibraryTests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [universityId, setUniversityId] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  const [categories, setCategories] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [tests, setTests] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const sortOptions = [
    { id: "newest", name: "Новіші" },
    { id: "oldest", name: "Старіші" },
  ];

  const isFiltered =
    Boolean(searchTerm.trim()) ||
    Boolean(categoryId) ||
    Boolean(universityId) ||
    sortBy !== "newest";

  useEffect(() => {
    const fetchMetadata = async () => {
      setMetadataLoading(true);

      try {
        const [categoriesResponse, universitiesResponse] = await Promise.all([
          getAllCategories(),
          getAllUniversities(),
        ]);

        setCategories(categoriesResponse.data || []);
        setUniversities(universitiesResponse.data || []);
      } catch (error) {
        console.error("Не вдалося завантажити метадані", error);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);

      try {
        const params = {
          page,
          limit: 12,
          search: searchTerm.trim() || undefined,
          categoryId: categoryId || undefined,
          universityId: universityId || undefined,
          sortBy,
        };

        const response = await getTestsLibrary(params);

        setTests(response.data.tests || []);
        setPagination(
          response.data.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (error) {
        console.error("Не вдалося завантажити тести", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [page, searchTerm, categoryId, universityId, sortBy]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryId(null);
    setUniversityId(null);
    setSortBy("newest");
    setPage(1);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className={styles.libraryContainer}>
      {/* HEADER SECTION */}
      <header className={styles.libraryHeader}>
        <div className={styles.titleBlock}>
          <h1>Бібліотека тестів</h1>
          <p>Обирайте тести серед категорій та ЗВО</p>
        </div>
      </header>

      {/* FILTER BAR SECTION */}
      <div className={styles.filterBar}>
        {/* Верхній рядок: Пошук на всю ширину */}
        <div className={styles.searchRow}>
          <Input
            icon={Search}
            type="text"
            placeholder="Пошук за назвою або описом тесту..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Нижній рядок: Фільтри зліва, Кнопка справа */}
        <div className={styles.controlsRow}>
          <div className={styles.selectsGroup}>
            <Select
              key={`cat-${resetKey}`}
              options={categories}
              onSelect={(val) => {
                setCategoryId(val);
                setPage(1);
              }}
              placeholder="Всі категорії"
              disabled={metadataLoading}
            />

            <Select
              key={`uni-${resetKey}`}
              options={universities}
              onSelect={(val) => {
                setUniversityId(val);
                setPage(1);
              }}
              placeholder="Всі університети (ЗВО)"
              disabled={metadataLoading}
            />

            <Select
              key={`sort-${resetKey}`}
              options={sortOptions}
              onSelect={(val) => {
                setSortBy(val);
                setPage(1);
              }}
              placeholder="Сортування"
            />
          </div>

          {/* Кнопка "Скинути" з'являється і завжди притиснута до правому краю */}
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className={styles.clearFiltersBtn}
            >
              <X size={16} />
              <span>Скинути</span>
            </button>
          )}
        </div>
      </div>

      {/* CATALOG CONTENT */}
      {loading ? (
        <div className={styles.loaderArea}>
          <Loader text="Шукаємо тести за вашим запитом..." size="md" />
        </div>
      ) : tests.length > 0 ? (
        <>
          <div className={styles.testsGrid}>
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>

          {/* PAGINATION BLOCK */}
          {pagination.totalPages > 1 && (
            <div className={styles.paginationRow}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>

              <span className={styles.pageInfo}>
                Сторінка <strong>{pagination.page}</strong> з{" "}
                {pagination.totalPages}
              </span>

              <button
                className={styles.pageBtn}
                disabled={page === pagination.totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyStateContainer}>
          <SlidersHorizontal size={48} className={styles.emptyIcon} />
          <h3>Тестов не знайдено</h3>
          <p>
            Жоден тест не відповідає обраним критеріям фільтрації або пошуковому
            запиту.
          </p>
          {isFiltered && (
            <button onClick={clearAllFilters} className={styles.resetSearchBtn}>
              Почати спочатку
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default LibraryTests;
