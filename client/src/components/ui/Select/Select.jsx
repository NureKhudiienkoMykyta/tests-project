import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

function Select({
  options = [],
  onSelect,
  placeholder = "Оберіть варіант...",
  label,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const containerRef = useRef(null);

  // Закриття при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Фільтрація опцій на клієнті
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOptionClick = (option) => {
    setSelectedName(option.name);
    setSearchTerm("");
    setIsOpen(false);
    onSelect(option.id);
  };

  return (
    <div className={styles.selectWrapper} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={`${styles.combobox} ${error ? styles.hasError : ""}`}>
        <input
          type="text"
          className={styles.input}
          placeholder={selectedName || placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`}
          size={18}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && (
        <ul className={styles.dropdown}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                className={styles.option}
                onClick={() => handleOptionClick(option)}
              >
                {option.name}
              </li>
            ))
          ) : (
            <li className={styles.noOptions}>Нічого не знайдено</li>
          )}
        </ul>
      )}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Select;
