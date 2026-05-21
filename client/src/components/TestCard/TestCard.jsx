import { useNavigate } from "react-router";
import {
  BookOpen,
  Globe,
  Lock,
  Mail,
  ShieldAlert,
  GraduationCap,
  HelpCircle,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";
import styles from "./TestCard.module.css";

function TestCard({ test }) {
  const navigate = useNavigate();
  const {
    id,
    title,
    description,
    timeLimitSeconds,
    accessMode,
    category,
    university,
    author,
    questionsCount,
  } = test;

  const timeLimitMinutes = timeLimitSeconds
    ? Math.ceil(timeLimitSeconds / 60)
    : null;

  const accessConfig = {
    PUBLIC: { label: "Публічний", icon: Globe, class: "public" },
    EMAIL_LIST: { label: "За поштою", icon: Mail, class: "email" },
    DOMAIN: { label: "За доменом", icon: ShieldAlert, class: "domain" },
  };

  const currentAccess = accessConfig[accessMode] || {
    label: accessMode,
    icon: Lock,
    class: "private",
  };
  const AccessIcon = currentAccess.icon;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.badge} ${styles.categoryBadge}`}>
          <BookOpen size={14} />
          {category}
        </span>
        <span
          className={`${styles.badge} ${styles.accessBadge} ${styles[currentAccess.class]}`}
        >
          <AccessIcon size={14} />
          {currentAccess.label}
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>
        <p className={styles.description}>{description}</p>
      </div>

      {university && (
        <div className={styles.universityBlock}>
          <GraduationCap size={16} className={styles.icon} />
          <span className={styles.universityText}>{university}</span>
        </div>
      )}

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <HelpCircle size={16} className={styles.icon} />
          <span>{questionsCount} питань</span>
        </div>
        <div className={styles.metaItem}>
          <Clock size={16} className={styles.icon} />
          <span>
            {timeLimitMinutes ? `${timeLimitMinutes} хв.` : "Без обмежень"}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.authorBlock}>
          <User size={16} className={styles.authorIcon} />
          <span className={styles.author}>
            Автор:{" "}
            <strong>
              {author?.first_name} {author?.last_name}
            </strong>
          </span>
        </div>
        <button
          className={styles.startBtn}
          onClick={() => navigate(`/test/preview/${id}`)}
        >
          <span>Переглянути</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default TestCard;
