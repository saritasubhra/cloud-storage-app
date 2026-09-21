import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

// The backend redirects here (CLIENT_URL + "/auth/success") once it has
// set the JWT cookie via Google OAuth. We just need to pick up the new
// session and send the person on to their dashboard.
function GoogleAuthSuccessPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await refreshUser();
      toast.success("Signed in with Google");
      navigate("/dashboard", { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loader fullScreen label="Finishing sign-in…" />;
}

export default GoogleAuthSuccessPage;
