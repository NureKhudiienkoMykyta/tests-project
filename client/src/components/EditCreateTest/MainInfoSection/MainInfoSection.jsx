import { Settings, Shield, Plus, Trash2 } from "lucide-react";
import styles from "../Sections.module.css";
import Input from "../../ui/Input/Input";
function MainInfoSection({
  categories = [],
  title,
  setTitle,
  description,
  setDescription,
  categoryId,
  setCategoryId,
  accessMode,
  setAccessMode,
  showResults,
  setShowResults,
  timeLimit,
  setTimeLimit,
  allowedDomains,
  setAllowedDomains,
  allowedEmails,
  setAllowedEmails,
}) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <Settings size={22} className={styles.iconTitle} />
        <h2>Основні параметри тесту</h2>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.fullWidth}>
          <label className={styles.inputLabel}>Назва тесту *</label>
          <Input
            type="text"
            placeholder="Наприклад: Основи асинхронного програмування в Node.js"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.fullWidth}>
          <label className={styles.inputLabel}>Опис тесту *</label>
          <textarea
            className={styles.textarea}
            placeholder="Опишіть, які теми покриває цей тест, для кого він призначений..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={styles.inputLabel}>Категорія *</label>
          <select
            className={styles.select}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Оберіть категорію...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.inputLabel}>Обмеження часу (сек)</label>
          <Input
            type="number"
            min="0"
            placeholder="Порожньо — без обмежень"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.sectionHeader}>
        <Shield size={20} className={styles.iconTitle} />
        <h3>Приватність та відображення результатів</h3>
      </div>

      <div className={styles.formGrid}>
        <div>
          <label className={styles.inputLabel}>Режим доступу</label>
          <select
            className={styles.select}
            value={accessMode}
            onChange={(e) => setAccessMode(e.target.value)}
          >
            <option value="PUBLIC">Публічний (Всі користувачі)</option>
            <option value="DOMAIN">
              За доменом (Корпоративна пошта університету)
            </option>
            <option value="EMAIL_LIST">
              За списком адрес (Приватний доступ)
            </option>
          </select>
        </div>

        <div>
          <label className={styles.inputLabel}>
            Показ результатів користувачу
          </label>
          <select
            className={styles.select}
            value={showResults}
            onChange={(e) => setShowResults(e.target.value)}
          >
            <option value="FULL">
              Повний звіт (Правильні/неправильні відповіді та бали)
            </option>
            <option value="ONLY_SCORE">
              Тільки фінальний бал (Без деталізації відповідей)
            </option>
          </select>
        </div>

        {/* ДИНАМІЧНІ ДОМЕНИ */}
        {accessMode === "DOMAIN" && (
          <div className={`${styles.fullWidth} ${styles.subListBlock}`}>
            <label className={styles.inputLabel}>
              Дозволені домени пошт (наприклад: nure.ua)
            </label>
            {allowedDomains.map((domain, index) => (
              <div key={index} className={styles.dynamicRow}>
                <Input
                  type="text"
                  placeholder="domain.ua"
                  value={domain}
                  onChange={(e) => {
                    const next = [...allowedDomains];
                    next[index] = e.target.value;
                    setAllowedDomains(next);
                  }}
                  required
                />
                {allowedDomains.length > 1 && (
                  <button
                    type="button"
                    className={styles.deleteRowBtn}
                    onClick={() =>
                      setAllowedDomains(
                        allowedDomains.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.addInlineBtn}
              onClick={() => setAllowedDomains([...allowedDomains, ""])}
            >
              <Plus size={14} /> Додати домен
            </button>
          </div>
        )}

        {/* ДИНАМІЧНІ EMAIL */}
        {accessMode === "EMAIL_LIST" && (
          <div className={`${styles.fullWidth} ${styles.subListBlock}`}>
            <label className={styles.inputLabel}>
              Список дозволених email-адрес
            </label>
            {allowedEmails.map((email, index) => (
              <div key={index} className={styles.dynamicRow}>
                <Input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => {
                    const next = [...allowedEmails];
                    next[index] = e.target.value;
                    setAllowedEmails(next);
                  }}
                  required
                />
                {allowedEmails.length > 1 && (
                  <button
                    type="button"
                    className={styles.deleteRowBtn}
                    onClick={() =>
                      setAllowedEmails(
                        allowedEmails.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.addInlineBtn}
              onClick={() => setAllowedEmails([...allowedEmails, ""])}
            >
              <Plus size={14} /> Додати пошту
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default MainInfoSection;
