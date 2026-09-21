import { useState } from "react";
import { toast } from "sonner";
import Modal from "./Modal.jsx";
import TextField from "./TextField.jsx";
import Button from "./Button.jsx";
import { createDirectoryRequest } from "../api/directoryApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

function CreateFolderModal({ parentId, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the folder a name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createDirectoryRequest({ name: trimmed, parent: parentId });
      toast.success(`Created "${trimmed}"`);
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't create the folder."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New folder" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          id="folder-name"
          name="name"
          label="Folder name"
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
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateFolderModal;
