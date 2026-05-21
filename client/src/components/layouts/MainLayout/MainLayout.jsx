import { Outlet } from "react-router";
import Footer from "../../Footer/Footer";
import Header from "../../Header/Header";
import styles from "./MainLayout.module.css";
function MainLayout() {
  return (
    <div className={styles.layoutWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
