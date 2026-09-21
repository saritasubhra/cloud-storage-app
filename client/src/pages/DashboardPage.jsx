import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

// Placeholder - Step 3 replaces the content area with the real
// folder/file browser (directory listing, upload, etc).
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

      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-medium text-ink">
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-2 text-ink-soft">
          You're logged in. Your folders and files will show up here next.
        </p>
      </main>
    </div>
  );
}

export default DashboardPage;
