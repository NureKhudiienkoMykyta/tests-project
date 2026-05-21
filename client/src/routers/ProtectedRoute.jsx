import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { Loader } from "../components/ui/Loader/Loader";

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen={true} text="Перевірка доступу..." />;
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

export default ProtectedRoute;
