import { FolderOpen } from "lucide-react";

function EmptyFolder() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <FolderOpen className="text-moss" size={32} strokeWidth={1.5} />
      <div>
        <p className="font-medium text-ink">This folder is empty</p>
        <p className="mt-1 text-sm text-ink-soft">
          Files and folders you add here will show up in this list.
        </p>
      </div>
    </div>
  );
}

export default EmptyFolder;
