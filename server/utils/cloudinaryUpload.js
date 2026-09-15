import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a file buffer (from multer's memory storage) to Cloudinary.
 *
 * @param {Buffer} buffer - the raw file data
 * @param {Object} options
 * @param {string} options.folder - Cloudinary folder to store the file in (e.g. userId)
 * @param {string} options.filename - original filename, used as public_id hint
 * @param {"image"|"video"|"raw"|"auto"} options.resourceType - Cloudinary resource type.
 *   Use "image" for images, "video" for video/audio, "raw" for everything else
 *   (PDFs, docs, zips, etc.) so they're stored/served correctly.
 * @returns {Promise<Object>} Cloudinary's upload result (secure_url, public_id, bytes, etc.)
 */
export const uploadToCloudinary = (buffer, { folder, filename, resourceType = "auto" }) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        // Keep the original name recognizable in the Cloudinary dashboard,
        // while letting Cloudinary append a random suffix to avoid collisions.
        public_id: filename.replace(/\.[^/.]+$/, ""), // strip extension
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes a previously uploaded file from Cloudinary.
 *
 * @param {string} publicId - the Cloudinary public_id stored on the File document
 * @param {"image"|"video"|"raw"} resourceType - must match the type used at upload time
 */
export const deleteFromCloudinary = (publicId, resourceType = "image") => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
