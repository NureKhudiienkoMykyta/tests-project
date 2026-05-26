import { Plus, Trash2 } from "lucide-react";
import Input from "../../ui/Input/Input";
import styles from "./QuestionAnswersBlock.module.css";

function QuestionAnswersBlock({ question, qIdx, questions, setQuestions }) {
  const handleAnswerFieldChange = (aIdx, field, value) => {
    const updated = [...questions];
    const currentQuestion = updated[qIdx];

    if (field === "is_correct") {
      // Для SINGLE_CHOICE або TRUE_FALSE тільки один варіант може бути істинним
      if (
        currentQuestion.type === "SINGLE_CHOICE" ||
        currentQuestion.type === "TRUE_FALSE"
      ) {
        currentQuestion.answers.forEach((ans, idx) => {
          ans.is_correct = idx === aIdx;
        });
      } else {
        // Для MULTIPLE_CHOICE дозволяємо обирати незалежно
        currentQuestion.answers[aIdx].is_correct = value;
      }
    } else {
      currentQuestion.answers[aIdx][field] = value;
    }
    setQuestions(updated);
  };

  const handleAddAnswerOption = () => {
    const updated = [...questions];
    updated[qIdx].answers.push({ content: "", is_correct: false });
    setQuestions(updated);
  };

  const handleRemoveAnswerOption = (aIdx) => {
    const updated = [...questions];
    updated[qIdx].answers = updated[qIdx].answers.filter(
      (_, idx) => idx !== aIdx,
    );
    setQuestions(updated);
  };

  const handleDirectCorrectAnswerChange = (val) => {
    const updated = [...questions];
    updated[qIdx].correct_answer = val;
    setQuestions(updated);
  };

  const isMultiple = question.type === "MULTIPLE_CHOICE";
  const isTextual = ["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(
    question.type,
  );

  // 1. Рендеринг для текстових/числових питань
  if (isTextual) {
    return (
      <div className={styles.textualAnswerBlock}>
        <label className={styles.subBlockLabel}>
          {question.type === "NUMBER"
            ? "Правильна числова відповідь *"
            : "Еталонна правильна відповідь *"}
        </label>
        <Input
          type={question.type === "NUMBER" ? "number" : "text"}
          placeholder={
            question.type === "LONG_TEXT"
              ? "Введіть точну відповідь..."
              : "Введіть точну відповідь..."
          }
          value={question.correct_answer || ""}
          onChange={(e) => handleDirectCorrectAnswerChange(e.target.value)}
          required
        />
      </div>
    );
  }

  // 2. Рендеринг для питань з вибором варіантів (SINGLE, MULTIPLE, TRUE_FALSE)
  return (
    <div className={styles.optionsBlock}>
      <label className={styles.subBlockLabel}>
        Варіанти відповідей (Позначте правильні)
      </label>

      <div className={styles.answersList}>
        {question.answers.map((answer, aIdx) => (
          <div key={aIdx} className={styles.answerOptionRow}>
            <input
              type={isMultiple ? "checkbox" : "radio"}
              name={`correct-choice-${qIdx}`}
              checked={answer.is_correct || false}
              onChange={(e) =>
                handleAnswerFieldChange(aIdx, "is_correct", e.target.checked)
              }
              className={styles.selectionControl}
            />

            <div className={styles.flexInput}>
              <Input
                type="text"
                placeholder={`Варіант відповіді №${aIdx + 1}`}
                value={answer.content}
                disabled={question.type === "TRUE_FALSE"} // У True/False контент зафіксовано ("Правильно"/"Неправильно")
                onChange={(e) =>
                  handleAnswerFieldChange(aIdx, "content", e.target.value)
                }
                required
              />
            </div>

            {question.type !== "TRUE_FALSE" && question.answers.length > 2 && (
              <button
                type="button"
                className={styles.deleteAnswerOptionBtn}
                onClick={() => handleRemoveAnswerOption(aIdx)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {question.type !== "TRUE_FALSE" && (
        <button
          type="button"
          className={styles.addAnswerOptionBtn}
          onClick={handleAddAnswerOption}
        >
          <Plus size={14} /> Додати варіант відповіді
        </button>
      )}
    </div>
  );
}

export default QuestionAnswersBlock;
