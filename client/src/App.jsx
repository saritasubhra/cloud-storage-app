import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import GoogleAuthSuccessPage from "./pages/GoogleAuthSuccessPage.jsx";
import SharePage from "./pages/SharePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TrashPage from "./pages/TrashPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Only reachable when logged out */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Google OAuth redirects here regardless of prior auth state */}
      <Route path="/auth/success" element={<GoogleAuthSuccessPage />} />

      {/* Fully public - works whether or not the visitor is logged in */}
      <Route path="/share/:token" element={<SharePage />} />

      {/* Only reachable when logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trash" element={<TrashPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
