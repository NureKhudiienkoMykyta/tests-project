import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { Link, useNavigate } from "react-router";
import { User, LogOut, Settings } from "lucide-react";
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
      </nav>

      {/*ПРАВА ЧАСТИНА*/}
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
            {/* Статус підписки */}
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
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Профіль
                  </Link>

                  <button
                    onClick={handleLogout}
                    className={`${styles.dropdownItem} styles.logoutItem`}
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
