/**
 * Cloudinary treats images, videos/audio, and everything else
 * ("raw" - PDFs, docs, zips, etc.) differently for storage and delivery.
 * This must be stored on the File doc and reused at download/delete time.
 */
export const getCloudinaryResourceType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) return "video";
  return "raw";
};
