import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const shareSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
    // Optional - if set, the link can't be used without the right password
    password: {
      type: String,
      select: false,
    },
    // Optional - null/undefined means the link never expires
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

shareSchema.index({ owner: 1, file: 1 });

// Hash the password before saving, same pattern as the User model
shareSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

shareSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

shareSchema.methods.isExpired = function () {
  return !!this.expiresAt && this.expiresAt.getTime() < Date.now();
};

const Share = mongoose.model("Share", shareSchema);

export default Share;
