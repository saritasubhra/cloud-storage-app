import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Loader from "./Loader.jsx";

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader fullScreen label="Checking your session…" />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
