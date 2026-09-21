import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Button from "../components/Button.jsx";
import FileBrowser from "../components/FileBrowser.jsx";
import { useAuth } from "../hooks/useAuth.js";

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-moss-light px-6 py-4">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-soft">{user?.email}</span>
          <Button variant="outline" className="w-auto" onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </Button>
        </div>
      </header>

      <FileBrowser />
    </div>
  );
}

export default DashboardPage;
