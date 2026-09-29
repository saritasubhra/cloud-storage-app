import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Lock, Link2, Trash2 } from "lucide-react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";
import TextField from "./TextField.jsx";
import Loader from "./Loader.jsx";
import {
  createShareRequest,
  listSharesRequest,
  revokeShareRequest,
} from "../api/shareApi.js";
import { formatDate } from "../utils/formatDate.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const buildShareLink = (token) => `${window.location.origin}/share/${token}`;

function ShareModal({ file, onClose }) {
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(true);

  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [expiryOption, setExpiryOption] = useState("never");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchShares = async () => {
    setLoadingShares(true);
    try {
      const res = await listSharesRequest(file._id);
      setShares(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't load existing links."));
    } finally {
      setLoadingShares(false);
    }
  };

  useEffect(() => {
    fetchShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = async (token) => {
    try {
      await navigator.clipboard.writeText(buildShareLink(token));
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await revokeShareRequest(shareId);
      setShares((prev) => prev.filter((s) => s._id !== shareId));
      toast.success("Link revoked");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't revoke the link."));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordEnabled && !password.trim()) {
      setError("Enter a password, or turn password protection off");
      return;
    }

    setCreating(true);
    try {
      const payload = { fileId: file._id };
      if (passwordEnabled) payload.password = password.trim();
      if (expiryOption !== "never") payload.expiresInDays = Number(expiryOption);

      const res = await createShareRequest(payload);
      await navigator.clipboard.writeText(buildShareLink(res.data.data.token)).catch(() => {});
      toast.success("Link created and copied to clipboard");

      setPassword("");
      setPasswordEnabled(false);
      setExpiryOption("never");
      fetchShares();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't create the link."));
    } finally {
      setCreating(false);
    }
  };

  const describeExpiry = (share) => {
    if (share.isExpired) return "Expired";
    if (!share.expiresAt) return "Never expires";
    return `Expires ${formatDate(share.expiresAt)}`;
  };

  return (
    <Modal title={`Share "${file.name}"`} onClose={onClose}>
      {loadingShares ? (
        <div className="py-6">
          <Loader label="Loading links…" />
        </div>
      ) : shares.length > 0 ? (
        <div className="mb-6 space-y-2">
          {shares.map((share) => (
            <div
              key={share._id}
              className="flex items-center gap-3 rounded-sm border border-moss-light px-3 py-2.5"
            >
              {share.hasPassword ? (
                <Lock size={15} className="shrink-0 text-moss" strokeWidth={1.75} />
              ) : (
                <Link2 size={15} className="shrink-0 text-moss" strokeWidth={1.75} />
              )}
              <span
                className={`flex-1 text-sm ${share.isExpired ? "text-rust" : "text-ink-soft"}`}
              >
                {describeExpiry(share)}
              </span>
              <button
                type="button"
                onClick={() => copyLink(share.token)}
                aria-label="Copy link"
                title="Copy link"
                className="rounded-sm p-1.5 text-ink-soft hover:bg-paper-alt hover:text-ochre-dark"
              >
                <Copy size={15} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleRevoke(share._id)}
                aria-label="Revoke link"
                title="Revoke link"
                className="rounded-sm p-1.5 text-ink-soft hover:bg-rust-light hover:text-rust"
              >
                <Trash2 size={15} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-6 text-sm text-ink-soft">No active links yet for this file.</p>
      )}

      <form onSubmit={handleCreate} className="space-y-4 border-t border-moss-light pt-5">
        <div className="flex items-center justify-between">
          <label htmlFor="password-toggle" className="text-sm font-medium text-ink">
            Protect with a password
          </label>
          <input
            id="password-toggle"
            type="checkbox"
            checked={passwordEnabled}
            onChange={(e) => setPasswordEnabled(e.target.checked)}
            className="h-4 w-4 accent-ochre"
          />
        </div>

        {passwordEnabled && (
          <TextField
            id="share-password"
            name="password"
            type="text"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        )}

        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-ink">
            Link expires
          </label>
          <select
            id="expiry"
            value={expiryOption}
            onChange={(e) => setExpiryOption(e.target.value)}
            className="mt-1.5 w-full border-b border-moss-light bg-transparent py-1.5 text-ink outline-none focus:border-ochre"
          >
            <option value="never">Never</option>
            <option value="1">In 1 day</option>
            <option value="7">In 7 days</option>
            <option value="30">In 30 days</option>
          </select>
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" loading={creating}>
            Create link
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ShareModal;
