import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
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
        title: String,
        image: String,
        link: String,
      },
    ],
    reportedPosts: [
      {
        title: String,
        image: String,
        link: String,
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
    skills: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
