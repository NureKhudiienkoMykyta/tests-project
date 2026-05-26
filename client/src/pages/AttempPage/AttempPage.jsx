import { useEffect, useState } from "react";
import { useAttemptStore } from "../../stores/useAttemptStore";
import { useNavigate, useParams } from "react-router";
import { Loader } from "../../components/ui/Loader/Loader";
import styles from "./AttempPage.module.css";
import { ArrowRight, CheckCircle } from "lucide-react";
import TestHeader from "../../components/Attempt/TestHeader/TestHeader";
import QuestionCard from "../../components/Attempt/QuestionCard/QuestionCard";
function AttempPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const {
    questions,
    testResult,
    loading,
    error,
    initializeAttempt,
    triggerCurrentQuestionCancellation,
    submitCurrentAnswer,
    resetStore,
  } = useAttemptStore();

  const [currentAnswer, setCurrentAnswer] = useState({
    selectedAnswerIds: null,
    textAnswer: null,
  });

  useEffect(() => {
    if (testId) {
      initializeAttempt(testId);
    }
    return () => resetStore();
  }, [testId, initializeAttempt, resetStore]);

  useEffect(() => {
    if (testResult) {
      console.log("====================================");
      console.log(testResult);
      console.log("====================================");
      navigate(`/attempt/${testResult.data.attempt_id}/results`, {
        state: { result: testResult },
      });
    }
  }, [testResult, testId, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCtrl && ["c", "v", "x", "u", "s"].includes(key)) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    const preventClipboard = (e) => e.preventDefault();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerCurrentQuestionCancellation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", preventClipboard);
    document.addEventListener("cut", preventClipboard);
    document.addEventListener("paste", preventClipboard);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", preventClipboard);
      document.removeEventListener("cut", preventClipboard);
      document.removeEventListener("paste", preventClipboard);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [triggerCurrentQuestionCancellation]);

  const isAnswerEmpty = () => {
    const hasRadioOrCheck =
      currentAnswer.selectedAnswerIds &&
      currentAnswer.selectedAnswerIds.length > 0;
    const hasText =
      currentAnswer.textAnswer && currentAnswer.textAnswer.trim() !== "";
    return !hasRadioOrCheck && !hasText;
  };

  const handleNextClick = async () => {
    if (isAnswerEmpty()) return;
    try {
      await submitCurrentAnswer(currentAnswer);

      setCurrentAnswer({ selectedAnswerIds: null, textAnswer: null });
    } catch (err) {
      console.error("Помилка відправки:", err);
    }
  };

  if (loading) {
    return <Loader text="Завантаження тесту..." />;
  }

  if (error && questions.length === 0) {
    return (
      <div className={styles.centered}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className={styles.centered}>Підрахунок вашого меду...</div>;
  }

  const activeQuestion = questions[0];
  const isLastQuestion = questions.length === 1;

  return (
    <div
      className={styles.pageContainer}
      onContextMenu={(e) => e.preventDefault()}
    >
      <TestHeader testTitle={testResult?.test_title} />

      <main className={styles.mainContent}>
        <QuestionCard
          key={activeQuestion.id}
          question={activeQuestion}
          selectedAnswer={currentAnswer}
          onAnswerChange={setCurrentAnswer}
        />
      </main>

      <footer className={styles.footer}>
        {error && <span className={styles.serverError}>{error}</span>}
        <div className={styles.footerRight}>
          <button
            type="button"
            className={styles.nextBtn}
            onClick={handleNextClick}
            disabled={isAnswerEmpty() || loading}
          >
            <span>
              {isLastQuestion ? "Завершити тест" : "Наступне питання"}
            </span>
            {isLastQuestion ? (
              <CheckCircle size={18} />
            ) : (
              <ArrowRight size={18} />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default AttempPage;
