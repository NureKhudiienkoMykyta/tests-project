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
import Subscription from "./pages/Subscription/Subscription";
import LibraryTests from "./pages/LibraryTests/LibraryTests";
import TestPreview from "./pages/TestPreview/TestPreview";
import CreateTestPage from "./pages/CreateTestPage/CreateTestPage";
import AttempPage from "./pages/AttempPage/AttempPage";
import AttemptResultPage from "./pages/AttemptResultPage/AttemptResultPage";
import AttemptsHistoryPage from "./pages/AttemptsHistoryPage/AttemptsHistoryPage";
import MyTestsPage from "./pages/MyTestsPage/MyTestsPage";
import SubscriptionPage from "./pages/SubscriptionPage/SubscriptionPage";
import EditTestPage from "./pages/EditTestPage/EditTestPage";
import FaqPage from "./pages/FaqPage/FaqPage";

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
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/test/preview/:id" element={<TestPreview />} />
        <Route path="/library" element={<LibraryTests />} />
        <Route path="/faq" element={<FaqPage />} />

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
          <Route path="/test/create" element={<CreateTestPage />} />
          <Route path="/test/passing/:testId" element={<AttempPage />} />
          <Route
            path="/attempt/:attemptId/results"
            element={<AttemptResultPage />}
          />
          <Route path="/attempt/history" element={<AttemptsHistoryPage />} />
          <Route path="/test/my" element={<MyTestsPage />} />
          <Route path="/test/edit/:testId" element={<EditTestPage />} />
          <Route path="/subscription/my" element={<SubscriptionPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
