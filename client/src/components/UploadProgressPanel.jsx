import { CheckCircle2, X, AlertCircle, Copy } from "lucide-react";

function UploadProgressPanel({ uploads, onDismiss, onKeepDuplicate }) {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 space-y-2">
      {uploads.map((upload) => (
        <div
          key={upload.id}
          className="rounded-sm border border-moss-light bg-paper px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
              {upload.status === "success" && (
                <CheckCircle2 size={16} className="shrink-0 text-moss" />
              )}
              {upload.status === "error" && (
                <AlertCircle size={16} className="shrink-0 text-rust" />
              )}
              {upload.status === "duplicate" && (
                <Copy size={16} className="shrink-0 text-ochre-dark" />
              )}
              <span className="truncate">{upload.fileName}</span>
            </span>
            <button
              type="button"
              onClick={() => onDismiss(upload.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-sm p-0.5 text-ink-soft hover:bg-paper-alt"
            >
              <X size={14} />
            </button>
          </div>

          {upload.status === "uploading" && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-alt">
              <div
                className="h-full rounded-full bg-ochre transition-[width]"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          )}

          {upload.status === "error" && (
            <p className="mt-1 text-xs text-rust">{upload.error}</p>
          )}

          {upload.status === "duplicate" && (
            <div className="mt-2">
              <p className="text-xs text-ink-soft">
                You already have this as "{upload.duplicateInfo.name}" in "
                {upload.duplicateInfo.location}"
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onDismiss(upload.id)}
                  className="flex-1 rounded-sm border border-moss-light px-2 py-1 text-xs font-medium text-ink hover:bg-paper-alt"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onKeepDuplicate(upload)}
                  className="flex-1 rounded-sm bg-ochre px-2 py-1 text-xs font-medium text-paper hover:bg-ochre-dark"
                >
                  Upload anyway
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default UploadProgressPanel;
