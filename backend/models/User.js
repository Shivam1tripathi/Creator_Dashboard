import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    credits: {
      type: Number,
      default: 0,
    },
    savedPosts: [
      {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
      },
    ],
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    bio: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
    },
    profilePicture: {
      data: Buffer,
      contentType: String,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
