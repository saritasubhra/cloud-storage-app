import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      // Not required when the user signs up via Google OAuth (added in a later step)
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // never return password by default in queries
    },
    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // allows multiple docs with no googleId without violating uniqueness
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare a plain-text password against the hashed one
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive/internal fields whenever a user doc is sent as JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
