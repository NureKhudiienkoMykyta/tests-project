import { Link } from "react-router";
import styles from "./Logo.module.css";
import { useAuthStore } from "../../../stores/useAuthStore";

function Logo() {
  const user = useAuthStore((state) => state.user);

  const logoRedirectPath = user ? "/dashboard" : "/";
  return (
    <Link to={logoRedirectPath} className={styles.logoLink}>
      <span className={styles.quiz}>Quiz</span>
      <span className={styles.bee}>Bee</span>
      <span className={styles.dot}>.</span>
    </Link>
  );
}

export default Logo;
