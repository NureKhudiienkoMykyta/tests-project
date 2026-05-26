import { HelpCircle, Trash2 } from "lucide-react";
import Input from "../../ui/Input/Input";
import styles from "./QuestionsSection.module.css";
import QuestionAnswersBlock from "../QuestionAnswersBlock/QuestionAnswersBlock";

function QuestionsSection({ questions, setQuestions }) {
  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];

    if (field === "type") {
      updated[index].type = value;

      // Скидаємо/перебудовуємо структуру відповідей під новий тип
      if (value === "TRUE_FALSE") {
        updated[index].correct_answer = "";
        updated[index].answers = [
          { content: "Правильно", is_correct: true },
          { content: "Неправильно", is_correct: false },
        ];
      } else if (["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(value)) {
        updated[index].answers = [];
        updated[index].correct_answer = "";
      } else {
        // SINGLE_CHOICE або MULTIPLE_CHOICE
        updated[index].correct_answer = "";
        updated[index].answers = [
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ];
      }
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  return (
    <div className={styles.questionsContainer}>
      <div className={styles.sectionHeaderNoCard}>
        <HelpCircle size={22} className={styles.iconTitle} />
        <h2>Питання тесту ({questions.length})</h2>
      </div>

      {questions.map((question, qIdx) => (
        <div key={qIdx} className={styles.questionCard}>
          <div className={styles.questionCardHeader}>
            <span className={styles.questionNumber}>Питання №{qIdx + 1}</span>
            {questions.length > 1 && (
              <button
                type="button"
                className={styles.deleteQuestionBtn}
                onClick={() => handleRemoveQuestion(qIdx)}
              >
                <Trash2 size={16} /> Видалити питання
              </button>
            )}
          </div>

          <div className={styles.questionMainForm}>
            <div className={styles.contentInputWrapper}>
              <label className={styles.inputLabel}>Текст питання *</label>
              <Input
                type="text"
                placeholder="Введіть формулювання питання..."
                value={question.content}
                onChange={(e) =>
                  handleQuestionChange(qIdx, "content", e.target.value)
                }
                required
              />
            </div>

            <div className={styles.typeSelectorWrapper}>
              <label className={styles.inputLabel}>Тип питання</label>
              <select
                className={styles.select}
                value={question.type}
                onChange={(e) =>
                  handleQuestionChange(qIdx, "type", e.target.value)
                }
              >
                <option value="SINGLE_CHOICE">Один правильний вибір</option>
                <option value="MULTIPLE_CHOICE">
                  Кілька правильних відповідей
                </option>
                <option value="TRUE_FALSE">Правильно / Неправильно</option>
                <option value="SHORT_TEXT">Коротка текстова відповідь</option>
                <option value="LONG_TEXT">Розгорнута відповідь</option>
                <option value="NUMBER">Числова відповідь</option>
              </select>
            </div>

            <div className={styles.pointsWrapper}>
              <label className={styles.inputLabel}>Бали</label>
              <Input
                type="number"
                min="0"
                value={question.points}
                onChange={(e) =>
                  handleQuestionChange(qIdx, "points", e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Блок відповідей для поточного питання */}
          <div className={styles.answersSectionWrapper}>
            <QuestionAnswersBlock
              question={question}
              qIdx={qIdx}
              questions={questions}
              setQuestions={setQuestions}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuestionsSection;
