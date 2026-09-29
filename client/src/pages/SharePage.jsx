import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import TextField from "../components/TextField.jsx";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import {
  resolvePublicShareRequest,
  verifyPublicSharePasswordRequest,
} from "../api/shareApi.js";
import { getFileIcon } from "../utils/getFileIcon.js";
import { formatBytes } from "../utils/formatBytes.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

function SharePage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null); // { file, requiresPassword, downloadUrl }
  const [loadError, setLoadError] = useState(""); // "not-found" | "expired" | generic message

  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [unlockedDownloadUrl, setUnlockedDownloadUrl] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await resolvePublicShareRequest(token);
        setShareData(res.data.data);
      } catch (error) {
        if (error?.response?.status === 404) setLoadError("not-found");
        else if (error?.response?.status === 410) setLoadError("expired");
        else setLoadError(getErrorMessage(error, "Something went wrong loading this link."));
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setVerifying(true);
    try {
      const res = await verifyPublicSharePasswordRequest(token, password);
      setUnlockedDownloadUrl(res.data.data.downloadUrl);
    } catch (error) {
      if (error?.response?.status === 410) setLoadError("expired");
      else setPasswordError(getErrorMessage(error, "Incorrect password."));
    } finally {
      setVerifying(false);
    }
  };

  const Icon = useMemo(
    () => getFileIcon(shareData?.file?.mimeType),
    [shareData?.file?.mimeType]
  );

  if (loading) {
    return <Loader fullScreen label="Loading link…" />;
  }

  if (loadError === "not-found") {
    return (
      <AuthLayout title="Link not found" subtitle="This link is invalid or has been removed.">
        <Button as="a" href="/" variant="outline">
          Go to Depot
        </Button>
      </AuthLayout>
    );
  }

  if (loadError === "expired") {
    return (
      <AuthLayout title="Link expired" subtitle="This link is no longer available.">
        <Button as="a" href="/" variant="outline">
          Go to Depot
        </Button>
      </AuthLayout>
    );
  }

  if (loadError) {
    return <AuthLayout title="Something went wrong" subtitle={loadError} />;
  }

  const downloadUrl = shareData.downloadUrl || unlockedDownloadUrl;

  if (!downloadUrl) {
    // requiresPassword and not yet unlocked
    return (
      <AuthLayout
        title="Password required"
        subtitle={`"${shareData.file.name}" is protected with a password.`}
      >
        <form onSubmit={handleUnlock} className="space-y-5" noValidate>
          <TextField
            id="share-password"
            name="password"
            type="password"
            label="Password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            error={passwordError}
          />
          <Button type="submit" loading={verifying}>
            Unlock
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Ready to download">
      <div className="flex items-center gap-3 rounded-sm border border-moss-light bg-white/40 px-4 py-3">
        <Icon className="shrink-0 text-ink-soft" size={22} strokeWidth={1.75} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{shareData.file.name}</p>
          <p className="text-xs text-ink-soft">{formatBytes(shareData.file.size)}</p>
        </div>
      </div>

      <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="mt-5 block">
        <Button type="button">
          <Download size={16} />
          Download file
        </Button>
      </a>
    </AuthLayout>
  );
}

export default SharePage;
