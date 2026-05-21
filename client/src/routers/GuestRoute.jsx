import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { Loader } from "../components/ui/Loader/Loader";

function GuestRoute() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <Loader fullScreen={true} text="Завантаження..." />;
  }

  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default GuestRoute;
