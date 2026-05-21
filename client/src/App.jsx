import "./App.css";
import { Navigate, Route, Routes } from "react-router";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import { Loader } from "./components/ui/Loader/Loader";
import GuestRoute from "./routers/GuestRoute";
import ProtectedRoute from "./routers/ProtectedRoute";
import MainLayout from "./components/layouts/MainLayout/MainLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel/PaymentCancel";

function App() {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  if (isLoading) {
    return <Loader fullScreen={true} text="Вулик QuizBee готується..." />;
  }
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/tests/:id" /> {/* Це детальна сторінка тесту */}
        <Route path="/library" />
        {/* Це сторінка тестів з пошуком, фільтрацією і тд */}
        {/* МАРШРУТИ ТІЛЬКИ ДЛЯ ГОСТЕЙ */}
        <Route element={<GuestRoute />}>
          <Route path="/" element={<LandingPage />} />
          {/* Це головна сторінка, яка пояснює що це за проект, тут логотип, секції початку, інструкція проходження */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        {/* МАРШРУТИ ТІЛЬКИ ДЛЯ АВТОРИЩОВАНИХ КОРИСТУВАЧІВ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Це сторінка з останніми тестами, популярними тестами і тд */}
          <Route path="/profile" />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
