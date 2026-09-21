import { useState } from "react";
import { toast } from "sonner";
import Modal from "./Modal.jsx";
import TextField from "./TextField.jsx";
import Button from "./Button.jsx";
import { updateDirectoryRequest } from "../api/directoryApi.js";
import { updateFileRequest } from "../api/fileApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

function RenameModal({ item, itemType, onClose, onRenamed }) {
  const [name, setName] = useState(item.name);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const label = itemType === "directory" ? "folder" : "file";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError(`Give the ${label} a name`);
      return;
    }
    if (trimmed === item.name) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const request = itemType === "directory" ? updateDirectoryRequest : updateFileRequest;
      const res = await request(item._id, { name: trimmed });
      toast.success(`Renamed to "${trimmed}"`);
      onRenamed(res.data.data);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, `Couldn't rename the ${label}.`));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Rename ${label}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          id="rename-input"
          name="name"
          label="Name"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          error={error}
        />
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RenameModal;
