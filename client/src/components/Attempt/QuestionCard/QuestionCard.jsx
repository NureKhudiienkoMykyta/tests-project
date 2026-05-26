import { Award } from "lucide-react";
import styles from "./QuestionCard.module.css";

function QuestionCard({ question, selectedAnswer, onAnswerChange }) {
  if (!question) return null;

  const { type, content, points, answers } = question;

  // SINGLE_CHOICE / TRUE_FALSE
  const handleRadioChange = (ansId) => {
    onAnswerChange({ selectedAnswerIds: [ansId], textAnswer: null });
  };

  // MULTIPLE_CHOICE
  const handleCheckboxChange = (ansId) => {
    const currentIds = selectedAnswer?.selectedAnswerIds || [];
    const updatedIds = currentIds.includes(ansId)
      ? currentIds.filter((id) => id !== ansId)
      : [...currentIds, ansId];

    onAnswerChange({ selectedAnswerIds: updatedIds, textAnswer: null });
  };

  // тексту та чисел
  const handleTextChange = (value) => {
    onAnswerChange({ selectedAnswerIds: null, textAnswer: value });
  };
  return (
    <div className={styles.questionCard}>
      <div className={styles.pointsBadge}>
        <Award size={16} />
        <span>
          {points} {points === 1 ? "бал" : points < 5 ? "бали" : "балів"}
        </span>
      </div>

      <h2 className={styles.questionText}>{content}</h2>

      <div className={styles.answersContainer}>
        {/* SINGLE_CHOICE / TRUE_FALSE */}
        {(type === "SINGLE_CHOICE" || type === "TRUE_FALSE") && (
          <div className={styles.optionsList}>
            {answers.map((ans, idx) => {
              const isChecked =
                selectedAnswer?.selectedAnswerIds?.includes(ans.id) || false;
              return (
                <label
                  key={ans.id}
                  className={`${styles.optionRow} ${isChecked ? styles.selectedRow : ""}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={isChecked}
                    onChange={() => handleRadioChange(ans.id)}
                    className={styles.hiddenInput}
                  />
                  <div
                    className={`${styles.customControl} ${styles.radioControl}`}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </div>
                  <span className={styles.optionContent}>{ans.content}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* MULTIPLE_CHOICE */}
        {type === "MULTIPLE_CHOICE" && (
          <div className={styles.optionsList}>
            {answers.map((ans, idx) => {
              const isChecked =
                selectedAnswer?.selectedAnswerIds?.includes(ans.id) || false;
              return (
                <label
                  key={ans.id}
                  className={`${styles.optionRow} ${isChecked ? styles.selectedRow : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(ans.id)}
                    className={styles.hiddenInput}
                  />
                  <div
                    className={`${styles.customControl} ${styles.checkboxControl}`}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </div>
                  <span className={styles.optionContent}>{ans.content}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* SHORT_TEXT  NUMBER*/}
        {(type === "SHORT_TEXT" || type === "NUMBER") && (
          <input
            type={type === "NUMBER" ? "number" : "text"}
            className={styles.textInput}
            value={selectedAnswer?.textAnswer || ""}
            placeholder={
              type === "NUMBER"
                ? "Введіть числове значення..."
                : "Введіть коротку відповідь..."
            }
            onChange={(e) => handleTextChange(e.target.value)}
          />
        )}

        {/* LONG_TEXT ТЕКСТ */}
        {type === "LONG_TEXT" && (
          <textarea
            className={styles.textarea}
            value={selectedAnswer?.textAnswer || ""}
            placeholder="Напишіть відповідь на питання..."
            rows={6}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
