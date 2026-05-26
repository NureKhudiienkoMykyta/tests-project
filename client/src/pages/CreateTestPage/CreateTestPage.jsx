import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getAllCategories } from "../../services/category.service";
import { createTest } from "../../services/test.service";
import { Loader } from "../../components/ui/Loader/Loader";
import MainInfoSection from "../../components/EditCreateTest/MainInfoSection/MainInfoSection";
import { Plus, Save } from "lucide-react";
import styles from "./CreateTestPage.module.css";
import QuestionsSection from "../../components/EditCreateTest/QuestionsSection/QuestionsSection";
function CreateTestPage() {
  const navigate = useNavigate();

  // 1. Метадані з сервера
  const [categories, setCategories] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Основні поля тесту
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accessMode, setAccessMode] = useState("PUBLIC"); // PUBLIC | DOMAIN | EMAIL_LIST
  const [showResults, setShowResults] = useState("FULL"); // FULL | ONLY_SCORE
  const [timeLimit, setTimeLimit] = useState(""); // Рядок з інпуту, перед відправкою конвертуємо

  // 3. Списки обмежень доступу
  const [allowedDomains, setAllowedDomains] = useState([""]);
  const [allowedEmails, setAllowedEmails] = useState([""]);

  // 4. Стан структури питань
  // Початковий стан: одне питання типу SINGLE_CHOICE з двома варіантами відповідей
  const [questions, setQuestions] = useState([
    {
      type: "SINGLE_CHOICE", // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, SHORT_TEXT, LONG_TEXT, NUMBER
      content: "",
      points: 1,
      correct_answer: "", // Використовується тільки для SHORT_TEXT, LONG_TEXT, NUMBER
      answers: [
        { content: "", is_correct: false },
        { content: "", is_correct: false },
      ],
    },
  ]);

  // Завантаження категорій
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingMetadata(true);
        const response = await getAllCategories();
        setCategories(response.data);
      } catch (err) {
        console.error("Помилка завантаження категорій:", err);
        setGlobalError(
          "Не вдалося завантажити категорії. Спробуйте оновити сторінку.",
        );
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchCategories();
  }, []);

  // ==========================================
  // РОБОТА З ПИТАННЯМИ ТА ВІДПОВІДЯМИ
  // ==========================================

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "SINGLE_CHOICE",
        content: "",
        points: 1,
        correct_answer: "",
        answers: [
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ],
      },
    ]);
  };

  // ==========================================
  // ВІДПРАВКА ФОРМИ НА СЕРВЕР
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: Number(categoryId),
        access_mode: accessMode,
        show_results: showResults,
        time_limit_seccond: timeLimit ? Number(timeLimit) : null,
        questions: questions.map((q) => {
          const baseQuestion = {
            type: q.type,
            content: q.content.trim(),
            points: Number(q.points),
          };

          if (["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(q.type)) {
            baseQuestion.correct_answer = String(q.correct_answer).trim();
          } else {
            baseQuestion.answers = q.answers.map((a) => ({
              content: a.content.trim(),
              is_correct: Boolean(a.is_correct),
            }));
          }

          return baseQuestion;
        }),
      };

      // Додаємо обмежень, якщо обрано відповідний режим доступу
      if (accessMode === "DOMAIN") {
        payload.allowed_domains = allowedDomains.filter((d) => d.trim() !== "");
      }
      if (accessMode === "EMAIL_LIST") {
        payload.allowed_emails = allowedEmails.filter((e) => e.trim() !== "");
      }

      const response = await createTest(payload);

      if (response) {
        navigate("/library");
      }
    } catch (err) {
      console.error("Помилка створення тесту:", err);
      const serverMessage = err.response?.data?.message || err.message;
      setGlobalError(
        serverMessage ||
          "Сталася помилка при створенні тесту. Перевірте правильність заповнення полів.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingMetadata)
    return <Loader fullScreen text="Завантаження конфігурації..." />;

  return (
    <form className={styles.pageContainer} onSubmit={handleSubmit}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Створення нового тесту</h1>
          <p>
            Конструюйте завдання, встановлюйте ліміти та керуйте приватністю
            доступу
          </p>
        </div>
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={isSubmitting}
        >
          <Save size={18} />
          <span>{isSubmitting ? "Збереження..." : "Опублікувати тест"}</span>
        </button>
      </header>

      {globalError && <div className={styles.errorBanner}>{globalError}</div>}

      <div className={styles.sectionsLayout}>
        <MainInfoSection
          categories={categories}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          accessMode={accessMode}
          setAccessMode={setAccessMode}
          showResults={showResults}
          setShowResults={setShowResults}
          timeLimit={timeLimit}
          setTimeLimit={setTimeLimit}
          allowedDomains={allowedDomains}
          setAllowedDomains={setAllowedDomains}
          allowedEmails={allowedEmails}
          setAllowedEmails={setAllowedEmails}
        />

        <QuestionsSection questions={questions} setQuestions={setQuestions} />

        <div className={styles.bottomActions}>
          <button
            type="button"
            className={styles.addQuestionOuterBtn}
            onClick={handleAddQuestion}
          >
            <Plus size={20} />
            <span>Додати наступне питання</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default CreateTestPage;
