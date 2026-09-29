import cloudinary from "../config/cloudinary.js";

/**
 * Builds a Cloudinary URL that forces a browser download (flags: attachment)
 * rather than displaying the file inline. Used by both the authenticated
 * download route and public share links, so the two never drift apart.
 */
export const getAttachmentUrl = (file) =>
  cloudinary.url(file.publicId, {
    resource_type: file.resourceType,
    secure: true,
    flags: "attachment",
  });
