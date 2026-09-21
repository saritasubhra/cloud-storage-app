import {
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  File as FileGeneric,
} from "lucide-react";

// Returns the icon component (not JSX) so the caller controls
// size/color/className.
export function getFileIcon(mimeType = "") {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.includes("word")) return FileText;
  if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType === "text/csv") {
    return FileSpreadsheet;
  }
  if (mimeType.includes("zip")) return FileArchive;
  if (mimeType.startsWith("text/")) return FileText;

  return FileGeneric;
}
