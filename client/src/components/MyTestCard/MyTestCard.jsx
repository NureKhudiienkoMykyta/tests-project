import {
  BookOpen,
  Calendar,
  HelpCircle,
  Pencil,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import styles from "./MyTestCard.module.css";
import { useNavigate } from "react-router";

function MyTestCard({ test, onDeleteClick }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <div className={styles.card}>
      <div className={styles.leftContent}>
        <div className={styles.badgerow}>
          {test.category && (
            <span className={styles.categoryBadge}>
              <BookOpen size={12} /> {test.category}
            </span>
          )}
          <span
            className={`${styles.accessBadge} ${test.accessMode === "PUBLIC" ? styles.public : styles.private}`}
          >
            {test.accessMode === "PUBLIC" ? (
              <Globe size={12} />
            ) : (
              <Lock size={12} />
            )}
            {test.accessMode}
          </span>
        </div>

        <h3 className={styles.title}>{test.title}</h3>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <HelpCircle size={14} />
            <span>
              Питань: <strong>{test.questionsCount}</strong>
            </span>
          </div>
          <div className={styles.metaItem}>
            <Calendar size={14} />
            <span>Створено: {formatDate(test.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className={styles.rightContent}>
        <button
          className={styles.editBtn}
          onClick={() => navigate(`/test/edit/${test.id}`)}
        >
          <Pencil size={15} /> Редагувати
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDeleteClick(test.id, test.title)}
        >
          <Trash2 size={15} /> Видалити
        </button>
      </div>
    </div>
  );
}

export default MyTestCard;
