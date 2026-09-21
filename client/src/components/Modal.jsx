import { useEffect } from "react";
import { X } from "lucide-react";

function Modal({ title, onClose, children }) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-sm border border-moss-light bg-paper px-6 py-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-medium text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm p-1 text-ink-soft hover:bg-paper-alt hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
