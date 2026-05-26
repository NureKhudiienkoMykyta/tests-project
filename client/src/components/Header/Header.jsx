import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { Link, useNavigate } from "react-router";
import { User, LogOut, CreditCard, FileText, History } from "lucide-react";
import styles from "./Header.module.css";
import Logo from "../ui/Logo/Logo";
function Header() {
  const user = useAuthStore((state) => state.user);
  const isPremium = useAuthStore((state) => state.isPremium());
  const logout = useAuthStore((state) => state.logout);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      {/*ЛІВА ЧАСТИНА*/}
      <Logo />
      {/*ЦЕНТРАЛЬНА ЧАСТИНА*/}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>
          Головна
        </Link>
        <Link to="/library" className={styles.navLink}>
          Бібліотека тестів
        </Link>
        {user && (
          <Link to="/test/create" className={styles.navLink}>
            Створити тест
          </Link>
        )}
      </nav>
      {/*ПРАВА ЧАСТИНА*/}{" "}
      <div className={styles.rightSection}>
        {!user ? (
          /* КОРИСТУВАЧ — ГІСТЬ */
          <>
            <Link to="/login" className={styles.loginBtn}>
              Вхід
            </Link>
            <Link to="/register" className={styles.registerBtn}>
              Реєстрація
            </Link>
          </>
        ) : (
          /* КОРИСТУВАЧ АВТОРИЗОВАНИЙ */
          <>
            {isPremium ? (
              <span className={styles.premiumBadge}>Premium</span>
            ) : (
              <Link to="/subscription" className={styles.buySubscriptionLink}>
                Оформити підписку
              </Link>
            )}

            {/* Іконка профілю та випадаюче меню */}
            <div className={styles.userMenuContainer} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Меню користувача"
              >
                <User size={26} />
              </button>

              {/* Дропдаун */}
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.userEmailInfo}>
                    <span>{user.email}</span>
                  </div>

                  <div className={styles.divider} />

                  <Link
                    to="/test/my"
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FileText size={16} />
                    Мої тести
                  </Link>

                  <Link
                    to="/attempt/history"
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <History size={16} />
                    Історія спроб
                  </Link>

                  <Link
                    to="/subscription/my"
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <CreditCard size={16} />
                    Підписка
                  </Link>

                  <div className={styles.divider} />

                  <button
                    onClick={handleLogout}
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  >
                    <LogOut size={16} />
                    Вийти
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
