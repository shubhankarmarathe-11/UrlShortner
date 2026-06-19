import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    Username: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      default: "",
    },
    EmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "customer",
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("usermodel", UserSchema);
