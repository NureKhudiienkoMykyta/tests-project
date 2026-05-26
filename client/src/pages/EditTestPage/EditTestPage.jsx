import { Plus, Save } from "lucide-react";
import styles from "./EditTestPage.module.css";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getAllCategories } from "../../services/category.service";
import { editTest, getTestForEdit } from "../../services/test.service";
import FetchError from "../../components/ui/FetchError/FetchError";
import { Loader } from "../../components/ui/Loader/Loader";
import QuestionsSection from "../../components/EditCreateTest/QuestionsSection/QuestionsSection";
import MainInfoSection from "../../components/EditCreateTest/MainInfoSection/MainInfoSection";

function EditTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accessMode, setAccessMode] = useState("PUBLIC");
  const [showResults, setShowResults] = useState("FULL");
  const [timeLimit, setTimeLimit] = useState("");

  const [allowedDomains, setAllowedDomains] = useState([""]);
  const [allowedEmails, setAllowedEmails] = useState([""]);

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setGlobalError("");

        const [categoriesRes, testRes] = await Promise.all([
          getAllCategories(),
          getTestForEdit(testId),
        ]);

        const testData = testRes?.data;
        setCategories(categoriesRes?.data || []);

        if (testData) {
          setTitle(testData.title || "");
          setDescription(testData.description || "");
          setCategoryId(String(testData.category_id || ""));
          setAccessMode(testData.access_mode || "PUBLIC");
          setShowResults(testData.show_results || "FULL");
          setTimeLimit(
            testData.time_limit_seccond !== null
              ? String(testData.time_limit_seccond)
              : "",
          );

          const domains =
            testData.allowed_test_domains?.map((d) => d.domain) || [];
          setAllowedDomains(domains.length > 0 ? domains : [""]);

          const emails =
            testData.allowed_test_emails?.map((e) => e.email) || [];
          setAllowedEmails(emails.length > 0 ? emails : [""]);

          const mappedQuestions = (testData.questions || []).map((q) => ({
            id: q.id,
            type: q.type,
            content: q.content || "",
            points: q.points || 1,
            correct_answer:
              q.correct_answer !== null ? String(q.correct_answer) : "",
            answers: (q.answers || []).map((a) => ({
              id: a.id,
              content: a.content || "",
              is_correct: Boolean(a.is_correct),
            })),
          }));

          setQuestions(mappedQuestions);
        }
      } catch (err) {
        console.error("Помилка завантаження даних для редагування:", err);
        setGlobalError(
          err.response?.data?.message ||
            "Не вдалося завантажити дані тесту. Можливо, його не існує або у вас немає прав.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (testId) fetchInitialData();
  }, [testId]);

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

          if (q.id !== undefined && q.id !== null) {
            baseQuestion.id = q.id;
          }

          if (["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(q.type)) {
            baseQuestion.correct_answer = String(q.correct_answer).trim();
          } else {
            baseQuestion.answers = q.answers.map((a) => {
              const baseAnswer = {
                content: a.content.trim(),
                is_correct: Boolean(a.is_correct),
              };
              if (a.id !== undefined && a.id !== null) {
                baseAnswer.id = a.id;
              }
              return baseAnswer;
            });
          }

          return baseQuestion;
        }),
      };

      if (accessMode === "DOMAIN") {
        payload.allowed_domains = allowedDomains.filter((d) => d.trim() !== "");
      } else if (accessMode === "EMAIL_LIST") {
        payload.allowed_emails = allowedEmails.filter((e) => e.trim() !== "");
      } else if (accessMode === "PUBLIC") {
        payload.allowed_domains = [];
        payload.allowed_emails = [];
      }

      await editTest(testId, payload);

      navigate("/test/my");
    } catch (err) {
      console.error("Помилка оновлення тесту:", err);
      const serverMessage = err.response?.data?.message || err.message;
      setGlobalError(
        serverMessage ||
          "Сталася помилка при збереженні тесту. Перевірте валідацію полів.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (globalError && loading === false && questions.length === 0) {
    return (
      <FetchError
        error={globalError}
        onBack={() => navigate("/test/my")}
        backText="Повернутись до моїх тестів"
      />
    );
  }

  if (loading) return <Loader fullScreen text="Завантажуємо вміст тесту..." />;
  return (
    <form className={styles.pageContainer} onSubmit={handleSubmit}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Редагування тесту</h1>
          <p>
            Змінюйте параметри тесту, оновлюйте питання або керуйте
            налаштуваннями конфіденційності
          </p>
        </div>
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={isSubmitting}
        >
          <Save size={18} />
          <span>{isSubmitting ? "Збереження..." : "Зберегти зміни"}</span>
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

export default EditTestPage;
