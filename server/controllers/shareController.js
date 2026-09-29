import File from "../models/File.js";
import Share from "../models/Share.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getAttachmentUrl } from "../utils/getAttachmentUrl.js";

const MAX_EXPIRY_DAYS = 365;

// @route  POST /shares  (protected)
// @body   { fileId, password?, expiresInDays? }
// expiresInDays omitted/null => link never expires.
export const createShare = asyncHandler(async (req, res) => {
  const { fileId, password, expiresInDays } = req.body;

  const file = await File.findOne({ _id: fileId, owner: req.user._id });
  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  let expiresAt = null;
  if (expiresInDays !== undefined && expiresInDays !== null) {
    const days = Number(expiresInDays);
    if (!Number.isFinite(days) || days <= 0 || days > MAX_EXPIRY_DAYS) {
      return res.status(400).json({
        success: false,
        message: `expiresInDays must be a number between 1 and ${MAX_EXPIRY_DAYS}`,
      });
    }
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  // Mongoose validation runs on save(); create() covers it here too.
  const share = await Share.create({
    file: file._id,
    owner: req.user._id,
    password: password || undefined, // hashed by the pre-save hook if present
    expiresAt,
  });

  res.status(201).json({
    success: true,
    message: "Share link created",
    data: {
      token: share.token,
      expiresAt: share.expiresAt,
      hasPassword: !!password,
      fileId: file._id,
      createdAt: share.createdAt,
    },
  });
});

// @route  GET /shares?file=<fileId>  (protected)
// Lists this user's active share links for one file.
export const listShares = asyncHandler(async (req, res) => {
  const { file } = req.query;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "A 'file' query parameter is required",
    });
  }

  const shares = await Share.find({ file, owner: req.user._id })
    .select("+password")
    .sort({ createdAt: -1 });

  const data = shares.map((share) => ({
    _id: share._id,
    token: share.token,
    expiresAt: share.expiresAt,
    hasPassword: !!share.password,
    isExpired: share.isExpired(),
    createdAt: share.createdAt,
  }));

  res.status(200).json({ success: true, data });
});

// @route  DELETE /shares/:id  (protected)
export const revokeShare = asyncHandler(async (req, res) => {
  const share = await Share.findOne({ _id: req.params.id, owner: req.user._id });

  if (!share) {
    return res.status(404).json({
      success: false,
      message: "Share link not found",
    });
  }

  await share.deleteOne();

  res.status(200).json({
    success: true,
    message: "Share link revoked",
  });
});

// @route  GET /shares/public/:token  (public, no auth)
// Returns file info. Only includes a download URL when no password is
// required - otherwise the frontend must collect a password first and
// call the verify endpoint below.
export const resolvePublicShare = asyncHandler(async (req, res) => {
  const share = await Share.findOne({ token: req.params.token })
    .select("+password")
    .populate("file");

  if (!share || !share.file) {
    return res.status(404).json({
      success: false,
      message: "This link is invalid or has been removed",
    });
  }

  if (share.isExpired()) {
    return res.status(410).json({
      success: false,
      message: "This link has expired",
    });
  }

  const requiresPassword = !!share.password;

  res.status(200).json({
    success: true,
    data: {
      file: {
        name: share.file.name,
        size: share.file.size,
        mimeType: share.file.mimeType,
      },
      requiresPassword,
      downloadUrl: requiresPassword ? null : getAttachmentUrl(share.file),
    },
  });
});

// @route  POST /shares/public/:token/verify  (public, no auth)
// @body   { password }
export const verifyPublicSharePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const share = await Share.findOne({ token: req.params.token })
    .select("+password")
    .populate("file");

  if (!share || !share.file) {
    return res.status(404).json({
      success: false,
      message: "This link is invalid or has been removed",
    });
  }

  if (share.isExpired()) {
    return res.status(410).json({
      success: false,
      message: "This link has expired",
    });
  }

  if (!share.password) {
    return res.status(400).json({
      success: false,
      message: "This link doesn't require a password",
    });
  }

  const isMatch = await share.comparePassword(password || "");
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password",
    });
  }

  res.status(200).json({
    success: true,
    data: { downloadUrl: getAttachmentUrl(share.file) },
  });
});
