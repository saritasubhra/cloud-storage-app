import { useState } from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

function ConfirmDialog({ title, message, confirmLabel = "Confirm", onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-ink-soft">{message}</p>
      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="danger" loading={submitting} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
