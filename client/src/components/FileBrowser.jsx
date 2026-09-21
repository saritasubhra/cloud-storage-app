import Breadcrumbs from "./Breadcrumbs.jsx";
import DirectoryRow from "./DirectoryRow.jsx";
import FileRow from "./FileRow.jsx";
import EmptyFolder from "./EmptyFolder.jsx";
import Loader from "./Loader.jsx";
import { useFileBrowser } from "../hooks/useFileBrowser.js";

function FileBrowser() {
  const { path, directories, files, loading, openFolder, goToCrumb } = useFileBrowser();

  const isEmpty = !loading && directories.length === 0 && files.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Breadcrumbs path={path} onNavigate={goToCrumb} />

      <div className="mt-6 rounded-sm border border-moss-light">
        {/* Column header - widths must match DirectoryRow/FileRow exactly */}
        <div className="flex items-center gap-4 border-b border-moss-light bg-paper-alt px-2 py-2 text-xs font-medium text-ink-soft">
          <span className="flex-1">Name</span>
          <span className="hidden w-20 shrink-0 sm:block">Size</span>
          <span className="w-24 shrink-0">Modified</span>
          <span className="w-8 shrink-0" aria-hidden="true" />
        </div>

        {loading ? (
          <div className="py-16">
            <Loader label="Loading folder…" />
          </div>
        ) : isEmpty ? (
          <EmptyFolder />
        ) : (
          <div>
            {directories.map((directory) => (
              <DirectoryRow key={directory._id} directory={directory} onOpen={openFolder} />
            ))}
            {files.map((file) => (
              <FileRow key={file._id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileBrowser;
