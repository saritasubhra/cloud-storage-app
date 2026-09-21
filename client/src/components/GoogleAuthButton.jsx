import { FcGoogle } from "react-icons/fc";
import { googleLoginUrl } from "../api/authApi.js";

function GoogleAuthButton({ label = "Continue with Google" }) {
  const handleClick = () => {
    // Full page redirect - Google's OAuth consent screen can't be
    // opened inside an XHR/fetch call.
    window.location.href = googleLoginUrl;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-sm border border-moss-light bg-white/60 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-alt"
    >
      <FcGoogle size={18} />
      {label}
    </button>
  );
}

export default GoogleAuthButton;
